// Script pour générer le hash bcrypt du mot de passe admin
const bcrypt = require('bcryptjs');

const password = 'Admin123!';

bcrypt.hash(password, 10)
  .then(hash => {
    console.log('\n========================================');
    console.log('Hash généré pour:', password);
    console.log('========================================');
    console.log('Hash:', hash);
    console.log('\nCopiez ce hash dans create_admin.sql');
    console.log('========================================\n');
  })
  .catch(err => {
    console.error('Erreur:', err);
  });

