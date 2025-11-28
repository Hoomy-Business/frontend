/**
 * Validation schemas for all user inputs
 * Uses Zod for strict type-safe validation
 */

import { z } from 'zod';

// =============================================================================
// COMMON SCHEMAS
// =============================================================================

/**
 * Sanitized string - removes potentially dangerous content
 */
const sanitizedString = z.string().transform((val) => {
  return val
    .replace(/\0/g, '') // Remove null bytes
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
    .replace(/\bon\w+\s*=/gi, '') // Remove event handlers
    .replace(/javascript:/gi, '') // Remove javascript: URIs
    .trim();
});

/**
 * Email validation
 */
export const emailSchema = z
  .string()
  .min(1, 'Email requis')
  .max(254, 'Email trop long')
  .email('Email invalide')
  .toLowerCase()
  .transform((val) => val.trim());

/**
 * Strong password validation
 */
export const passwordSchema = z
  .string()
  .min(8, 'Minimum 8 caractères')
  .max(128, 'Maximum 128 caractères')
  .refine((val) => /[a-z]/.test(val), 'Doit contenir une minuscule')
  .refine((val) => /[A-Z]/.test(val), 'Doit contenir une majuscule')
  .refine((val) => /[0-9]/.test(val), 'Doit contenir un chiffre')
  .refine((val) => /[^a-zA-Z0-9]/.test(val), 'Doit contenir un caractère spécial');

/**
 * Simple password (for login - less strict)
 */
export const loginPasswordSchema = z
  .string()
  .min(1, 'Mot de passe requis')
  .max(128, 'Mot de passe trop long');

/**
 * Swiss phone number
 */
export const swissPhoneSchema = z
  .string()
  .transform((val) => val.replace(/\s+/g, ''))
  .refine(
    (val) => /^(\+41|0041|0)[1-9][0-9]{8}$/.test(val),
    'Numéro de téléphone suisse invalide'
  );

/**
 * Optional Swiss phone
 */
export const optionalSwissPhoneSchema = z
  .string()
  .optional()
  .transform((val) => val?.replace(/\s+/g, '') || '')
  .refine(
    (val) => !val || /^(\+41|0041|0)[1-9][0-9]{8}$/.test(val),
    'Numéro de téléphone suisse invalide'
  );

/**
 * Swiss postal code
 */
export const swissPostalCodeSchema = z
  .string()
  .regex(/^[1-9][0-9]{3}$/, 'Code postal suisse invalide (4 chiffres)');

/**
 * Swiss canton code
 */
export const cantonCodeSchema = z
  .string()
  .length(2, 'Code canton invalide')
  .toUpperCase()
  .refine(
    (val) => [
      'AG', 'AR', 'AI', 'BL', 'BS', 'BE', 'FR', 'GE', 'GL', 'GR',
      'JU', 'LU', 'NE', 'NW', 'OW', 'SG', 'SH', 'SO', 'SZ', 'TG',
      'TI', 'UR', 'VS', 'VD', 'ZG', 'ZH'
    ].includes(val),
    'Code canton invalide'
  );

/**
 * Safe URL
 */
export const safeUrlSchema = z
  .string()
  .url('URL invalide')
  .refine(
    (val) => !val.startsWith('javascript:') && !val.startsWith('data:'),
    'URL non autorisée'
  );

/**
 * Price (positive number)
 */
export const priceSchema = z
  .number()
  .min(0, 'Le prix doit être positif')
  .max(100000, 'Prix trop élevé');

/**
 * Surface area
 */
export const surfaceSchema = z
  .number()
  .min(1, 'Surface minimale: 1 m²')
  .max(10000, 'Surface trop grande');

/**
 * Number of rooms
 */
export const roomsSchema = z
  .number()
  .int('Nombre entier requis')
  .min(1, 'Minimum 1 pièce')
  .max(50, 'Maximum 50 pièces');

// =============================================================================
// AUTHENTICATION SCHEMAS
// =============================================================================

/**
 * Login form validation
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: loginPasswordSchema,
});

/**
 * Registration form validation
 */
export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Confirmation requise'),
  firstName: sanitizedString.pipe(
    z.string().min(1, 'Prénom requis').max(100, 'Prénom trop long')
  ),
  lastName: sanitizedString.pipe(
    z.string().min(1, 'Nom requis').max(100, 'Nom trop long')
  ),
  role: z.enum(['student', 'owner'], {
    errorMap: () => ({ message: 'Rôle invalide' }),
  }),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: 'Vous devez accepter les conditions' }),
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

/**
 * Password reset request
 */
export const passwordResetRequestSchema = z.object({
  email: emailSchema,
});

/**
 * Password reset (with token)
 */
export const passwordResetSchema = z.object({
  token: z.string().min(1, 'Token requis'),
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Confirmation requise'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

// =============================================================================
// PROPERTY SCHEMAS
// =============================================================================

/**
 * Property type enum
 */
export const propertyTypeSchema = z.enum([
  'apartment',
  'house',
  'studio',
  'room',
  'other',
], {
  errorMap: () => ({ message: 'Type de propriété invalide' }),
});

/**
 * Property creation/edit
 */
export const propertySchema = z.object({
  title: sanitizedString.pipe(
    z.string()
      .min(5, 'Titre trop court (minimum 5 caractères)')
      .max(200, 'Titre trop long (maximum 200 caractères)')
  ),
  description: sanitizedString.pipe(
    z.string()
      .min(20, 'Description trop courte (minimum 20 caractères)')
      .max(5000, 'Description trop longue (maximum 5000 caractères)')
  ),
  price: priceSchema,
  address: sanitizedString.pipe(
    z.string()
      .min(5, 'Adresse trop courte')
      .max(300, 'Adresse trop longue')
  ),
  city_id: z.number().int().positive('Ville requise'),
  canton_code: cantonCodeSchema,
  postal_code: swissPostalCodeSchema,
  property_type: propertyTypeSchema,
  rooms: roomsSchema.optional(),
  bathrooms: z.number().int().min(0).max(20).optional(),
  surface_area: surfaceSchema.optional(),
  available_from: z.string().datetime().optional(),
  available_until: z.string().datetime().optional(),
  amenities: z.array(z.string().max(100)).max(50).optional(),
});

/**
 * Property search filters
 */
export const propertySearchSchema = z.object({
  canton: cantonCodeSchema.optional(),
  city_id: z.coerce.number().int().positive().optional(),
  property_type: propertyTypeSchema.optional(),
  min_price: z.coerce.number().min(0).optional(),
  max_price: z.coerce.number().max(100000).optional(),
  min_rooms: z.coerce.number().int().min(1).optional(),
  search: sanitizedString.pipe(z.string().max(200)).optional(),
}).refine(
  (data) => !data.min_price || !data.max_price || data.min_price <= data.max_price,
  {
    message: 'Le prix minimum doit être inférieur au prix maximum',
    path: ['min_price'],
  }
);

// =============================================================================
// MESSAGE SCHEMAS
// =============================================================================

/**
 * Message content
 */
export const messageSchema = z.object({
  content: sanitizedString.pipe(
    z.string()
      .min(1, 'Message requis')
      .max(10000, 'Message trop long (maximum 10000 caractères)')
  ),
  recipient_id: z.number().int().positive('Destinataire requis'),
  property_id: z.number().int().positive().optional(),
});

// =============================================================================
// CONTRACT SCHEMAS
// =============================================================================

/**
 * Contract creation
 */
export const contractSchema = z.object({
  property_id: z.number().int().positive('Propriété requise'),
  start_date: z.string().datetime('Date de début invalide'),
  end_date: z.string().datetime('Date de fin invalide'),
  monthly_rent: priceSchema,
  deposit: priceSchema,
  terms: sanitizedString.pipe(z.string().max(50000)).optional(),
}).refine(
  (data) => new Date(data.start_date) < new Date(data.end_date),
  {
    message: 'La date de fin doit être après la date de début',
    path: ['end_date'],
  }
);

// =============================================================================
// PROFILE SCHEMAS
// =============================================================================

/**
 * Profile update
 */
export const profileUpdateSchema = z.object({
  first_name: sanitizedString.pipe(
    z.string().min(1, 'Prénom requis').max(100, 'Prénom trop long')
  ).optional(),
  last_name: sanitizedString.pipe(
    z.string().min(1, 'Nom requis').max(100, 'Nom trop long')
  ).optional(),
  phone: optionalSwissPhoneSchema,
  bio: sanitizedString.pipe(z.string().max(1000, 'Bio trop longue')).optional(),
});

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Validate data with schema and return result
 */
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  errors?: z.ZodError['errors'];
} {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  return { success: false, errors: result.error.errors };
}

/**
 * Get first error message from validation result
 */
export function getFirstError(errors: z.ZodError['errors']): string {
  const firstError = errors[0];
  if (!firstError) return 'Données invalides';
  
  return firstError.message;
}

/**
 * Format validation errors for display
 */
export function formatErrors(errors: z.ZodError['errors']): Record<string, string> {
  const formatted: Record<string, string> = {};
  
  for (const error of errors) {
    const path = error.path.join('.');
    if (path && !formatted[path]) {
      formatted[path] = error.message;
    }
  }
  
  return formatted;
}

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type PropertyInput = z.infer<typeof propertySchema>;
export type PropertySearchInput = z.infer<typeof propertySearchSchema>;
export type MessageInput = z.infer<typeof messageSchema>;
export type ContractInput = z.infer<typeof contractSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

