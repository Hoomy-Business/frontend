const { MailerSend, EmailParams, Sender, Recipient } = require("mailersend");
require("dotenv/config");

const mailerSend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY,
});

/**
 * Envoie un email via MailerSend
 * @param {string} destinataire - L'adresse email du destinataire
 * @param {Object} options - Options de l'email
 * @param {string} options.sujet - Sujet de l'email
 * @param {string} options.html - Contenu HTML
 * @param {string} options.text - Contenu texte
 */
async function sendEmail(destinataire, { sujet, html, text }) {
  const sentFrom = new Sender("noreply@test-65qngkd8xjwlwr12.mlsender.net", "Hoomy");
  const recipients = [new Recipient(destinataire)];

  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setSubject(sujet)
    .setHtml(html)
    .setText(text);

  try {
    const response = await mailerSend.email.send(emailParams);
    console.log("Email envoyé :", response);
    return response;
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email :", error);
    throw error;
  }
}

/**
 * Envoyer un email de vérification
 * @param {string} email - Email du destinataire
 * @param {string} code - Code de vérification
 * @param {string} firstName - Prénom du destinataire
 */
async function sendVerificationEmail(email, code, firstName) {
  try {
    return await sendEmail(email, {
      sujet: "Code de vérification Hoomy",
      html: `<html><body><h1>Bonjour ${firstName}</h1><p>Votre code est : <strong>${code}</strong></p></body></html>`,
      text: `Bonjour ${firstName}\n\nVotre code de vérification est : ${code}`
    });
  } catch (error) {
    // Si l'envoi échoue, on loggue le code dans la console pour ne pas bloquer l'utilisateur
    console.log('\n==================================================');
    console.log(`⚠️  MODE DÉVELOPPEMENT / FALLBACK (Échec envoi email)`);
    console.log(`📧  Email destinataire : ${email}`);
    console.log(`🔑  CODE DE VÉRIFICATION : ${code}`);
    console.log('==================================================\n');
    // Retourner success pour que l'inscription continue
    return { success: true };
  }
}

/**
 * Envoyer un email de bienvenue
 * @param {string} email - Email du destinataire
 * @param {string} firstName - Prénom du destinataire
 * @param {string} role - Rôle de l'utilisateur
 */
async function sendWelcomeEmail(email, firstName, role) {
  try {
    return await sendEmail(email, {
      sujet: "Bienvenue sur Hoomy !",
      html: `<html><body><h1>Bienvenue ${firstName} !</h1><p>Votre compte ${role} est actif.</p></body></html>`,
      text: `Bienvenue ${firstName} !\n\nVotre compte ${role} est actif.`
    });
  } catch (error) {
    // Email de bienvenue non critique - on loggue juste l'erreur
    console.error('⚠️ Erreur envoi email de bienvenue (non critique):', error.message);
    return { success: false };
  }
}

module.exports = { sendEmail, sendVerificationEmail, sendWelcomeEmail };
