const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const DiscordStrategy = require('passport-discord').Strategy;
const { 
  findUserByGoogleId, createUserFromGoogle,
  findUserByGithubId, createUserFromGithub,
  findUserByDiscordId, createUserFromDiscord
} = require('../models/User');

// TODO 1: Configuration de la stratégie Google OAuth 2.0
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
  passReqToCallback: true
}, async (req, accessToken, refreshToken, profile, done) => {
  try {
    const db = req.app.locals.db;

    // Chercher l'utilisateur par googleId
    let user = await findUserByGoogleId(db, profile.id);

    if (!user) {
      // Créer l'utilisateur s'il n'existe pas
      user = await createUserFromGoogle(db, {
        googleId: profile.id,
        email: profile.emails[0].value,
        name: profile.displayName,
        picture: profile.photos[0].value
      });
    }

    done(null, user);
  } catch (error) {
    done(error, null);
  }
}));

// PAS de serializeUser/deserializeUser car on utilise JWT (stateless)

// Configuration de la stratégie GitHub OAuth
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: process.env.GITHUB_CALLBACK_URL,
  passReqToCallback: true
}, async (req, accessToken, refreshToken, profile, done) => {
  try {
    const db = req.app.locals.db;
    let user = await findUserByGithubId(db, profile.id);
    if (!user) {
      user = await createUserFromGithub(db, {
        githubId: profile.id,
        email: profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null,
        name: profile.displayName || profile.username,
        picture: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null
      });
    }
    done(null, user);
  } catch (error) {
    done(error, null);
  }
}));

// Configuration de la stratégie Discord OAuth
passport.use(new DiscordStrategy({
  clientID: process.env.DISCORD_CLIENT_ID,
  clientSecret: process.env.DISCORD_CLIENT_SECRET,
  callbackURL: process.env.DISCORD_CALLBACK_URL,
  scope: ['identify', 'email'],
  passReqToCallback: true
}, async (req, accessToken, refreshToken, profile, done) => {
  try {
    const db = req.app.locals.db;
    let user = await findUserByDiscordId(db, profile.id);
    if (!user) {
      user = await createUserFromDiscord(db, {
        discordId: profile.id,
        email: profile.email || null,
        name: profile.username,
        picture: profile.avatar ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png` : null
      });
    }
    done(null, user);
  } catch (error) {
    done(error, null);
  }
}));

module.exports = passport;
