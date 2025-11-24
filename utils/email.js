import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";
import "dotenv/config";

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
export async function sendEmail(destinataire, { sujet, html, text }) {
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
