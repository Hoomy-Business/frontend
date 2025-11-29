// routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendEmail, sendVerificationEmail, sendWelcomeEmail } = require('../utils/email');
const { 
    validatePhoneNumber, 
    normalizePhoneNumber, 
    generateVerificationCode, 
    sendVerificationSMS 
} = require('../utils/sms');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const PHONE_CODE_EXPIRY_MINUTES = 15; // 15 minutes d'expiration

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

        // Validation du numéro de téléphone si fourni
        if (phone && phone.trim() !== '') {
            const phoneValidation = validatePhoneNumber(phone);
            if (!phoneValidation.valid) {
                return res.status(400).json({ 
                    error: phoneValidation.error,
                    code: 'INVALID_PHONE'
                });
            }
        }

        // Vérification email temporaire (améliorée)
        const emailDomain = email.toLowerCase().split('@')[1];
        if (emailDomain) {
            const temporaryEmailDomains = [
                'temp-mail.org', 'feralrex.com', 'bipochub.com', 'mohmal.com', 'getnada.com', 'maildrop.cc',
                'yopmail.com', 'sharklasers.com', 'grr.la', 'guerrillamailblock.com',
                'pokemail.net', 'spam4.me', 'bccto.me', 'chitthi.in', 'dispostable.com',
                'mintemail.com', 'mytrashmail.com', 'tempinbox.com', 'trashmail.com',
                'trashmailer.com', 'throwawaymail.com', 'getairmail.com', 'tempmailo.com',
                'fakeinbox.com', 'emailondeck.com', 'mailcatch.com', 'meltmail.com',
                'melt.li', 'mox.do', 'temp-mail.io', 'temp-mail.ru', 'tempail.com',
                'tempr.email', 'tmpmail.org', 'tmpmail.net', 'tmpmail.com', 'tmpmail.io',
                'tmpmail.me', 'tempmail.com', 'guerrillamail.com', 'mailinator.com',
                '10minutemail.com', 'throwaway.email', '0-mail.com', '33mail.com',
                '4warding.com', '4warding.net', '4warding.org', 'armyspy.com',
                'cuvox.de', 'dayrep.com', 'einrot.com', 'fleckens.hu', 'gustr.com',
                'jourrapide.com', 'rhyta.com', 'superrito.com', 'teleworm.us',
                'emailfake.com', 'fakemailgenerator.com', 'mailnesia.com',
                'tempinbox.co.uk', 'trashmail.net', 'trashmail.org',
            ];
            
            // Vérifier si le domaine est exactement dans la liste
            let isTemporaryEmail = temporaryEmailDomains.includes(emailDomain);
            
            // Vérifier si c'est un sous-domaine d'un domaine temporaire
            if (!isTemporaryEmail) {
                isTemporaryEmail = temporaryEmailDomains.some(domain => 
                    emailDomain.endsWith(`.${domain}`)
                );
            }
            
            // Détecter les patterns suspects
            if (!isTemporaryEmail) {
                const suspiciousPatterns = [
                    /^[a-z0-9]+\.(temp|tmp|trash|throw|fake|spam|disposable|mail-temp|tempmail)/i,
                    /(temp|tmp|trash|throw|fake|spam|disposable|mail-temp|tempmail)[a-z0-9]*\.(com|org|net|io|me|co|info|xyz|online|site|website|tech|store|shop|club|fun|top|click|link|press|download|stream|video|space|cloud|host|work|party|review|accountant|design|photo|help|business|email|mail|services|solutions|support|systems|technology|today|tools|trade|training|travel|university|vip|watch|win|world|ws|zone)$/i,
                ];
                
                for (const pattern of suspiciousPatterns) {
                    if (pattern.test(emailDomain)) {
                        isTemporaryEmail = true;
                        break;
                    }
                }
            }
            
            // Détecter les domaines connus de temp-mail.org avec noms courts
            if (!isTemporaryEmail) {
                const knownTempMailDomains = [
                    'feralrex.com', 'bipochub.com', 'mohmal.com', 'getnada.com', 'maildrop.cc',
                    'yopmail.com', 'sharklasers.com', 'grr.la', 'pokemail.net',
                    'spam4.me', 'bccto.me', 'chitthi.in', 'dispostable.com',
                ];
                isTemporaryEmail = knownTempMailDomains.includes(emailDomain);
                
                // Détecter les domaines courts avec patterns suspects
                if (!isTemporaryEmail && emailDomain.length < 15 && /^[a-z]{4,12}\.(com|org|net|io|me|co|cc|info|xyz)$/i.test(emailDomain)) {
                    // Vérifier si le domaine ressemble à un domaine temporaire
                    const suspiciousWords = ['temp', 'tmp', 'trash', 'throw', 'fake', 'spam', 'disposable', 'mail'];
                    const hasSuspiciousWord = suspiciousWords.some(word => emailDomain.includes(word));
                    
                    // Si le domaine est court et ne contient pas de mots suspects mais ressemble à un nom aléatoire
                    if (!hasSuspiciousWord && /^[a-z]{5,11}\.(com|org|net|io|me|co|cc|info|xyz)$/i.test(emailDomain)) {
                        // Vérifier si c'est un domaine connu de temp-mail.org
                        if (knownTempMailDomains.includes(emailDomain)) {
                            isTemporaryEmail = true;
                        } else {
                            // Détecter les patterns de noms aléatoires (consonnes/voyelles aléatoires)
                            const randomPattern = /^[bcdfghjklmnpqrstvwxyz]{3,}[aeiou]{1,2}[bcdfghjklmnpqrstvwxyz]{2,}\.(com|org|net|io|me|co|cc|info|xyz)$/i;
                            if (randomPattern.test(emailDomain)) {
                                // Vérifier si le domaine est dans une liste de domaines légitimes connus
                                const legitimateShortDomains = [
                                    'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com',
                                    'protonmail.com', 'aol.com', 'zoho.com', 'mail.com', 'yandex.com',
                                    'gmx.com', 'live.com', 'msn.com', 'me.com', 'mac.com',
                                ];
                                if (!legitimateShortDomains.some(legit => emailDomain === legit || emailDomain.endsWith(`.${legit}`))) {
                                    // C'est probablement un domaine temporaire
                                    isTemporaryEmail = true;
                                }
                            }
                        }
                    }
                }
            }
            
            if (isTemporaryEmail) {
                return res.status(400).json({ 
                    error: 'Les adresses email temporaires ne sont pas autorisées. Veuillez utiliser une adresse email permanente.' 
                });
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

        // Normaliser le téléphone si fourni
        const normalizedPhone = (phone && phone.trim() !== '') ? normalizePhoneNumber(phone) : null;

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
        const hasPhoneVerified = existingColumns.includes('phone_verified');
        
        // Construire dynamiquement la requête INSERT
        let columns = ['email', 'password_hash', 'first_name', 'last_name', 'role', 'phone'];
        let queryValues = [email.toLowerCase(), password_hash, first_name, last_name, role, normalizedPhone];
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
        
        // Ajouter phone_verified = false (le téléphone doit être vérifié par SMS)
        if (hasPhoneVerified) {
            columns.push('phone_verified');
            queryValues.push(false);
        }
        
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
        sendWelcomeEmail(email, user.first_name, user.role).catch(console.error);

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

        // Vérifier si la colonne deleted_at existe
        const hasDeletedAt = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'deleted_at'
        `);
        const deletedAtExists = hasDeletedAt.rows.length > 0;
        const deletedAtSelect = deletedAtExists ? ', deleted_at' : ', NULL as deleted_at';
        
        const result = await client.query(`
            SELECT id, email, password_hash, first_name, last_name, role, email_verified, phone, profile_picture${deletedAtSelect}
            FROM users WHERE email = $1
        `, [email.toLowerCase()]);

        if (result.rows.length === 0) return res.status(401).json({ error: 'Identifiants incorrects' });

        const user = result.rows[0];
        
        // Empêcher la connexion si l'utilisateur est supprimé
        if (deletedAtExists && user.deleted_at) {
            return res.status(403).json({ 
                error: 'Ce compte a été supprimé',
                code: 'ACCOUNT_DELETED' 
            });
        }
        
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
                phone: user.phone,
                profile_picture: user.profile_picture || null
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
            SELECT id, email, first_name, last_name, role, phone, email_verified, profile_picture${dateOfBirthField}
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

// =========================================
// 6. ROUTE: DEMANDE DE VÉRIFICATION TÉLÉPHONE
// =========================================
router.post('/phone/request-verification', authenticateToken, async (req, res) => {
    const client = await pool.connect();
    try {
        const { phone } = req.body;

        if (!phone) {
            return res.status(400).json({ error: 'Numéro de téléphone requis' });
        }

        // Valider le format du numéro
        const validation = validatePhoneNumber(phone);
        if (!validation.valid) {
            return res.status(400).json({ error: validation.error });
        }

        // Normaliser le numéro
        const normalizedPhone = normalizePhoneNumber(phone);

        // Vérifier si ce numéro est déjà utilisé par un autre utilisateur
        const existingUser = await client.query(
            'SELECT id FROM users WHERE phone = $1 AND id != $2',
            [normalizedPhone, req.user.id]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: 'Ce numéro de téléphone est déjà utilisé par un autre compte' });
        }

        // Générer un code de vérification
        const verificationCode = generateVerificationCode();
        const expiresAt = new Date(Date.now() + PHONE_CODE_EXPIRY_MINUTES * 60 * 1000);

        // Vérifier quelles colonnes existent
        const columnsInfo = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name IN ('phone_verification_code', 'phone_code_expires_at', 'phone_pending')
        `);
        
        const existingColumns = columnsInfo.rows.map(row => row.column_name);
        
        if (!existingColumns.includes('phone_verification_code') || 
            !existingColumns.includes('phone_code_expires_at') || 
            !existingColumns.includes('phone_pending')) {
            // Créer les colonnes si elles n'existent pas
            await client.query(`
                ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_verification_code VARCHAR(6);
                ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_code_expires_at TIMESTAMP;
                ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_pending VARCHAR(20);
            `);
        }

        // Stocker le code et le numéro en attente
        await client.query(`
            UPDATE users 
            SET phone_verification_code = $1, 
                phone_code_expires_at = $2, 
                phone_pending = $3
            WHERE id = $4
        `, [verificationCode, expiresAt, normalizedPhone, req.user.id]);

        // Envoyer le SMS
        const smsResult = await sendVerificationSMS(normalizedPhone, verificationCode);
        
        if (!smsResult.success) {
            return res.status(500).json({ error: smsResult.error || 'Erreur lors de l\'envoi du SMS' });
        }

        console.log(`📱 Code de vérification envoyé à ${normalizedPhone} pour l'utilisateur ${req.user.id}`);

        res.json({ 
            message: 'Code de vérification envoyé par SMS',
            expires_in_minutes: PHONE_CODE_EXPIRY_MINUTES,
            phone_masked: normalizedPhone.slice(0, -4) + '****'
        });

    } catch (error) {
        console.error('❌ Erreur demande vérification téléphone:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    } finally {
        client.release();
    }
});

// =========================================
// 7. ROUTE: VÉRIFICATION DU CODE TÉLÉPHONE
// =========================================
router.post('/phone/verify', authenticateToken, async (req, res) => {
    const client = await pool.connect();
    try {
        const { code } = req.body;

        if (!code) {
            return res.status(400).json({ error: 'Code de vérification requis' });
        }

        // Vérifier quelles colonnes existent
        const columnsInfo = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name IN ('phone_verification_code', 'phone_code_expires_at', 'phone_pending')
        `);
        
        const existingColumns = columnsInfo.rows.map(row => row.column_name);
        
        if (!existingColumns.includes('phone_verification_code')) {
            return res.status(400).json({ error: 'Aucune vérification en cours' });
        }

        // Récupérer les informations de vérification
        const result = await client.query(`
            SELECT phone_verification_code, phone_code_expires_at, phone_pending
            FROM users WHERE id = $1
        `, [req.user.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        const user = result.rows[0];

        // Vérifier qu'il y a une vérification en cours
        if (!user.phone_pending || !user.phone_verification_code) {
            return res.status(400).json({ error: 'Aucune vérification de téléphone en cours. Veuillez d\'abord demander un nouveau code.' });
        }

        // Vérifier si le code a expiré
        if (user.phone_code_expires_at && new Date() > new Date(user.phone_code_expires_at)) {
            // Nettoyer le code expiré
            await client.query(`
                UPDATE users 
                SET phone_verification_code = NULL, 
                    phone_code_expires_at = NULL
                WHERE id = $1
            `, [req.user.id]);
            
            return res.status(400).json({ 
                error: 'Le code a expiré. Veuillez demander un nouveau code.',
                code: 'CODE_EXPIRED'
            });
        }

        // Vérifier le code
        if (user.phone_verification_code !== code) {
            return res.status(400).json({ error: 'Code incorrect' });
        }

        // Code valide - mettre à jour le numéro et marquer comme vérifié
        await client.query(`
            UPDATE users 
            SET phone = $1, 
                phone_verified = TRUE, 
                phone_verification_code = NULL, 
                phone_code_expires_at = NULL,
                phone_pending = NULL,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
        `, [user.phone_pending, req.user.id]);

        console.log(`✅ Téléphone vérifié pour l'utilisateur ${req.user.id}: ${user.phone_pending}`);

        // Récupérer le profil mis à jour
        const updatedUser = await client.query(`
            SELECT id, email, first_name, last_name, role, phone, email_verified, phone_verified, profile_picture
            FROM users WHERE id = $1
        `, [req.user.id]);

        res.json({ 
            message: 'Numéro de téléphone vérifié avec succès',
            user: updatedUser.rows[0]
        });

    } catch (error) {
        console.error('❌ Erreur vérification code téléphone:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    } finally {
        client.release();
    }
});

// =========================================
// 8. ROUTE: RENVOYER LE CODE TÉLÉPHONE
// =========================================
router.post('/phone/resend-code', authenticateToken, async (req, res) => {
    const client = await pool.connect();
    try {
        // Vérifier quelles colonnes existent
        const columnsInfo = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name IN ('phone_verification_code', 'phone_code_expires_at', 'phone_pending')
        `);
        
        const existingColumns = columnsInfo.rows.map(row => row.column_name);
        
        if (!existingColumns.includes('phone_pending')) {
            return res.status(400).json({ error: 'Aucune vérification en cours' });
        }

        // Récupérer le numéro en attente
        const result = await client.query(`
            SELECT phone_pending FROM users WHERE id = $1
        `, [req.user.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        const user = result.rows[0];

        if (!user.phone_pending) {
            return res.status(400).json({ error: 'Aucune vérification de téléphone en cours. Veuillez d\'abord soumettre un numéro.' });
        }

        // Générer un nouveau code
        const verificationCode = generateVerificationCode();
        const expiresAt = new Date(Date.now() + PHONE_CODE_EXPIRY_MINUTES * 60 * 1000);

        // Mettre à jour le code
        await client.query(`
            UPDATE users 
            SET phone_verification_code = $1, 
                phone_code_expires_at = $2
            WHERE id = $3
        `, [verificationCode, expiresAt, req.user.id]);

        // Envoyer le SMS
        const smsResult = await sendVerificationSMS(user.phone_pending, verificationCode);
        
        if (!smsResult.success) {
            return res.status(500).json({ error: smsResult.error || 'Erreur lors de l\'envoi du SMS' });
        }

        console.log(`📱 Nouveau code de vérification envoyé à ${user.phone_pending}`);

        res.json({ 
            message: 'Nouveau code envoyé par SMS',
            expires_in_minutes: PHONE_CODE_EXPIRY_MINUTES
        });

    } catch (error) {
        console.error('❌ Erreur renvoi code téléphone:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    } finally {
        client.release();
    }
});

// =========================================
// 9. ROUTE: STATUT DE VÉRIFICATION TÉLÉPHONE
// =========================================
router.get('/phone/verification-status', authenticateToken, async (req, res) => {
    const client = await pool.connect();
    try {
        // Vérifier quelles colonnes existent
        const columnsInfo = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name IN ('phone_verified', 'phone_pending', 'phone_code_expires_at')
        `);
        
        const existingColumns = columnsInfo.rows.map(row => row.column_name);
        const hasPhoneVerified = existingColumns.includes('phone_verified');
        const hasPhonePending = existingColumns.includes('phone_pending');
        const hasPhoneCodeExpires = existingColumns.includes('phone_code_expires_at');

        let selectFields = 'phone';
        if (hasPhoneVerified) selectFields += ', phone_verified';
        if (hasPhonePending) selectFields += ', phone_pending';
        if (hasPhoneCodeExpires) selectFields += ', phone_code_expires_at';

        const result = await client.query(`
            SELECT ${selectFields} FROM users WHERE id = $1
        `, [req.user.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        const user = result.rows[0];

        res.json({
            phone: user.phone || null,
            phone_verified: user.phone_verified || false,
            has_pending_verification: !!user.phone_pending,
            pending_phone: user.phone_pending ? user.phone_pending.slice(0, -4) + '****' : null,
            code_expires_at: user.phone_code_expires_at || null
        });

    } catch (error) {
        console.error('❌ Erreur statut vérification téléphone:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    } finally {
        client.release();
    }
});

module.exports = router;
