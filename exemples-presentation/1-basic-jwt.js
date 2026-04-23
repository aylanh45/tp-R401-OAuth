// Exemple 1 : Génération et Vérification Basique de JWT
const jwt = require('jsonwebtoken');
require('dotenv').config();

console.log('=== Exemple 1 : JWT Basique ===\n');

// 1. Créer un JWT
const payload = {
  userId: 'user_12345',
  name: 'Alice Dupont',
  role: 'admin'
};

const token = jwt.sign(
  payload,
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
);

console.log('Token généré:');
console.log(token);
console.log('\nStructure (Header.Payload.Signature):');
const parts = token.split('.');
console.log('Header:', parts[0]);
console.log('Payload:', parts[1]);
console.log('Signature:', parts[2]);

// 2. Décoder le payload (sans vérification)
console.log('\n--- Décoder le payload (lisible sans clé) ---');
const decoded = jwt.decode(token);
console.log(decoded);

// 3. Vérifier le token
console.log('\n--- Vérifier le token ---');
try {
  const verified = jwt.verify(token, process.env.JWT_SECRET);
  console.log('✅ Token valide !');
  console.log('Données vérifiées:', verified);
} catch (err) {
  console.log('❌ Token invalide:', err.message);
}

// 4. Tester avec un mauvais secret
console.log('\n--- Test avec un mauvais secret ---');
try {
  jwt.verify(token, 'mauvais-secret');
  console.log('✅ Token valide');
} catch (err) {
  console.log('❌ Erreur:', err.message);
}

// 5. Créer un token expiré
console.log('\n--- Test avec un token expiré ---');
const expiredToken = jwt.sign(
  { userId: '123' },
  process.env.JWT_SECRET,
  { expiresIn: '0s' } // Expire immédiatement
);

setTimeout(() => {
  try {
    jwt.verify(expiredToken, process.env.JWT_SECRET);
    console.log('✅ Token valide');
  } catch (err) {
    console.log('❌ Erreur:', err.name, '-', err.message);
  }
}, 100);
