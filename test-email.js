// utils/email.js
require('dotenv').config();
const Brevo = require('@getbrevo/brevo');

// Configuration de l'instance API Brevo (si la clé existe)
let apiInstance;
if (process.env.BREVO_API_KEY) {
    const defaultClient = Brevo.ApiClient.instance;
    const apiKey = defaultClient.authentications['api-key'];
    apiKey.apiKey = process.env.BREVO_API_KEY;
    apiInstance = new Brevo.TransactionalEmailsApi();
}

/**
 * Fonction utilitaire pour simuler un envoi (Mode Développement)
 */
function logCodeInConsole(email, code, context) {
    console.log('\n==================================================');
    console.log(`⚠️  MODE DÉVELOPPEMENT / FALLBACK (${context})`);
    console.log(`📧  Email destinataire : ${email}`);
    console.log(`🔑  CODE DE VÉRIFICATION : ${code}`);
    console.log('==================================================\n');
}

/**
 * Envoyer un email de vérification
 */
async function sendVerificationEmail(email, code, firstName) {
    // 1. Si pas de clé API, on loggue juste dans la console et on valide
    if (!apiInstance) {
        logCodeInConsole(email, code, 'Pas de clé API Brevo');
        return { success: true };
    }

    const sendSmtpEmail = new Brevo.SendSmtpEmail();
    sendSmtpEmail.subject = "Code de vérification Hoomy";
    sendSmtpEmail.htmlContent = `<html><body><h1>Bonjour ${firstName}</h1><p>Votre code est : <strong>${code}</strong></p></body></html>`;
    sendSmtpEmail.sender = { "name": "Hoomy", "email": process.env.EMAIL_FROM || "noreply@hoomy.site" };
    sendSmtpEmail.to = [{ "email": email, "name": firstName }];

    try {
        console.log(`📧 Tentative d'envoi via Brevo à ${email}...`);
        await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log('✅ Email envoyé via Brevo !');
        return { success: true };
    } catch (error) {
        console.error('❌ Erreur Brevo :', error.body ? error.body : error.message);
        // IMPORTANT : Si l'envoi échoue, on affiche le code dans la console pour ne pas bloquer l'user
        logCodeInConsole(email, code, 'Échec envoi Brevo');
        return { success: true }; // On retourne true pour que l'inscription continue
    }
}

/**
 * Envoyer un email de bienvenue
 */
async function sendWelcomeEmail(email, firstName, role) {
    if (!apiInstance) {
        console.log(`👻 Email bienvenue simulé pour ${email}`);
        return { success: true };
    }

    const sendSmtpEmail = new Brevo.SendSmtpEmail();
    sendSmtpEmail.subject = "Bienvenue sur Hoomy !";
    sendSmtpEmail.htmlContent = `<html><body><h1>Bienvenue ${firstName} !</h1><p>Votre compte ${role} est actif.</p></body></html>`;
    sendSmtpEmail.sender = { "name": "Hoomy", "email": process.env.EMAIL_FROM || "noreply@hoomy.site" };
    sendSmtpEmail.to = [{ "email": email, "name": firstName }];

    try {
        await apiInstance.sendTransacEmail(sendSmtpEmail);
        return { success: true };
    } catch (error) {
        console.error('⚠️ Erreur bienvenue Brevo (non critique):', error.message);
        return { success: false };
    }
}

module.exports = {
    sendVerificationEmail,
    sendWelcomeEmail
};
