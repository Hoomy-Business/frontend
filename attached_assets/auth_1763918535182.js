// routes/auth.js
const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendEmail } = require('../utils/email');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'hoomy_ch',
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
});

// Middleware d'authentification
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Token requis' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Token invalide' });
        req.user = user;
        next();
    });
};

// =========================================
// 1. ROUTE: INSCRIPTION (Avec Rollback)
// =========================================
router.post('/register', async (req, res) => {
    const client = await pool.connect();
    let userIdToDelete = null; // ID à supprimer si l'email échoue

    try {
        const { 
            email, password, first_name, last_name, 
            role, phone, date_of_birth, terms_accepted 
        } = req.body;

        // --- Validations ---
        if (!email || !password || !first_name || !last_name || !role || !date_of_birth) {
            return res.status(400).json({ error: 'Tous les champs obligatoires doivent être remplis' });
        }

        if (!terms_accepted) {
            return res.status(400).json({ error: 'Vous devez accepter les conditions d\'utilisation' });
        }

        // Vérification email temporaire
        const temporaryEmailDomains = [
            'temp-mail.org', 'tempmail.com', 'guerrillamail.com', 'mailinator.com',
            '10minutemail.com', 'throwaway.email', 'tempail.com', 'mohmal.com',
            'getnada.com', 'maildrop.cc', 'yopmail.com', 'sharklasers.com',
            'grr.la', 'guerrillamailblock.com', 'pokemail.net', 'spam4.me',
            'bccto.me', 'chitthi.in', 'dispostable.com', 'mintemail.com',
            'mytrashmail.com', 'tempinbox.com', 'trashmail.com', 'trashmailer.com',
            'throwawaymail.com', 'getairmail.com', 'tempmailo.com', 'fakeinbox.com',
            'emailondeck.com', 'mailcatch.com', 'meltmail.com', 'melt.li',
            'mox.do', 'temp-mail.io', 'temp-mail.ru', 'tempail.com',
            'tempr.email', 'tmpmail.org', 'tmpmail.net', 'tmpmail.com',
            'tmpmail.io', 'tmpmail.me', '0-mail.com', '33mail.com',
            '4warding.com', '4warding.net', '4warding.org', 'armyspy.com',
            'cuvox.de', 'dayrep.com', 'einrot.com', 'fleckens.hu',
            'gustr.com', 'jourrapide.com', 'rhyta.com', 'superrito.com',
            'teleworm.us', 'emailfake.com', 'fakemailgenerator.com',
            'mailnesia.com', 'mailcatch.com', 'mintemail.com', 'mytrashmail.com',
            'tempinbox.co.uk', 'tempinbox.com', 'trashmail.com', 'trashmail.net',
            'trashmail.org', 'trashmailer.com', 'throwawaymail.com'
        ];
        
        const emailDomain = email.toLowerCase().split('@')[1];
        const isTemporaryEmail = temporaryEmailDomains.some(domain => 
            emailDomain === domain || emailDomain.endsWith(`.${domain}`)
        );
        
        if (isTemporaryEmail) {
            return res.status(400).json({ 
                error: 'Les adresses email temporaires ne sont pas autorisées. Veuillez utiliser une adresse email permanente.' 
            });
        }

        // Vérification âge (18 ans)
        const birthDate = new Date(date_of_birth);
        const ageDifMs = Date.now() - birthDate.getTime();
        const ageDate = new Date(ageDifMs); // miliseconds from epoch
        const age = Math.abs(ageDate.getUTCFullYear() - 1970);
        if (age < 18) {
            return res.status(400).json({ error: 'Vous devez avoir au moins 18 ans.' });
        }

        // Vérification doublon email
        const existingUser = await client.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: 'Cet email est déjà utilisé' });
        }

        // Préparation des données
        const password_hash = await bcrypt.hash(password, 10);
        const verification_code = crypto.randomInt(100000, 999999).toString();
        const code_expires_at = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // --- INSERTION BDD ---
        const result = await client.query(`
            INSERT INTO users (
                email, password_hash, first_name, last_name, role, phone, 
                date_of_birth, terms_accepted, terms_accepted_at,
                email_verification_code, email_code_expires_at,
                email_verified
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, $9, $10, FALSE)
            RETURNING id, email, first_name, last_name, role
        `, [
            email.toLowerCase(), password_hash, first_name, last_name, role, 
            phone || null, date_of_birth, true, 
            verification_code, code_expires_at
        ]);

        const user = result.rows[0];
        userIdToDelete = user.id; // On garde l'ID en mémoire

        // --- ENVOI EMAIL ---
        console.log(`📧 Tentative d'envoi email à ${email}...`);
      
	/*await sendEmail(email, {
	  sujet: "Bienvenue chez Hoomy ! 🎉",
	  html: `
	    <h1>Bonjour !</h1>
	    <p>Merci de vous être inscrit chez <strong>Hoomy</strong>. Voici votre code de vérification : ${verification_code}</p>
	    <a href="https://hoomy.site/confirmation?token=12345">Confirmer mon compte</a>
	  `,
	  text: `
	    Bonjour !
	    Copiez ce lien pour confirmer : https://hoomy.site/cettepagenexistepas
 	  `
	})
	.then(() => console.log("Email envoyé avec succès !"))
	.catch(console.error);
*/
	console.log(verification_code);


        console.log('✅ Inscription réussie et email envoyé pour:', user.email);
        res.status(201).json({
            message: 'Inscription réussie. Vérifiez votre email.',
            user: { email: user.email }
        });

    } catch (error) {
        console.error('❌ Erreur inscription:', error);

        // --- ROLLBACK MANUEL ---
        if (userIdToDelete) {
            try {
                console.log(`⚠️ Nettoyage : Suppression de l'utilisateur ID ${userIdToDelete} suite à l'échec...`);
                await client.query('DELETE FROM users WHERE id = $1', [userIdToDelete]);
                console.log('🗑️ Utilisateur supprimé. Vous pouvez réessayer.');
            } catch (delError) {
                console.error('❌ Erreur critique lors du nettoyage:', delError);
            }
        }

        // Gestion des erreurs spécifiques
        if (error.code === 'EAUTH') {
            return res.status(500).json({ error: "Erreur d'authentification SMTP. Vérifiez le mot de passe." });
        }
        if (error.code === 'ETIMEDOUT') {
            return res.status(500).json({ error: "Le serveur email ne répond pas. Réessayez." });
        }

        res.status(500).json({ error: 'Erreur serveur lors de l\'inscription.' });
    } finally {
        client.release();
    }
});

// =========================================
// 2. ROUTE: VÉRIFICATION EMAIL
// =========================================
router.post('/verify-email', async (req, res) => {
    const client = await pool.connect();
    try {
        const { email, code } = req.body;

        if (!email || !code) return res.status(400).json({ error: 'Email et code requis' });

        const result = await client.query(`
            SELECT id, first_name, last_name, role, email_verification_code, email_code_expires_at
            FROM users WHERE email = $1
        `, [email.toLowerCase()]);

        if (result.rows.length === 0) return res.status(404).json({ error: 'Utilisateur non trouvé' });

        const user = result.rows[0];

        // Vérification du code
        if (user.email_verification_code !== code) {
            return res.status(400).json({ error: 'Code incorrect' });
        }

        // Vérification expiration
        if (new Date() > new Date(user.email_code_expires_at)) {
            return res.status(400).json({ error: 'Code expiré' });
        }

        // Validation
        await client.query(`
            UPDATE users 
            SET email_verified = TRUE, 
                email_verification_code = NULL, 
                email_code_expires_at = NULL
            WHERE id = $1
        `, [user.id]);

        // Email de bienvenue (non bloquant)
        //sendWelcomeEmail(email, user.first_name, user.role).catch(console.error);
	console.log(`Welcome ${user.first_name}`);

        // Token JWT
        const token = jwt.sign(
            { id: user.id, email: email.toLowerCase(), role: user.role },
            JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.json({
            message: 'Email vérifié avec succès',
            token,
            user: {
                id: user.id,
                email: email.toLowerCase(),
                first_name: user.first_name,
                last_name: user.last_name,
                role: user.role,
                email_verified: true
            }
        });

    } catch (error) {
        console.error('❌ Erreur vérification:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    } finally {
        client.release();
    }
});

// =========================================
// 3. ROUTE: RENVOI DU CODE
// =========================================
router.post('/resend-verification', async (req, res) => {
    const client = await pool.connect();
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: 'Email requis' });

        const result = await client.query('SELECT id, first_name, email_verified FROM users WHERE email = $1', [email.toLowerCase()]);
        
        if (result.rows.length === 0) return res.status(404).json({ error: 'Utilisateur non trouvé' });
        const user = result.rows[0];

        if (user.email_verified) return res.status(400).json({ error: 'Compte déjà vérifié' });

        const code = crypto.randomInt(100000, 999999).toString();
        const expires = new Date(Date.now() + 10 * 60 * 1000);

        await client.query(`
            UPDATE users SET email_verification_code = $1, email_code_expires_at = $2 WHERE id = $3
        `, [code, expires, user.id]);

        await sendVerificationEmail(email, code, user.first_name);
        res.json({ message: 'Nouveau code envoyé' });

    } catch (error) {
        console.error('❌ Erreur renvoi:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    } finally {
        client.release();
    }
});

// =========================================
// 4. ROUTE: CONNEXION
// =========================================
router.post('/login', async (req, res) => {
    const client = await pool.connect();
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: 'Champs requis' });

        const result = await client.query(`
            SELECT id, email, password_hash, first_name, last_name, role, email_verified, phone
            FROM users WHERE email = $1
        `, [email.toLowerCase()]);

        if (result.rows.length === 0) return res.status(401).json({ error: 'Identifiants incorrects' });

        const user = result.rows[0];
        const validPass = await bcrypt.compare(password, user.password_hash);

        if (!validPass) return res.status(401).json({ error: 'Identifiants incorrects' });

        if (!user.email_verified) {
            return res.status(403).json({ 
                error: 'Email non vérifié',
                code: 'EMAIL_NOT_VERIFIED' 
            });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.json({
            message: 'Connexion réussie',
            token,
            user: {
                id: user.id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                role: user.role,
                email_verified: true,
                phone: user.phone
            }
        });

    } catch (error) {
        console.error('❌ Erreur login:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    } finally {
        client.release();
    }
});

// =========================================
// 5. ROUTE: PROFIL
// =========================================
router.get('/profile', authenticateToken, async (req, res) => {
    const client = await pool.connect();
    try {
        const result = await client.query(`
            SELECT id, email, first_name, last_name, role, phone, email_verified, date_of_birth
            FROM users WHERE id = $1
        `, [req.user.id]);

        if (result.rows.length === 0) return res.status(404).json({ error: 'Non trouvé' });
        res.json({ user: result.rows[0] });

    } catch (error) {
        res.status(500).json({ error: 'Erreur serveur' });
    } finally {
        client.release();
    }
});

module.exports = router;
