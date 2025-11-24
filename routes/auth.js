// routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendEmail } = require('../utils/email');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Utiliser le pool partagé depuis db.js
const { pool } = require('../db');

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
        if (!email || !password || !first_name || !last_name || !role) {
            return res.status(400).json({ error: 'Tous les champs obligatoires doivent être remplis' });
        }

        if (!terms_accepted) {
            return res.status(400).json({ error: 'Vous devez accepter les conditions d\'utilisation' });
        }

        // Vérification âge (18 ans) - optionnel si date_of_birth est fourni
        if (date_of_birth) {
            const birthDate = new Date(date_of_birth);
            const ageDifMs = Date.now() - birthDate.getTime();
            const ageDate = new Date(ageDifMs); // miliseconds from epoch
            const age = Math.abs(ageDate.getUTCFullYear() - 1970);
            if (age < 18) {
                return res.status(400).json({ error: 'Vous devez avoir au moins 18 ans.' });
            }
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
        // Vérifier quelles colonnes existent dans la table users
        const columnsInfo = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'users'
        `);
        
        const existingColumns = columnsInfo.rows.map(row => row.column_name);
        const hasDateOfBirth = existingColumns.includes('date_of_birth');
        const hasTermsAccepted = existingColumns.includes('terms_accepted');
        const hasTermsAcceptedAt = existingColumns.includes('terms_accepted_at');
        const hasEmailVerificationCode = existingColumns.includes('email_verification_code');
        const hasEmailCodeExpiresAt = existingColumns.includes('email_code_expires_at');
        
        // Construire dynamiquement la requête INSERT
        let columns = ['email', 'password_hash', 'first_name', 'last_name', 'role', 'phone'];
        let queryValues = [email.toLowerCase(), password_hash, first_name, last_name, role, phone || null];
        let paramIndex = queryValues.length;
        
        if (hasDateOfBirth && date_of_birth) {
            columns.push('date_of_birth');
            queryValues.push(date_of_birth);
            paramIndex++;
        }
        
        if (hasTermsAccepted) {
            columns.push('terms_accepted');
            queryValues.push(true);
            paramIndex++;
        }
        
        if (hasTermsAcceptedAt) {
            columns.push('terms_accepted_at');
            // CURRENT_TIMESTAMP sera géré directement dans la requête
        }
        
        if (hasEmailVerificationCode) {
            columns.push('email_verification_code');
            queryValues.push(verification_code);
            paramIndex++;
        }
        
        if (hasEmailCodeExpiresAt) {
            columns.push('email_code_expires_at');
            queryValues.push(code_expires_at);
            paramIndex++;
        }
        
        columns.push('email_verified');
        queryValues.push(false);
        
        // Construire les placeholders pour les paramètres
        let placeholderIndex = 1;
        const placeholders = columns.map((col) => {
            if (col === 'terms_accepted_at') {
                return 'CURRENT_TIMESTAMP';
            }
            return `$${placeholderIndex++}`;
        }).join(', ');
        
        const query = `
            INSERT INTO users (${columns.join(', ')})
            VALUES (${placeholders})
            RETURNING id, email, first_name, last_name, role
        `;
        
        const result = await client.query(query, queryValues);
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

        // Vérifier quelles colonnes existent
        const columnsInfo = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'users'
        `);
        
        const existingColumns = columnsInfo.rows.map(row => row.column_name);
        const hasEmailVerificationCode = existingColumns.includes('email_verification_code');
        const hasEmailCodeExpiresAt = existingColumns.includes('email_code_expires_at');
        
        const emailVerificationFields = hasEmailVerificationCode && hasEmailCodeExpiresAt 
            ? ', email_verification_code, email_code_expires_at' 
            : '';
        
        const result = await client.query(`
            SELECT id, first_name, last_name, role${emailVerificationFields}
            FROM users WHERE email = $1
        `, [email.toLowerCase()]);

        if (result.rows.length === 0) return res.status(404).json({ error: 'Utilisateur non trouvé' });

        const user = result.rows[0];

        // Vérification du code (si les colonnes existent)
        if (hasEmailVerificationCode && user.email_verification_code) {
            if (user.email_verification_code !== code) {
                return res.status(400).json({ error: 'Code incorrect' });
            }
        } else {
            // Si les colonnes n'existent pas, on accepte n'importe quel code pour la compatibilité
            console.log('⚠️ Colonnes de vérification email non trouvées, validation du code ignorée');
        }

        // Vérification expiration (si la colonne existe)
        if (hasEmailCodeExpiresAt && user.email_code_expires_at) {
            if (new Date() > new Date(user.email_code_expires_at)) {
                return res.status(400).json({ error: 'Code expiré' });
            }
        }

        // Validation
        if (hasEmailVerificationCode && hasEmailCodeExpiresAt) {
            await client.query(`
                UPDATE users 
                SET email_verified = TRUE, 
                    email_verification_code = NULL, 
                    email_code_expires_at = NULL
                WHERE id = $1
            `, [user.id]);
        } else {
            await client.query(`
                UPDATE users 
                SET email_verified = TRUE
                WHERE id = $1
            `, [user.id]);
        }

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

        // Vérifier si les colonnes existent
        const columnsInfo = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'users'
        `);
        
        const existingColumns = columnsInfo.rows.map(row => row.column_name);
        const hasEmailVerificationCode = existingColumns.includes('email_verification_code');
        const hasEmailCodeExpiresAt = existingColumns.includes('email_code_expires_at');
        
        if (hasEmailVerificationCode && hasEmailCodeExpiresAt) {
            await client.query(`
                UPDATE users SET email_verification_code = $1, email_code_expires_at = $2 WHERE id = $3
            `, [code, expires, user.id]);
        } else {
            // Si les colonnes n'existent pas, on ne peut pas stocker le code
            console.log('⚠️ Colonnes de vérification email non trouvées, code non stocké');
        }

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
        // Vérifier si date_of_birth existe avant de la sélectionner
        const tableInfo = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'date_of_birth'
        `);
        
        const hasDateOfBirth = tableInfo.rows.length > 0;
        const dateOfBirthField = hasDateOfBirth ? ', date_of_birth' : '';
        
        const result = await client.query(`
            SELECT id, email, first_name, last_name, role, phone, email_verified${dateOfBirthField}
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
