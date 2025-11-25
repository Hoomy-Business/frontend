import { z } from "zod";

// ==================== ENUMS ====================
export const userRoles = ['student', 'owner', 'admin'] as const;
export const propertyTypes = ['apartment', 'house', 'studio', 'room', 'other'] as const;
export const propertyStatuses = ['available', 'pending', 'rented'] as const;
export const contractStatuses = ['pending', 'active', 'completed', 'cancelled'] as const;

// ==================== TEMPORARY EMAIL DOMAINS ====================
// Liste des domaines d'emails temporaires à bloquer
export const TEMPORARY_EMAIL_DOMAINS = [
  'temp-mail.org',
  'tempmail.com',
  'guerrillamail.com',
  'mailinator.com',
  '10minutemail.com',
  'throwaway.email',
  'tempail.com',
  'mohmal.com',
  'getnada.com',
  'maildrop.cc',
  'yopmail.com',
  'sharklasers.com',
  'grr.la',
  'guerrillamailblock.com',
  'pokemail.net',
  'spam4.me',
  'bccto.me',
  'chitthi.in',
  'dispostable.com',
  'mintemail.com',
  'mytrashmail.com',
  'tempinbox.com',
  'trashmail.com',
  'trashmailer.com',
  'throwawaymail.com',
  'getairmail.com',
  'tempmailo.com',
  'fakeinbox.com',
  'emailondeck.com',
  'mailcatch.com',
  'meltmail.com',
  'melt.li',
  'mox.do',
  'temp-mail.io',
  'temp-mail.ru',
  'tempail.com',
  'tempr.email',
  'tmpmail.org',
  'tmpmail.net',
  'tmpmail.com',
  'tmpmail.io',
  'tmpmail.me',
  'tmpmail.org',
  'tmpmail.net',
  'tmpmail.com',
  'tmpmail.io',
  'tmpmail.me',
  '0-mail.com',
  '33mail.com',
  '4warding.com',
  '4warding.net',
  '4warding.org',
  'armyspy.com',
  'cuvox.de',
  'dayrep.com',
  'einrot.com',
  'fleckens.hu',
  'gustr.com',
  'jourrapide.com',
  'rhyta.com',
  'superrito.com',
  'teleworm.us',
  'emailfake.com',
  'fakemailgenerator.com',
  'mailnesia.com',
  'mailcatch.com',
  'mintemail.com',
  'mytrashmail.com',
  'tempinbox.co.uk',
  'tempinbox.com',
  'trashmail.com',
  'trashmail.net',
  'trashmail.org',
  'trashmailer.com',
  'throwawaymail.com',
  'getairmail.com',
  'tempmailo.com',
  'fakeinbox.com',
  'emailondeck.com',
  'mailcatch.com',
  'meltmail.com',
  'melt.li',
  'mox.do',
  'temp-mail.io',
  'temp-mail.ru',
  'tempail.com',
  'tempr.email',
  'tmpmail.org',
  'tmpmail.net',
  'tmpmail.com',
  'tmpmail.io',
  'tmpmail.me',
] as const;

/**
 * Vérifie si un email provient d'un domaine temporaire
 */
export function isTemporaryEmail(email: string): boolean {
  const domain = email.toLowerCase().split('@')[1];
  if (!domain) return false;
  
  // Vérifier si le domaine est dans la liste noire
  return TEMPORARY_EMAIL_DOMAINS.some(tempDomain => 
    domain === tempDomain || domain.endsWith(`.${tempDomain}`)
  );
}

// ==================== USER SCHEMAS ====================
export const userSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  first_name: z.string(),
  last_name: z.string(),
  role: z.enum(userRoles),
  phone: z.string().nullable(),
  email_verified: z.boolean(),
  phone_verified: z.boolean(),
  date_of_birth: z.string().nullable(),
  profile_picture: z.string().nullable(),
  created_at: z.string(),
});

export const registerSchema = z.object({
  email: z.string()
    .email('Adresse email invalide')
    .refine((email) => !isTemporaryEmail(email), {
      message: 'Les adresses email temporaires ne sont pas autorisées. Veuillez utiliser une adresse email permanente.',
    }),
  password: z.string().min(8),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  role: z.enum(['student', 'owner']),
  phone: z.string().optional(),
  date_of_birth: z.string(),
  terms_accepted: z.boolean(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const verifyEmailSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
});

// ==================== LOCATION SCHEMAS ====================
export const cantonSchema = z.object({
  id: z.number(),
  code: z.string(),
  name_fr: z.string(),
  name_de: z.string(),
});

export const citySchema = z.object({
  id: z.number(),
  name: z.string(),
  canton_code: z.string(),
  postal_code: z.string(),
  is_university_city: z.boolean(),
  canton_name: z.string().optional(),
});

// ==================== PROPERTY SCHEMAS ====================
export const propertyPhotoSchema = z.object({
  id: z.number(),
  property_id: z.number(),
  photo_url: z.string(),
  is_main: z.boolean(),
});

export const propertySchema = z.object({
  id: z.number(),
  owner_id: z.number(),
  title: z.string(),
  description: z.string().nullable(),
  property_type: z.enum(propertyTypes),
  address: z.string(),
  city_id: z.number().nullable(),
  city_name: z.string(),
  postal_code: z.string(),
  canton_code: z.string(),
  canton_name: z.string().optional(),
  price: z.number(),
  rooms: z.number().nullable(),
  bathrooms: z.number().nullable(),
  surface_area: z.number().nullable(),
  available_from: z.string().nullable(),
  status: z.enum(propertyStatuses),
  created_at: z.string(),
  updated_at: z.string(),
  main_photo: z.string().nullable(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().nullable().optional(),
  email_verified: z.boolean().optional(),
  phone_verified: z.boolean().optional(),
});

export const createPropertySchema = z.object({
  title: z.string().min(5),
  description: z.string().min(20),
  property_type: z.enum(propertyTypes),
  address: z.string().min(5),
  city_id: z.number().optional(),
  city_name: z.string().min(2),
  postal_code: z.string().length(4),
  canton_code: z.string().length(2),
  price: z.number().positive(),
  rooms: z.number().positive().optional(),
  bathrooms: z.number().int().positive().optional(),
  surface_area: z.number().positive().optional(),
  available_from: z.string().optional(),
});

// ==================== MESSAGE SCHEMAS ====================
export const messageSchema = z.object({
  id: z.number(),
  conversation_id: z.number(),
  sender_id: z.number(),
  content: z.string(),
  read_at: z.string().nullable(),
  created_at: z.string(),
});

export const conversationSchema = z.object({
  id: z.number(),
  property_id: z.number().nullable(),
  student_id: z.number(),
  owner_id: z.number(),
  last_message_at: z.string(),
  created_at: z.string(),
  property_title: z.string().optional(),
  property_photo: z.string().nullable().optional(),
  other_user_name: z.string().optional(),
  other_user_email: z.string().optional(),
  last_message: z.string().optional(),
  unread_count: z.number().optional(),
});

export const sendMessageSchema = z.object({
  conversation_id: z.number(),
  content: z.string().min(1),
});

// ==================== CONTRACT SCHEMAS ====================
export const contractSchema = z.object({
  id: z.number(),
  property_id: z.number(),
  student_id: z.number(),
  owner_id: z.number(),
  conversation_id: z.number().nullable(),
  monthly_rent: z.number(),
  hoomy_commission: z.number(),
  owner_payout: z.number(),
  start_date: z.string(),
  end_date: z.string(),
  deposit_amount: z.number(),
  status: z.enum(contractStatuses),
  stripe_subscription_id: z.string().nullable(),
  contract_signed_at: z.string().nullable(),
  created_at: z.string(),
  property_title: z.string().optional(),
  city_name: z.string().optional(),
  main_photo: z.string().nullable().optional(),
  student_first_name: z.string().optional(),
  student_last_name: z.string().optional(),
  owner_first_name: z.string().optional(),
  owner_last_name: z.string().optional(),
});

export const createContractSchema = z.object({
  property_id: z.number(),
  owner_id: z.number().optional(),
  student_id: z.number().optional(),
  conversation_id: z.number().optional(),
  monthly_rent: z.number().positive(),
  start_date: z.string(),
  end_date: z.string(),
  deposit_amount: z.number().nonnegative().optional(),
});

// ==================== STRIPE SCHEMAS ====================
export const stripeAccountStatusSchema = z.object({
  success: z.boolean(),
  has_account: z.boolean(),
  onboarding_complete: z.boolean().optional(),
  payouts_enabled: z.boolean().optional(),
  charges_enabled: z.boolean().optional(),
});

// ==================== TYPE EXPORTS ====================
export type User = z.infer<typeof userSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;

export type Canton = z.infer<typeof cantonSchema>;
export type City = z.infer<typeof citySchema>;

export type Property = z.infer<typeof propertySchema>;
export type PropertyPhoto = z.infer<typeof propertyPhotoSchema>;
export type CreatePropertyInput = z.infer<typeof createPropertySchema>;

export type Message = z.infer<typeof messageSchema>;
export type Conversation = z.infer<typeof conversationSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;

export type Contract = z.infer<typeof contractSchema>;
export type CreateContractInput = z.infer<typeof createContractSchema>;

export type StripeAccountStatus = z.infer<typeof stripeAccountStatusSchema>;

// ==================== KYC SCHEMAS ====================
export const kycStatusSchema = z.object({
  id: z.number().optional(),
  status: z.enum(['not_submitted', 'pending', 'approved', 'rejected']),
  is_verified: z.boolean(),
  kyc_verified: z.boolean(),
  id_card_front_url: z.string().nullable().optional(),
  id_card_back_url: z.string().nullable().optional(),
  selfie_url: z.string().nullable().optional(),
  rejection_reason: z.string().nullable().optional(),
  submitted_at: z.string().nullable().optional(),
  reviewed_at: z.string().nullable().optional(),
});

export type KYCStatus = z.infer<typeof kycStatusSchema>;

// ==================== ADMIN KYC SCHEMAS ====================
export const adminKYCSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  first_name: z.string(),
  last_name: z.string(),
  email: z.string(),
  role: z.string(),
  id_card_front_url: z.string().nullable(),
  id_card_back_url: z.string().nullable(),
  selfie_url: z.string().nullable(),
  status: z.enum(['pending', 'approved', 'rejected']),
  rejection_reason: z.string().nullable(),
  submitted_at: z.string(),
  reviewed_at: z.string().nullable(),
  user_created_at: z.string(),
});

export type AdminKYC = z.infer<typeof adminKYCSchema>;

// ==================== AUTH RESPONSE TYPES ====================
export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface ApiError {
  error: string;
  code?: string;
  details?: string;
}
