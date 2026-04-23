// Configuration de Passport avec 2 stratégies

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const User = require('../models/User');

// TODO 1 : Configuration de la stratégie Local
passport.use('local', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  session: false
}, async (email, password, done) => {
  try {
    const user = await User.findByEmail(email);
    if (!user) {
      return done(null, false, { message: 'Email ou mot de passe incorrect' });
    }

    const isValid = await user.comparePassword(password);
    if (!isValid) {
      return done(null, false, { message: 'Email ou mot de passe incorrect' });
    }

    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

// TODO 2 : Configuration de la stratégie JWT
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
};

passport.use('jwt', new JwtStrategy(jwtOptions, async (jwt_payload, done) => {
  try {
    const userId = jwt_payload.userId;
    const user = await User.findById(userId);

    if (user) {
      return done(null, user);
    } else {
      return done(null, false);
    }
  } catch (err) {
    return done(err);
  }
}));

module.exports = passport;
