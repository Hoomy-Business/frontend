const { Pool } = require('pg');
require('dotenv').config();

// Pool PostgreSQL optimisé pour performance maximale
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'hoomy_ch',
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
    // Optimisations de performance
    max: 20, // Nombre maximum de clients dans le pool
    min: 5, // Nombre minimum de clients dans le pool
    idleTimeoutMillis: 30000, // Fermer les clients inactifs après 30s
    connectionTimeoutMillis: 2000, // Timeout de connexion 2s
    // Statement timeout pour éviter les requêtes bloquantes
    statement_timeout: 10000, // 10 secondes max par requête
    query_timeout: 10000,
    // Keep-alive pour maintenir les connexions
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000,
    // Encodage UTF-8 pour les caractères spéciaux
    client_encoding: 'UTF8',
});

// Test connexion DB
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('❌ Erreur de connexion à PostgreSQL:', err.message);
    } else {
        console.log('✅ Connexion à PostgreSQL réussie');
    }
});

pool.on('error', (err) => {
    console.error('❌ Erreur pool PostgreSQL:', err);
});

module.exports = { pool, query: (text, params) => pool.query(text, params) };
