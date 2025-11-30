import { z } from "zod";

// ==================== ENUMS ====================
export const userRoles = ['student', 'owner', 'admin'] as const;
export const propertyTypes = ['apartment', 'house', 'studio', 'room', 'other'] as const;
export const propertyStatuses = ['available', 'pending', 'rented'] as const;
export const contractStatuses = ['pending', 'active', 'completed', 'cancelled'] as const;

// ==================== TEMPORARY EMAIL DOMAINS ====================
// Liste des domaines d'emails temporaires à bloquer
// Inclut les domaines principaux et leurs sous-domaines connus
export const TEMPORARY_EMAIL_DOMAINS = [
  // temp-mail.org et ses domaines associés
  'temp-mail.org',
  'feralrex.com',
  'bipochub.com',
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
  // Autres services d'emails temporaires
  'tempmail.com',
  'guerrillamail.com',
  'mailinator.com',
  '10minutemail.com',
  'throwaway.email',
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
  'tempinbox.co.uk',
  'trashmail.net',
  'trashmail.org',
  // Domaines supplémentaires connus
  'mail-temp.com',
  'tempmail.net',
  'tempmail.org',
  'tempmailaddress.com',
  'tempmailer.com',
  'tempmailer.de',
  'tempmailgenerator.com',
  'tempmailid.com',
  'tempmailid.net',
  'tempmailid.org',
  'tempmailo.org',
  'tempmails.net',
  'tempmails.org',
  'tempmailz.com',
  'tempomail.fr',
  'tempomail.org',
  'tempymail.com',
  'trash-mail.com',
  'trash-mail.de',
  'trash-mail.net',
  'trash-mail.org',
  'trashmail.at',
  'trashmail.com',
  'trashmail.de',
  'trashmail.fr',
  'trashmail.net',
  'trashmail.org',
  'trashmail.ws',
  'trashmailer.com',
  'trashmailer.de',
  'trashymail.com',
  'trialmail.de',
  'trialmail.org',
  'tyldd.com',
  'uggsrock.com',
  'umail.net',
  'uroid.com',
  'us.af',
  'venompen.com',
  'viditag.com',
  'viewyonder.com',
  'viewyonder.net',
  'viewyonder.org',
  'viewyonder.tv',
  'viewyonder.us',
  'viewyonder.ws',
  'viewyonder.info',
  'viewyonder.biz',
  'viewyonder.name',
  'viewyonder.mobi',
  'viewyonder.cc',
  'viewyonder.tk',
  'viewyonder.ml',
  'viewyonder.ga',
  'viewyonder.cf',
  'viewyonder.gq',
  'viewyonder.tk',
  'viewyonder.ml',
  'viewyonder.ga',
  'viewyonder.cf',
  'viewyonder.gq',
  'viewyonder.ninja',
  'viewyonder.xyz',
  'viewyonder.online',
  'viewyonder.site',
  'viewyonder.website',
  'viewyonder.tech',
  'viewyonder.store',
  'viewyonder.shop',
  'viewyonder.club',
  'viewyonder.fun',
  'viewyonder.top',
  'viewyonder.click',
  'viewyonder.link',
  'viewyonder.press',
  'viewyonder.download',
  'viewyonder.stream',
  'viewyonder.video',
  'viewyonder.space',
  'viewyonder.cloud',
  'viewyonder.host',
  'viewyonder.work',
  'viewyonder.party',
  'viewyonder.review',
  'viewyonder.accountant',
  'viewyonder.design',
  'viewyonder.photo',
  'viewyonder.help',
  'viewyonder.business',
  'viewyonder.email',
  'viewyonder.mail',
  'viewyonder.services',
  'viewyonder.solutions',
  'viewyonder.support',
  'viewyonder.systems',
  'viewyonder.technology',
  'viewyonder.today',
  'viewyonder.tools',
  'viewyonder.trade',
  'viewyonder.training',
  'viewyonder.travel',
  'viewyonder.university',
  'viewyonder.vip',
  'viewyonder.watch',
  'viewyonder.win',
  'viewyonder.world',
  'viewyonder.ws',
  'viewyonder.zone',
] as const;

/**
 * Vérifie si un email provient d'un domaine temporaire
 * Détecte les domaines exacts, sous-domaines et patterns suspects
 */
export function isTemporaryEmail(email: string): boolean {
  const domain = email.toLowerCase().split('@')[1];
  if (!domain) return false;
  
  // Vérifier si le domaine est exactement dans la liste noire
  if (TEMPORARY_EMAIL_DOMAINS.includes(domain as any)) {
    return true;
  }
  
  // Vérifier si le domaine est un sous-domaine d'un domaine temporaire
  // Ex: subdomain.temp-mail.org ou subdomain.feralrex.com
  const isSubdomain = TEMPORARY_EMAIL_DOMAINS.some(tempDomain => 
    domain.endsWith(`.${tempDomain}`)
  );
  if (isSubdomain) {
    return true;
  }
  
  // Détecter les patterns suspects de domaines temporaires
  // Les services comme temp-mail.org utilisent souvent des domaines avec des patterns spécifiques
  const suspiciousPatterns = [
    /^[a-z0-9]+\.(temp|tmp|trash|throw|fake|spam|disposable|mail-temp|tempmail)/i,
    /(temp|tmp|trash|throw|fake|spam|disposable|mail-temp|tempmail)[a-z0-9]*\.(com|org|net|io|me|co|info|xyz|online|site|website|tech|store|shop|club|fun|top|click|link|press|download|stream|video|space|cloud|host|work|party|review|accountant|design|photo|help|business|email|mail|services|solutions|support|systems|technology|today|tools|trade|training|travel|university|vip|watch|win|world|ws|zone)$/i,
  ];
  
  // Vérifier les patterns suspects
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(domain)) {
      return true;
    }
  }
  
  // Détecter les domaines avec des noms aléatoires courts (souvent utilisés par temp-mail.org)
  // Ex: feralrex.com, bipochub.com, mohmal.com, etc.
  const knownTempMailDomains = [
    'feralrex.com', 'bipochub.com', 'mohmal.com', 'getnada.com', 'maildrop.cc',
    'yopmail.com', 'sharklasers.com', 'grr.la', 'pokemail.net',
    'spam4.me', 'bccto.me', 'chitthi.in', 'dispostable.com',
  ];
  if (knownTempMailDomains.includes(domain)) {
    return true;
  }
  
  // Détecter les domaines courts avec patterns aléatoires (moins de 15 caractères)
  // qui sont souvent utilisés par les services d'emails temporaires comme temp-mail.org
  // temp-mail.org utilise des centaines de domaines courts avec des noms aléatoires
  if (domain.length < 15 && /^[a-z]{4,12}\.(com|org|net|io|me|co|cc|info|xyz)$/i.test(domain)) {
    // Vérifier si le domaine ressemble à un domaine temporaire
    // (noms aléatoires sans signification évidente)
    const suspiciousWords = ['temp', 'tmp', 'trash', 'throw', 'fake', 'spam', 'disposable', 'mail'];
    const hasSuspiciousWord = suspiciousWords.some(word => domain.includes(word));
    
    // Si le domaine est court (5-11 caractères avant l'extension) et ne contient pas de mots suspects
    // mais ressemble à un nom aléatoire, considérer comme suspect
    // Les domaines légitimes ont généralement des noms plus longs ou reconnaissables
    if (!hasSuspiciousWord && /^[a-z]{5,11}\.(com|org|net|io|me|co|cc|info|xyz)$/i.test(domain)) {
      // Vérifier si c'est un domaine connu de temp-mail.org
      if (knownTempMailDomains.includes(domain)) {
        return true;
      }
      
      // Détecter les patterns de noms aléatoires (consonnes/voyelles aléatoires)
      // Les domaines légitimes ont souvent des patterns reconnaissables
      // Les domaines temporaires ont souvent des combinaisons aléatoires de lettres
      const randomPattern = /^[bcdfghjklmnpqrstvwxyz]{3,}[aeiou]{1,2}[bcdfghjklmnpqrstvwxyz]{2,}\.(com|org|net|io|me|co|cc|info|xyz)$/i;
      if (randomPattern.test(domain)) {
        // Vérifier si le domaine est dans une liste de domaines légitimes connus
        // (liste blanche pour éviter les faux positifs)
        const legitimateShortDomains = [
          'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com',
          'protonmail.com', 'aol.com', 'zoho.com', 'mail.com', 'yandex.com',
          'gmx.com', 'live.com', 'msn.com', 'me.com', 'mac.com',
        ];
        if (!legitimateShortDomains.some(legit => domain === legit || domain.endsWith(`.${legit}`))) {
          // C'est probablement un domaine temporaire
          return true;
        }
      }
    }
  }
  
  return false;
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

/**
 * Valide un numéro de téléphone suisse
 * Formats acceptés: +41XXXXXXXXX, 0041XXXXXXXXX, 0XXXXXXXXX
 */
export function isValidSwissPhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') {
    return false;
  }
  
  // Nettoyer le numéro (retirer espaces, tirets, parenthèses)
  const cleaned = phone.replace(/[\s\-\(\)\.]/g, '');
  
  // Patterns valides pour les numéros suisses
  const swissPatterns = [
    /^\+41[1-9][0-9]{8}$/,       // +41 suivi de 9 chiffres
    /^0041[1-9][0-9]{8}$/,       // 0041 suivi de 9 chiffres
    /^0[1-9][0-9]{8}$/,          // 0 suivi de 9 chiffres
  ];
  
  return swissPatterns.some(pattern => pattern.test(cleaned));
}

/**
 * Vérifie que le numéro n'est pas un numéro bidon/test
 */
export function isNotFakePhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') {
    return false;
  }
  
  const cleaned = phone.replace(/[\s\-\(\)\.+]/g, '');
  
  // Extraire seulement les chiffres significatifs (sans l'indicatif pays)
  let significantDigits = cleaned;
  if (significantDigits.startsWith('41')) {
    significantDigits = significantDigits.substring(2);
  } else if (significantDigits.startsWith('0041')) {
    significantDigits = significantDigits.substring(4);
  } else if (significantDigits.startsWith('0')) {
    significantDigits = significantDigits.substring(1);
  }
  
  // Vérifier que ce n'est pas trop court
  if (significantDigits.length < 9) {
    return false;
  }
  
  // Vérifier que ce n'est pas uniquement des chiffres répétés
  if (/^(.)\1+$/.test(significantDigits)) {
    return false;
  }
  
  // Vérifier que ce n'est pas une séquence simple
  const sequencePatterns = [
    '123456789', '234567890', '987654321', '098765432', '012345678',
    '111111111', '222222222', '333333333', '444444444', '555555555',
    '666666666', '777777777', '888888888', '999999999', '000000000',
  ];
  
  if (sequencePatterns.includes(significantDigits)) {
    return false;
  }
  
  // Vérifier que le numéro contient au moins 4 chiffres différents
  const uniqueDigits = new Set(significantDigits);
  if (uniqueDigits.size < 4) {
    return false;
  }
  
  return true;
}

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
  phone: z.string()
    .optional()
    .refine((phone) => {
      // Si le téléphone est vide ou non fourni, c'est ok (optionnel)
      if (!phone || phone.trim() === '') return true;
      // Sinon, vérifier le format suisse
      return isValidSwissPhone(phone);
    }, {
      message: 'Format de numéro de téléphone suisse invalide. Utilisez +41 XX XXX XX XX ou 0XX XXX XX XX',
    })
    .refine((phone) => {
      // Si le téléphone est vide ou non fourni, c'est ok
      if (!phone || phone.trim() === '') return true;
      // Sinon, vérifier que ce n'est pas un numéro bidon
      return isNotFakePhone(phone);
    }, {
      message: 'Ce numéro de téléphone n\'est pas valide. Veuillez entrer un vrai numéro de téléphone.',
    }),
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
  charges: z.number().nullable().optional(),
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
  profile_picture: z.string().nullable().optional(),
});

/**
 * Valide que la description semble correcte:
 * - Contient des espaces (donc plusieurs mots)
 * - N'est pas seulement des caractères répétés
 * - A une longueur minimale significative
 */
function validateDescription(description: string): boolean {
  // Vérifier la longueur minimale
  if (description.length < 20) {
    return false;
  }

  // Vérifier qu'il y a des espaces (donc plusieurs mots)
  if (!description.includes(' ')) {
    return false;
  }

  // Vérifier qu'il n'y a pas seulement des espaces
  const trimmed = description.trim();
  if (trimmed.length < 20) {
    return false;
  }

  // Vérifier qu'il y a au moins 2 mots (séparés par des espaces)
  const words = trimmed.split(/\s+/).filter(word => word.length > 0);
  if (words.length < 2) {
    return false;
  }

  // Vérifier qu'il n'y a pas seulement des caractères répétés (ex: "aaaaaaaaaa aaaaaaaa")
  const uniqueChars = new Set(trimmed.replace(/\s/g, ''));
  if (uniqueChars.size < 3) {
    return false;
  }

  // Vérifier qu'il y a au moins quelques mots de longueur raisonnable
  const meaningfulWords = words.filter(word => word.length >= 2);
  if (meaningfulWords.length < 2) {
    return false;
  }

  return true;
}

export const createPropertySchema = z.object({
  title: z.string().min(5),
  description: z.string()
    .min(20, 'La description doit contenir au moins 20 caractères')
    .refine(validateDescription, {
      message: 'La description doit contenir plusieurs mots séparés par des espaces. Veuillez fournir une description détaillée de votre propriété.',
    }),
  property_type: z.enum(propertyTypes),
  address: z.string().min(5),
  city_id: z.number().optional(),
  city_name: z.string().min(2),
  postal_code: z.string()
    .length(4, 'Le code postal doit contenir exactement 4 chiffres')
    .regex(/^\d{4}$/, 'Le code postal doit contenir uniquement des chiffres'),
  canton_code: z.string().length(2),
  price: z.number().positive(),
  charges: z.number().nonnegative(),
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
  charges: z.number().nullable().optional(),
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
  is_editable: z.boolean().optional(),
  edited_by: z.number().nullable().optional(),
});

export const createContractSchema = z.object({
  property_id: z.number(),
  owner_id: z.number().optional(),
  student_id: z.number().optional(),
  conversation_id: z.number().optional(),
  monthly_rent: z.number().positive(),
  charges: z.number().nonnegative().optional(),
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
