/**
 * Script pour vérifier les images manquantes dans la base de données
 * Usage: node check-missing-images.js
 */

require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 
        `postgresql://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || ''}@${process.env.DB_HOST || '127.0.0.1'}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME || 'hoomy_ch'}`,
    // Forcer IPv4
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'hoomy_ch'
});

const uploadsDir = path.join(__dirname, 'public', 'uploads');

async function checkMissingImages() {
    const client = await pool.connect();
    try {
        console.log('🔍 Vérification des images manquantes...\n');
        console.log(`📁 Dossier uploads: ${uploadsDir}\n`);
        
        // Vérifier si le dossier existe
        if (!fs.existsSync(uploadsDir)) {
            console.log('⚠️  Le dossier uploads n\'existe pas!');
            fs.mkdirSync(uploadsDir, { recursive: true });
            console.log('✅ Dossier créé.\n');
        }
        
        // Lister tous les fichiers dans le dossier uploads
        const existingFiles = new Set();
        if (fs.existsSync(uploadsDir)) {
            const files = fs.readdirSync(uploadsDir);
            files.forEach(file => existingFiles.add(file));
            console.log(`📊 Fichiers trouvés dans uploads/: ${files.length}\n`);
        }
        
        // Récupérer toutes les URLs d'images depuis la base de données
        const result = await client.query(`
            SELECT DISTINCT photo_url 
            FROM property_photos 
            WHERE photo_url IS NOT NULL AND photo_url != ''
            ORDER BY photo_url
        `);
        
        console.log(`📊 URLs d'images dans la base de données: ${result.rows.length}\n`);
        
        const missingImages = [];
        const foundImages = [];
        
        result.rows.forEach(row => {
            const photoUrl = row.photo_url;
            
            // Extraire le nom de fichier de l'URL
            let filename = null;
            
            // Pattern 1: /api/image/filename
            const match1 = photoUrl.match(/\/api\/image\/([^\/\?]+)/);
            if (match1) {
                filename = match1[1];
            } else {
                // Pattern 2: juste le nom de fichier à la fin
                const match2 = photoUrl.match(/\/([^\/\?]+\.(jpg|jpeg|png|gif|webp))$/i);
                if (match2) {
                    filename = match2[1];
                } else {
                    // Pattern 3: nom de fichier seul
                    if (photoUrl.match(/^[^\/]+\.(jpg|jpeg|png|gif|webp)$/i)) {
                        filename = photoUrl;
                    }
                }
            }
            
            if (filename) {
                if (existingFiles.has(filename)) {
                    foundImages.push({ url: photoUrl, filename });
                } else {
                    missingImages.push({ url: photoUrl, filename });
                }
            } else {
                console.log(`⚠️  Impossible d'extraire le nom de fichier de: ${photoUrl}`);
            }
        });
        
        console.log('═══════════════════════════════════════════════════');
        console.log(`✅ Images trouvées: ${foundImages.length}`);
        console.log(`❌ Images manquantes: ${missingImages.length}`);
        console.log('═══════════════════════════════════════════════════\n');
        
        if (missingImages.length > 0) {
            console.log('📋 Liste des images manquantes:\n');
            missingImages.forEach((img, index) => {
                console.log(`${index + 1}. ${img.filename}`);
                console.log(`   URL: ${img.url}\n`);
            });
            
            // Générer un script SQL pour mettre à jour les URLs si nécessaire
            console.log('\n💡 Solution:');
            console.log('1. Copier les fichiers manquants depuis votre environnement de développement');
            console.log('2. Ou ré-uploader les images via l\'interface');
            console.log('3. Les nouvelles images uploadées utiliseront automatiquement la bonne URL\n');
        } else {
            console.log('✅ Toutes les images sont présentes!\n');
        }
        
    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

checkMissingImages();

