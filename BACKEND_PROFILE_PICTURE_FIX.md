# 🔧 Corrections Backend - Photo de Profil

## Problème identifié

Le champ `profile_picture` existe bien dans la base de données (`init_complete.sql` ligne 38), mais le backend ne le gère pas correctement dans plusieurs routes.

## Corrections à apporter

### 1. Route `PUT /api/users/profile` (server.js)

**Fichier**: `server.js` (ou `routes/auth.js` selon votre structure)

**Ligne actuelle** (~923-941):
```javascript
app.put('/api/users/profile', authenticateToken, async (req, res) => {
    const client = await pool.connect();
    try {
        const { first_name, last_name, phone } = req.body;

        const result = await client.query(`
            UPDATE users SET first_name = $1, last_name = $2, phone = $3, updated_at = CURRENT_TIMESTAMP
            WHERE id = $4
            RETURNING id, first_name, last_name, email, phone, role, email_verified, phone_verified
        `, [first_name, last_name, phone, req.user.id]);

        res.json({ user: result.rows[0] });
    } catch (error) {
        console.error('Erreur mise à jour profil:', error.message);
        res.status(500).json({ error: 'Erreur serveur' });
    } finally {
        client.release();
    }
});
```

**Correction**:
```javascript
app.put('/api/users/profile', authenticateToken, async (req, res) => {
    const client = await pool.connect();
    try {
        const { first_name, last_name, phone, profile_picture } = req.body;

        // Construire la requête dynamiquement pour ne mettre à jour que les champs fournis
        const updates = [];
        const values = [];
        let paramCount = 1;

        if (first_name !== undefined) {
            updates.push(`first_name = $${paramCount}`);
            values.push(first_name);
            paramCount++;
        }
        if (last_name !== undefined) {
            updates.push(`last_name = $${paramCount}`);
            values.push(last_name);
            paramCount++;
        }
        if (phone !== undefined) {
            updates.push(`phone = $${paramCount}`);
            values.push(phone);
            paramCount++;
        }
        if (profile_picture !== undefined) {
            updates.push(`profile_picture = $${paramCount}`);
            values.push(profile_picture);
            paramCount++;
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'Aucun champ à mettre à jour' });
        }

        updates.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(req.user.id);

        const result = await client.query(`
            UPDATE users SET ${updates.join(', ')}
            WHERE id = $${paramCount}
            RETURNING id, first_name, last_name, email, phone, role, email_verified, phone_verified, profile_picture
        `, values);

        res.json({ user: result.rows[0] });
    } catch (error) {
        console.error('Erreur mise à jour profil:', error.message);
        res.status(500).json({ error: 'Erreur serveur' });
    } finally {
        client.release();
    }
});
```

### 2. Route `GET /api/auth/profile` (routes/auth.js)

**Fichier**: `routes/auth.js`

**Ligne actuelle** (~346-362):
```javascript
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
```

**Correction**:
```javascript
router.get('/profile', authenticateToken, async (req, res) => {
    const client = await pool.connect();
    try {
        const result = await client.query(`
            SELECT id, email, first_name, last_name, role, phone, email_verified, date_of_birth, profile_picture
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
```

### 3. Route `POST /api/auth/login` (routes/auth.js)

**Fichier**: `routes/auth.js`

**Ligne actuelle** (~290-341):
```javascript
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
```

**Correction**:
```javascript
router.post('/login', async (req, res) => {
    const client = await pool.connect();
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: 'Champs requis' });

        const result = await client.query(`
            SELECT id, email, password_hash, first_name, last_name, role, email_verified, phone, profile_picture
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
                phone: user.phone,
                profile_picture: user.profile_picture
            }
        });

    } catch (error) {
        console.error('❌ Erreur login:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    } finally {
        client.release();
    }
});
```

### 4. Route `POST /api/auth/verify-email` (routes/auth.js)

**Fichier**: `routes/auth.js`

**Ligne actuelle** (~186-251):
```javascript
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
```

**Correction**:
```javascript
router.post('/verify-email', async (req, res) => {
    const client = await pool.connect();
    try {
        const { email, code } = req.body;

        if (!email || !code) return res.status(400).json({ error: 'Email et code requis' });

        const result = await client.query(`
            SELECT id, first_name, last_name, role, email_verification_code, email_code_expires_at, profile_picture
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
                email_verified: true,
                profile_picture: user.profile_picture
            }
        });

    } catch (error) {
        console.error('❌ Erreur vérification:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    } finally {
        client.release();
    }
});
```

### 5. Route `GET /api/properties` (server.js)

**Fichier**: `server.js`

**Ligne actuelle** (~274-346):
```javascript
app.get('/api/properties', async (req, res) => {
    const client = await pool.connect();
    try {
        const { city_id, city_name, canton, max_price, min_rooms, property_type, status } = req.query;

        let query = `
            SELECT p.*, 
                   u.first_name, u.last_name, u.email, u.phone,
                   sc.name_fr as canton_name,
                   (SELECT photo_url FROM property_photos WHERE property_id = p.id AND is_main = true LIMIT 1) as main_photo
            FROM properties p
            JOIN users u ON p.owner_id = u.id
            JOIN swiss_cantons sc ON p.canton_code = sc.code
            WHERE 1=1
        `;
        // ... reste du code ...
```

**Correction**:
```javascript
app.get('/api/properties', async (req, res) => {
    const client = await pool.connect();
    try {
        const { city_id, city_name, canton, max_price, min_rooms, property_type, status } = req.query;

        let query = `
            SELECT p.*, 
                   u.first_name, u.last_name, u.email, u.phone, u.profile_picture,
                   sc.name_fr as canton_name,
                   (SELECT photo_url FROM property_photos WHERE property_id = p.id AND is_main = true LIMIT 1) as main_photo
            FROM properties p
            JOIN users u ON p.owner_id = u.id
            JOIN swiss_cantons sc ON p.canton_code = sc.code
            WHERE 1=1
        `;
        // ... reste du code ...
```

### 6. Route `GET /api/properties/:id` (server.js)

**Fichier**: `server.js`

**Ligne actuelle** (~370-404):
```javascript
app.get('/api/properties/:id', async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;

        const propertyResult = await client.query(`
            SELECT p.*, u.first_name, u.last_name, u.email, u.phone, u.email_verified, u.phone_verified,
                   sc.name_fr as canton_name
            FROM properties p
            JOIN users u ON p.owner_id = u.id
            JOIN swiss_cantons sc ON p.canton_code = sc.code
            WHERE p.id = $1
        `, [id]);

        if (propertyResult.rows.length === 0) {
            return res.status(404).json({ error: 'Annonce non trouvée' });
        }

        const property = propertyResult.rows[0];

        const photosResult = await client.query(
            'SELECT * FROM property_photos WHERE property_id = $1 ORDER BY is_main DESC',
            [id]
        );

        property.photos = photosResult.rows;

        res.json(property);
    } catch (error) {
        console.error('Erreur récupération annonce:', error.message);
        res.status(500).json({ error: 'Erreur serveur' });
    } finally {
        client.release();
    }
});
```

**Correction**:
```javascript
app.get('/api/properties/:id', async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;

        const propertyResult = await client.query(`
            SELECT p.*, u.first_name, u.last_name, u.email, u.phone, u.email_verified, u.phone_verified, u.profile_picture,
                   sc.name_fr as canton_name
            FROM properties p
            JOIN users u ON p.owner_id = u.id
            JOIN swiss_cantons sc ON p.canton_code = sc.code
            WHERE p.id = $1
        `, [id]);

        if (propertyResult.rows.length === 0) {
            return res.status(404).json({ error: 'Annonce non trouvée' });
        }

        const property = propertyResult.rows[0];

        const photosResult = await client.query(
            'SELECT * FROM property_photos WHERE property_id = $1 ORDER BY is_main DESC',
            [id]
        );

        property.photos = photosResult.rows;

        res.json(property);
    } catch (error) {
        console.error('Erreur récupération annonce:', error.message);
        res.status(500).json({ error: 'Erreur serveur' });
    } finally {
        client.release();
    }
});
```

## Résumé des modifications

1. ✅ **PUT /api/users/profile** : Ajouter `profile_picture` dans la mise à jour et le RETURNING
2. ✅ **GET /api/auth/profile** : Ajouter `profile_picture` dans le SELECT
3. ✅ **POST /api/auth/login** : Ajouter `profile_picture` dans le SELECT et la réponse
4. ✅ **POST /api/auth/verify-email** : Ajouter `profile_picture` dans le SELECT et la réponse
5. ✅ **GET /api/properties** : Ajouter `u.profile_picture` dans le SELECT
6. ✅ **GET /api/properties/:id** : Ajouter `u.profile_picture` dans le SELECT

## Vérification

Après avoir appliqué ces corrections, testez :
1. Upload d'une photo de profil depuis le dashboard
2. Affichage de la photo de profil dans le header/navigation
3. Affichage de la photo de profil du propriétaire sur les pages de propriétés

## Note importante

Le champ `profile_picture` existe déjà dans la base de données (ligne 38 de `init_complete.sql`), donc aucune migration n'est nécessaire. Il suffit de modifier le code backend pour utiliser ce champ.

## Corrections optionnelles (pour améliorer l'UX)

Si vous souhaitez afficher les photos de profil dans les conversations et messages, vous pouvez aussi ajouter `profile_picture` dans :

### Route `GET /api/conversations` (server.js)

**Ligne actuelle** (~818-845):
```javascript
const result = await client.query(`
    SELECT c.*, 
           p.title as property_title, p.city_name,
           CASE 
               WHEN c.student_id = $1 THEN u_owner.first_name || ' ' || u_owner.last_name
               ELSE u_student.first_name || ' ' || u_student.last_name
           END as other_user_name,
           ...
    FROM conversations c
    LEFT JOIN properties p ON c.property_id = p.id
    LEFT JOIN users u_owner ON c.owner_id = u_owner.id
    LEFT JOIN users u_student ON c.student_id = u_student.id
    ...
```

**Correction optionnelle**:
```javascript
const result = await client.query(`
    SELECT c.*, 
           p.title as property_title, p.city_name,
           CASE 
               WHEN c.student_id = $1 THEN u_owner.first_name || ' ' || u_owner.last_name
               ELSE u_student.first_name || ' ' || u_student.last_name
           END as other_user_name,
           CASE 
               WHEN c.student_id = $1 THEN u_owner.profile_picture
               ELSE u_student.profile_picture
           END as other_user_profile_picture,
           ...
    FROM conversations c
    LEFT JOIN properties p ON c.property_id = p.id
    LEFT JOIN users u_owner ON c.owner_id = u_owner.id
    LEFT JOIN users u_student ON c.student_id = u_student.id
    ...
```

### Route `GET /api/messages/:conversation_id` (server.js)

**Ligne actuelle** (~898-904):
```javascript
const result = await client.query(`
    SELECT m.*, u.first_name, u.last_name
    FROM messages m
    JOIN users u ON m.sender_id = u.id
    WHERE m.conversation_id = $1
    ORDER BY m.created_at ASC
`, [conversation_id]);
```

**Correction optionnelle**:
```javascript
const result = await client.query(`
    SELECT m.*, u.first_name, u.last_name, u.profile_picture
    FROM messages m
    JOIN users u ON m.sender_id = u.id
    WHERE m.conversation_id = $1
    ORDER BY m.created_at ASC
`, [conversation_id]);
```

