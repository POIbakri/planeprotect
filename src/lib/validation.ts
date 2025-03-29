import { z } from 'zod';
import { VALIDATION_RULES } from './constants';

// User validation schemas
export const userSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\w\W]{8,}$/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
});

// Claim validation schemas
export const claimSubmissionSchema = z.object({
  flightNumber: z
    .string()
    .regex(
      VALIDATION_RULES.flightNumber,
      'Invalid flight number format (e.g., BA1234)'
    ),
  flightDate: z.string().refine(
    (date) => {
      const parsed = new Date(date);
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      return parsed >= threeMonthsAgo && parsed <= new Date();
    },
    { message: 'Flight date must be within the last 3 months' }
  ),
  fullName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long'),
  email: z.string().email('Invalid email address'),
  phone: z
    .string()
    .regex(VALIDATION_RULES.phone, 'Invalid phone number format'),
  passportNumber: z
    .string()
    .regex(
      VALIDATION_RULES.passportNumber,
      'Invalid passport number format'
    ),
  compensationAmount: z
    .number()
    .min(0, 'Compensation amount must be positive')
    .max(10000, 'Compensation amount exceeds maximum limit'),
});

export const documentUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 10 * 1024 * 1024, 'File size must be less than 10MB')
    .refine(
      (file) => ['application/pdf', 'image/jpeg', 'image/png'].includes(file.type),
      'Only PDF, JPEG, and PNG files are allowed'
    ),
  type: z.enum(['boarding_pass', 'booking_confirmation', 'passport']),
});

// API validation schemas
export const apiErrorSchema = z.object({
  message: z.string(),
  code: z.string(),
  details: z.unknown().optional(),
});

export const paginationSchema = z.object({
  page: z.number().int().positive(),
  limit: z.number().int().positive().max(50),
});

export const claimFiltersSchema = z.object({
  status: z.enum(['pending', 'in-review', 'approved', 'paid']).optional(),
  search: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

// Validation helper functions
export function validateClaimSubmission(data: unknown) {
  return claimSubmissionSchema.parse(data);
}

export function validateDocumentUpload(file: File, type: string) {
  return documentUploadSchema.parse({ file, type });
}

export function validatePagination(page: unknown, limit: unknown) {
  return paginationSchema.parse({ page, limit });
}

export function validateClaimFilters(filters: unknown) {
  return claimFiltersSchema.parse(filters);
}