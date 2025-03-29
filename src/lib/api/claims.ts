import { supabase } from './supabase';
import { cache } from '../cache';
import { logger } from '../logger';
import type { 
  Claim, 
  ClaimDocument, 
  ClaimStatus,
  PaginatedResponse 
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
  limit = 10
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

  const { data, error, count } = await supabase
    .from('claims')
    .select('*, claim_documents(*)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

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