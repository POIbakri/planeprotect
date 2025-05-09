import { supabase } from './supabase';
import { cache } from '../cache';
import { logger } from '../logger';
import type { 
  Claim, 
  ClaimDocument, 
  ClaimStatus,
  PaginatedResponse,
  ClaimFilters
} from '../types';

const CACHE_TTL = {
  claims: 2 * 60 * 1000, // 2 minutes
  claimStatus: 30 * 1000, // 30 seconds
};

export async function getUserClaims(
  page = 1,
  limit = 10
): Promise<PaginatedResponse<Claim>> {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) throw new Error('Authentication required');

  const cacheKey = `claims:user:${user.id}:${page}:${limit}`;

  return cache.get(cacheKey, async () => {
    const { data, error, count } = await supabase
      .from('claims')
      .select('*, claim_documents(*)', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) {
      logger.error('Failed to fetch user claims', error);
      throw error;
    }

    return { 
      data: data || [], 
      count: count || 0, 
      page, 
      limit 
    };
  }, { ttl: CACHE_TTL.claims });
}

export async function getClaimStatus(claimId: string): Promise<Claim> {
  const cacheKey = `claim:${claimId}`;

  return cache.get(cacheKey, async () => {
    const { data, error } = await supabase
      .from('claims')
      .select('*, claim_documents(*)')
      .eq('id', claimId)
      .single();

    if (error) {
      logger.error('Failed to fetch claim status', error);
      throw error;
    }

    return data;
  }, { ttl: CACHE_TTL.claimStatus });
}

export async function updateClaimStatus(
  claimId: string, 
  status: ClaimStatus
): Promise<void> {
  try {
    const { error } = await supabase
      .from('claims')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', claimId);

    if (error) throw error;

    // Invalidate caches
    cache.invalidate(`claim:${claimId}`);
    cache.invalidate('claims:user:');
  } catch (error) {
    logger.error('Failed to update claim status', error as Error);
    throw error;
  }
}

export async function getAllClaims(
  page = 1,
  limit = 10,
  filters?: ClaimFilters
): Promise<PaginatedResponse<Claim>> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Authentication required');

  const { data: adminData } = await supabase
    .from('admins')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!adminData) {
    throw new Error('Unauthorized: Admin access required');
  }

  let query = supabase
    .from('claims')
    .select('*, claim_documents(*)', { count: 'exact' });

  // Apply filters if provided
  if (filters) {
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    
    if (filters.search) {
      query = query.or(`flight_number.ilike.%${filters.search}%,passenger_name.ilike.%${filters.search}%`);
    }
    
    if (filters.startDate) {
      query = query.gte('flight_date', filters.startDate);
    }
    
    if (filters.endDate) {
      query = query.lte('flight_date', filters.endDate);
    }
    
    // Apply sorting
    if (filters.sortBy) {
      query = query.order(filters.sortBy, { 
        ascending: filters.sortDirection === 'asc' 
      });
    } else {
      query = query.order('created_at', { ascending: false });
    }
  } else {
    query = query.order('created_at', { ascending: false });
  }
  
  // Apply pagination
  query = query.range((page - 1) * limit, page * limit - 1);

  const { data, error, count } = await query;

  if (error) {
    logger.error('Failed to fetch all claims', error);
    throw error;
  }

  return {
    data: data || [],
    count: count || 0,
    page,
    limit,
  };
}

export async function uploadClaimDocument(
  claimId: string,
  file: File,
  type: ClaimDocument['type']
): Promise<void> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${claimId}/${type}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('claim-documents')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { error: dbError } = await supabase
      .from('claim_documents')
      .insert([{
        claim_id: claimId,
        type,
        file_path: fileName,
      }]);

    if (dbError) throw dbError;

    // Invalidate caches
    cache.invalidate(`claim:${claimId}`);
  } catch (error) {
    logger.error('Failed to upload document', error as Error);
    throw error;
  }
}

export async function uploadAssignmentForm(
  claimId: string,
  file: Blob,
  fileName: string
): Promise<string> {
  try {
    // Upload the assignment form PDF to storage
    const storageFileName = `${claimId}/assignment-form-${Date.now()}.pdf`;
    
    const { error: uploadError, data } = await supabase.storage
      .from('claim-documents')
      .upload(storageFileName, file, {
        contentType: 'application/pdf',
        upsert: true
      });

    if (uploadError) throw uploadError;

    // Get the public URL for the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from('claim-documents')
      .getPublicUrl(storageFileName);

    // Update claim record with assignment form status and URL
    const { error: updateError } = await supabase
      .from('claims')
      .update({ 
        assignment_form_signed: true,
        assignment_form_url: publicUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', claimId);

    if (updateError) throw updateError;

    // Invalidate caches
    cache.invalidate(`claim:${claimId}`);
    cache.invalidate('claims:user:');
    
    return publicUrl;
  } catch (error) {
    logger.error('Failed to upload assignment form', error as Error);
    throw error;
  }
}