const { sendEmail } = require("./utils/email");

sendEmail("hoomybuisness@proton.me", {
  sujet: "Bienvenue chez Hoomy ! 🎉",
  html: `
    <h1>Bonjour !</h1>
    <p>Merci de vous être inscrit chez <strong>Hoomy</strong>.</p>
    <a href="https://hoomy.site/confirmation?token=12345">Confirmer mon compte</a>
  `,
  text: `
    Bonjour !
    Merci de vous être inscrit chez Hoomy.
    Copiez ce lien pour confirmer : https://hoomy.site/confirmation?token=12345
  `
})
  .then(() => console.log("Email envoyé avec succès !"))
  .catch(console.error);
