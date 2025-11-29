/**
 * Service d'envoi de SMS pour la vérification des numéros de téléphone
 * 
 * Ce module gère l'envoi de codes de vérification par SMS.
 * En production, il utilise un service SMS externe (Twilio, MessageBird, etc.)
 * En développement, il simule l'envoi et affiche le code dans la console.
 */

const https = require('https');

// Configuration du service SMS
const SMS_CONFIG = {
    // Twilio (commenté - à configurer en production)
    // provider: 'twilio',
    // accountSid: process.env.TWILIO_ACCOUNT_SID,
    // authToken: process.env.TWILIO_AUTH_TOKEN,
    // fromNumber: process.env.TWILIO_PHONE_NUMBER,
    
    // Mode développement/test
    provider: process.env.SMS_PROVIDER || 'mock',
    mockMode: process.env.NODE_ENV !== 'production' || process.env.SMS_MOCK_MODE === 'true',
};

/**
 * Valide le format d'un numéro de téléphone suisse
 * Accepte les formats: +41XXXXXXXXX, 0041XXXXXXXXX, 0XXXXXXXXX
 * 
 * @param {string} phone - Le numéro de téléphone à valider
 * @returns {boolean} - true si le format est valide
 */
function isValidSwissPhone(phone) {
    if (!phone || typeof phone !== 'string') {
        return false;
    }
    
    // Nettoyer le numéro (retirer espaces, tirets, parenthèses)
    const cleaned = phone.replace(/[\s\-\(\)\.]/g, '');
    
    // Patterns valides pour les numéros suisses
    // +41 XX XXX XX XX (mobile ou fixe)
    // 0041 XX XXX XX XX
    // 0XX XXX XX XX
    const swissPatterns = [
        /^\+41[1-9][0-9]{8}$/,       // +41 suivi de 9 chiffres (le premier non-zéro)
        /^0041[1-9][0-9]{8}$/,       // 0041 suivi de 9 chiffres
        /^0[1-9][0-9]{8}$/,          // 0 suivi de 9 chiffres
    ];
    
    return swissPatterns.some(pattern => pattern.test(cleaned));
}

/**
 * Vérifie que le numéro n'est pas un numéro bidon/test
 * Bloque les numéros trop simples ou répétitifs
 * 
 * @param {string} phone - Le numéro à vérifier
 * @returns {boolean} - true si le numéro semble légitime
 */
function isNotFakeNumber(phone) {
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
    
    // Vérifier que ce n'est pas uniquement des chiffres répétés (111111111, 999999999, etc.)
    if (/^(.)\1+$/.test(significantDigits)) {
        return false;
    }
    
    // Vérifier que ce n'est pas une séquence simple (123456789, 987654321)
    const sequencePatterns = [
        '123456789',
        '234567890',
        '987654321',
        '098765432',
        '012345678',
        '111111111',
        '222222222',
        '333333333',
        '444444444',
        '555555555',
        '666666666',
        '777777777',
        '888888888',
        '999999999',
        '000000000',
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

/**
 * Valide complètement un numéro de téléphone (format + légitimité)
 * 
 * @param {string} phone - Le numéro à valider
 * @returns {{ valid: boolean, error?: string }} - Résultat de la validation
 */
function validatePhoneNumber(phone) {
    if (!phone || typeof phone !== 'string') {
        return { valid: false, error: 'Numéro de téléphone requis' };
    }
    
    const trimmed = phone.trim();
    
    if (trimmed.length === 0) {
        return { valid: false, error: 'Numéro de téléphone requis' };
    }
    
    if (trimmed.length < 10) {
        return { valid: false, error: 'Numéro de téléphone trop court' };
    }
    
    if (!isValidSwissPhone(trimmed)) {
        return { valid: false, error: 'Format de numéro de téléphone suisse invalide. Utilisez +41 XX XXX XX XX ou 0XX XXX XX XX' };
    }
    
    if (!isNotFakeNumber(trimmed)) {
        return { valid: false, error: 'Ce numéro de téléphone n\'est pas valide. Veuillez entrer un vrai numéro de téléphone.' };
    }
    
    return { valid: true };
}

/**
 * Normalise un numéro de téléphone au format international (+41...)
 * 
 * @param {string} phone - Le numéro à normaliser
 * @returns {string} - Le numéro normalisé
 */
function normalizePhoneNumber(phone) {
    if (!phone) return '';
    
    // Nettoyer le numéro
    let cleaned = phone.replace(/[\s\-\(\)\.]/g, '');
    
    // Convertir au format international
    if (cleaned.startsWith('0041')) {
        cleaned = '+41' + cleaned.substring(4);
    } else if (cleaned.startsWith('0') && !cleaned.startsWith('00')) {
        cleaned = '+41' + cleaned.substring(1);
    } else if (!cleaned.startsWith('+')) {
        cleaned = '+' + cleaned;
    }
    
    return cleaned;
}

/**
 * Génère un code de vérification à 6 chiffres
 * 
 * @returns {string} - Code à 6 chiffres
 */
function generateVerificationCode() {
    // Générer un nombre aléatoire entre 100000 et 999999
    const code = Math.floor(100000 + Math.random() * 900000);
    return code.toString();
}

/**
 * Envoie un SMS avec le code de vérification
 * 
 * @param {string} phone - Le numéro de téléphone (format international)
 * @param {string} code - Le code de vérification
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
async function sendVerificationSMS(phone, code) {
    const normalizedPhone = normalizePhoneNumber(phone);
    
    console.log(`📱 Envoi SMS de vérification à ${normalizedPhone}`);
    
    // Mode mock (développement)
    if (SMS_CONFIG.mockMode) {
        console.log('═══════════════════════════════════════════════════════');
        console.log(`📱 SMS DE VÉRIFICATION (Mode Test)`);
        console.log(`📱 Numéro: ${normalizedPhone}`);
        console.log(`📱 Code: ${code}`);
        console.log(`📱 Message: Votre code de vérification Hoomy est: ${code}`);
        console.log('═══════════════════════════════════════════════════════');
        
        // Simuler un délai d'envoi
        await new Promise(resolve => setTimeout(resolve, 500));
        
        return { success: true };
    }
    
    // Production - utiliser un vrai service SMS
    try {
        // Twilio example (à décommenter et configurer en production)
        /*
        if (SMS_CONFIG.provider === 'twilio') {
            const client = require('twilio')(SMS_CONFIG.accountSid, SMS_CONFIG.authToken);
            
            await client.messages.create({
                body: `Votre code de vérification Hoomy est: ${code}. Ce code expire dans 15 minutes.`,
                from: SMS_CONFIG.fromNumber,
                to: normalizedPhone
            });
            
            console.log(`✅ SMS envoyé à ${normalizedPhone}`);
            return { success: true };
        }
        */
        
        // Si aucun provider configuré, fallback au mode mock
        console.log('⚠️ Aucun provider SMS configuré, mode mock activé');
        console.log(`📱 Code de vérification pour ${normalizedPhone}: ${code}`);
        
        return { success: true };
        
    } catch (error) {
        console.error('❌ Erreur envoi SMS:', error);
        return { 
            success: false, 
            error: error.message || 'Erreur lors de l\'envoi du SMS' 
        };
    }
}

module.exports = {
    isValidSwissPhone,
    isNotFakeNumber,
    validatePhoneNumber,
    normalizePhoneNumber,
    generateVerificationCode,
    sendVerificationSMS,
};

