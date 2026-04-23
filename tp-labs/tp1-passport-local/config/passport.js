// Configuration de Passport Local Strategy
// À COMPLÉTER PAR L'ÉTUDIANT

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');

// ============================================
// TODO 1 : Configurer la stratégie locale
// ============================================
// Utilisez passport.use() pour configurer une stratégie 'local'
//
// Indices :
// - Utilisez LocalStrategy de passport-local
// - Options : usernameField: 'email', passwordField: 'password', session: false
// - La fonction verify doit :
//   1. Trouver l'utilisateur par email avec User.findByEmail()
//   2. Vérifier le mot de passe avec user.comparePassword()
//   3. Retourner l'utilisateur si valide, sinon false
//
// Référence : Voir slide "⚙️ passport-local : Configuration"

passport.use('local', new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password',
    session: false
  },
  async (email, password, done) => {
    try {
      const user = await User.findByEmail(email);
      if (!user) {
        return done(null, false, { message: 'Email non trouvé' });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return done(null, false, { message: 'Mot de passe incorrect' });
      }

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

module.exports = passport;
