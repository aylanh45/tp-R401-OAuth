# 🎓 TP3 : Intégration Passport Local + Passport JWT avec RBAC

**BUT Info S4 - R401 - Authentification JWT**
**Difficulté** : ⭐⭐⭐⭐ (Avancé)
**TODOs** : 6

---

## 🎯 Objectifs Pédagogiques

Ce TP final intègre tous les concepts des TP1 et TP2 :

1. ✅ **Combiner deux stratégies Passport** (Local pour login, JWT pour routes protégées)
2. ✅ **Implémenter un système RBAC** (Role-Based Access Control)
3. ✅ **Créer des middlewares de vérification de rôles**
4. ✅ **Intégrer le pattern Refresh Token avec Passport**
5. ✅ **Développer une API production-ready complète**

### Compétences Acquises

Après ce TP, vous saurez :
- ✅ Configurer plusieurs stratégies Passport dans une même application
- ✅ Utiliser Passport Local pour l'authentification initiale
- ✅ Utiliser Passport JWT pour protéger les routes
- ✅ Implémenter un système de rôles (admin, user)
- ✅ Créer des middlewares de vérification de rôles réutilisables
- ✅ Construire une architecture d'API moderne et sécurisée

---

## 📚 Prérequis

**Avant de commencer ce TP, vous devez avoir complété :**
- ✅ **TP1** : Passport Local Strategy
- ✅ **TP2** : JWT avec jsonwebtoken

**Connaissances requises :**
- Passport.js et stratégies (TP1)
- JWT : Access Token + Refresh Token (TP2)
- Middleware Express
- bcrypt pour le hachage

---

## 📁 Structure du Projet

```
tp3-passport-jwt/
├── server.js                 # Serveur Express (FOURNI)
├── .env                      # Variables d'environnement (FOURNI)
├── package.json              # Dépendances (FOURNI)
├── config/
│   └── passport.js           # ❌ TODO 1-2 : Configuration des 2 stratégies
├── models/
│   ├── User.js               # ✅ FOURNI : Modèle utilisateur avec rôles
│   └── RefreshToken.js       # ✅ FOURNI : Gestion refresh tokens
├── middleware/
│   └── roles.js              # ❌ TODO 3 : Middleware RBAC
└── routes/
    ├── auth.js               # ❌ TODO 4-7 : Routes d'authentification
    └── admin.js              # ❌ TODO 8-10 : Routes admin protégées
```

---

## 🔧 Installation

```bash
cd tp3-passport-jwt
npm install
npm start
```

Le serveur démarre sur http://localhost:3003

---

## 📝 Liste des TODOs (6)

### Partie 1 : Configuration Passport (config/passport.js)

#### TODO 1 : Configuration de la stratégie Local
- **Objectif** : Configurer Passport Local pour le login
- **Fichier** : `config/passport.js`
- **Références** :
  - Slide "🔐 passport-local : Configuration"
  - TP1 - config/passport.js
- **À implémenter** :
  ```javascript
  passport.use('local', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    session: false
  }, async (email, password, done) => {
    // 1. Trouver l'utilisateur avec User.findByEmail()
    // 2. Vérifier le mot de passe avec user.comparePassword()
    // 3. Retourner done(null, user) si succès
  }));
  ```

#### TODO 2 : Configuration de la stratégie JWT
- **Objectif** : Configurer Passport JWT pour protéger les routes
- **Fichier** : `config/passport.js`
- **Références** :
  - Slide "🔐 passport-jwt : Configuration"
  - Code fourni dans `models/User.js`
- **À implémenter** :
  ```javascript
  const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
  };

  passport.use('jwt', new JwtStrategy(jwtOptions, async (jwt_payload, done) => {
    // 1. Extraire userId du payload
    // 2. Trouver l'utilisateur avec User.findById()
    // 3. Retourner done(null, user) si trouvé
  }));
  ```

**🧪 Test après TODO 1-2** :
```bash
# Le serveur doit démarrer sans erreur
npm start
```

---

### Partie 2 : Middleware RBAC (middleware/roles.js)

#### TODO 3 : Middleware requireRole
- **Objectif** : Créer un middleware de vérification de rôles
- **Fichier** : `middleware/roles.js`
- **Références** :
  - Slide "🎯 Exemple Complet : API avec JWT"
  - Code similaire dans TP2 (middleware/auth.js)
- **À implémenter** :
  ```javascript
  function requireRole(allowedRoles) {
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    return (req, res, next) => {
      // 1. Vérifier que req.user existe
      // 2. Vérifier que req.user.role existe
      // 3. Vérifier que req.user.role est dans allowedRoles
      // 4. Si oui : next(), sinon : 403 Forbidden
    };
  }
  ```

**💡 Astuce** : Ce middleware doit être utilisé APRÈS `passport.authenticate('jwt')` car il dépend de `req.user`.

---

### Partie 3 : Routes d'authentification (routes/auth.js)

#### TODO 4 : Route de connexion avec Passport Local
- **Objectif** : Login avec Passport + génération de JWT
- **Route** : `POST /auth/login`
- **Fichier** : `routes/auth.js`
- **Références** :
  - TP1 - routes/auth.js (pour Passport)
  - TP2 - routes/auth.js (pour JWT)
- **À implémenter** :
  ```javascript
  router.post('/login', (req, res, next) => {
    passport.authenticate('local', { session: false }, async (err, user, info) => {
      // 1. Vérifier err et user
      // 2. Générer accessToken avec generateAccessToken()
      // 3. Générer refreshToken avec generateRefreshToken()
      // 4. Stocker le refreshToken avec RefreshToken.store()
      // 5. Retourner les deux tokens
    })(req, res, next);
  });
  ```

**🧪 Test après TODO 4** :
```bash
# Login avec admin
curl -X POST http://localhost:3003/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'

# Doit retourner : { accessToken, refreshToken, user: { role: "admin" } }
```

#### TODO 5 : Route protégée avec Passport JWT
- **Objectif** : Protéger une route avec Passport JWT
- **Route** : `GET /auth/profile`
- **Fichier** : `routes/auth.js`
- **Références** :
  - Slide "🔐 passport-jwt : Utilisation"
  - Code fourni dans `routes/auth.js` (refresh/logout)
- **À implémenter** :
  ```javascript
  router.get('/profile',
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {
      // Retourner req.user.toJSON()
    }
  );
  ```

**🧪 Test après TODO 5** :
```bash
# 1. Login pour obtenir l'access token
RESPONSE=$(curl -s -X POST http://localhost:3003/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}')

ACCESS_TOKEN=$(echo $RESPONSE | jq -r '.accessToken')

# 2. Accéder au profil
curl -X GET http://localhost:3003/auth/profile \
  -H "Authorization: Bearer $ACCESS_TOKEN"

# Doit retourner : { user: { id, email, role: "admin" } }
```

---

### Partie 4 : Routes admin protégées (routes/admin.js)

#### TODO 6 : Routes admin protégées (routes/admin.js)
- **Objectif** : Implémenter les 3 routes admin protégées
- **Routes** :
  - `GET /admin/dashboard` - Statistiques système
  - `GET /admin/users` - Liste des utilisateurs
  - `DELETE /admin/users/:id` - Supprimer un utilisateur
- **Fichier** : `routes/admin.js`
- **Références** : Slides + Code fourni dans `middleware/roles.js`
- **À implémenter** : Compléter les TODOs 8, 9, 10 dans le fichier
  - Chaque route doit utiliser `passport.authenticate('jwt')` + `requireAdmin`
  - La suppression doit empêcher l'auto-suppression
  - La suppression doit révoquer tous les tokens de l'utilisateur

**🧪 Test après TODO 6** :
```bash
# 1. Login en tant qu'admin
RESPONSE=$(curl -s -X POST http://localhost:3003/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}')

ADMIN_TOKEN=$(echo $RESPONSE | jq -r '.accessToken')

# 2. Accéder au dashboard admin
curl -X GET http://localhost:3003/admin/dashboard \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# 3. Tester avec un utilisateur normal (doit échouer avec 403)
USER_RESPONSE=$(curl -s -X POST http://localhost:3003/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"user123"}')

USER_TOKEN=$(echo $USER_RESPONSE | jq -r '.accessToken')

curl -X GET http://localhost:3003/admin/dashboard \
  -H "Authorization: Bearer $USER_TOKEN"
# Doit retourner 403 Forbidden
```

---

## 🧪 Tests Complets

### Scénario 1 : Authentification complète (admin)

```bash
# 1. Login admin
RESPONSE=$(curl -s -X POST http://localhost:3003/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}')

echo $RESPONSE | jq '.'

ACCESS_TOKEN=$(echo $RESPONSE | jq -r '.accessToken')
REFRESH_TOKEN=$(echo $RESPONSE | jq -r '.refreshToken')

# 2. Accéder au profil
curl -X GET http://localhost:3003/auth/profile \
  -H "Authorization: Bearer $ACCESS_TOKEN"

# 3. Accéder au dashboard admin
curl -X GET http://localhost:3003/admin/dashboard \
  -H "Authorization: Bearer $ACCESS_TOKEN"

# 4. Rafraîchir l'access token
curl -X POST http://localhost:3003/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\":\"$REFRESH_TOKEN\"}"

# 5. Logout
curl -X POST http://localhost:3003/auth/logout \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\":\"$REFRESH_TOKEN\"}"
```

### Scénario 2 : Vérification RBAC

```bash
# 1. Login en tant que user
USER_RESPONSE=$(curl -s -X POST http://localhost:3003/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"user123"}')

USER_TOKEN=$(echo $USER_RESPONSE | jq -r '.accessToken')

# 2. Accéder au profil (doit réussir)
curl -X GET http://localhost:3003/auth/profile \
  -H "Authorization: Bearer $USER_TOKEN"

# 3. Tenter d'accéder au dashboard admin (doit échouer 403)
curl -X GET http://localhost:3003/admin/dashboard \
  -H "Authorization: Bearer $USER_TOKEN"
```

### Scénario 3 : Gestion des utilisateurs (admin)

```bash
# 1. Login admin
RESPONSE=$(curl -s -X POST http://localhost:3003/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}')

ADMIN_TOKEN=$(echo $RESPONSE | jq -r '.accessToken')

# 2. Créer un nouvel utilisateur
curl -X POST http://localhost:3003/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","role":"user"}'

# 3. Lister tous les utilisateurs (admin)
curl -X GET http://localhost:3003/admin/users \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# 4. Supprimer l'utilisateur de test (ID 3)
curl -X DELETE http://localhost:3003/admin/users/3 \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

## 🔍 Concepts Clés

### 1. Architecture avec 2 Stratégies Passport

```
┌─────────────────────────────────────────────┐
│         Client (Application Web)            │
└──────────────┬──────────────────────────────┘
               │
               │ 1. POST /auth/login
               │    { email, password }
               ↓
┌──────────────────────────────────────────────┐
│     Passport Local Strategy                  │
│  ✓ Vérifie email + password                  │
│  ✓ Retourne l'utilisateur si valide          │
└──────────────┬───────────────────────────────┘
               │
               │ 2. Génère JWT
               │    accessToken + refreshToken
               ↓
┌──────────────────────────────────────────────┐
│          Retour au client                    │
│  { accessToken, refreshToken }               │
└──────────────┬───────────────────────────────┘
               │
               │ 3. GET /auth/profile
               │    Authorization: Bearer <token>
               ↓
┌──────────────────────────────────────────────┐
│      Passport JWT Strategy                   │
│  ✓ Extrait le token du header                │
│  ✓ Vérifie la signature                      │
│  ✓ Retourne l'utilisateur                    │
└──────────────┬───────────────────────────────┘
               │
               │ 4. req.user disponible
               ↓
┌──────────────────────────────────────────────┐
│       Middleware requireRole                 │
│  ✓ Vérifie req.user.role                     │
│  ✓ Autorise ou refuse l'accès                │
└──────────────────────────────────────────────┘
```

### 2. RBAC (Role-Based Access Control)

**Principe** : Les permissions sont accordées en fonction du rôle de l'utilisateur.

```javascript
// Rôles disponibles
const ROLES = {
  USER: 'user',      // Utilisateur standard
  ADMIN: 'admin'     // Administrateur
};

// Exemple de protection de route
router.get('/admin/dashboard',
  passport.authenticate('jwt', { session: false }), // Vérifie le JWT
  requireAdmin,                                      // Vérifie le rôle
  (req, res) => { ... }
);
```

### 3. Différences avec TP1 et TP2

| Aspect | TP1 | TP2 | TP3 |
|--------|-----|-----|-----|
| **Login** | Passport Local | Vérification manuelle | Passport Local |
| **Routes protégées** | Middleware custom | Middleware JWT custom | Passport JWT |
| **Tokens** | Simulation | Access + Refresh | Access + Refresh |
| **Rôles** | Non | Non | Oui (RBAC) |
| **Complexité** | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |

### 4. Ordre d'Exécution des Middlewares

```javascript
router.get('/admin/dashboard',
  // 1. Passport JWT : extrait et vérifie le token
  passport.authenticate('jwt', { session: false }),

  // 2. requireAdmin : vérifie que req.user.role === 'admin'
  requireAdmin,

  // 3. Controller : traite la requête
  (req, res) => {
    // req.user est disponible ici
    // req.user.role === 'admin' garanti
  }
);
```

---

## ✅ Checklist de Validation

### Configuration
- [ ] Les deux stratégies Passport (Local + JWT) sont configurées
- [ ] Le serveur démarre sans erreur
- [ ] Les variables d'environnement sont correctes

### Authentification
- [ ] Le login avec Passport Local fonctionne
- [ ] Le login génère Access Token + Refresh Token
- [ ] Le refresh token permet de rafraîchir l'access token
- [ ] Le logout révoque le refresh token

### Protection JWT
- [ ] La route `/auth/profile` nécessite un JWT valide
- [ ] Un JWT invalide retourne 401
- [ ] Un JWT expiré retourne 401

### RBAC
- [ ] Un admin peut accéder à `/admin/dashboard`
- [ ] Un user normal reçoit 403 sur `/admin/dashboard`
- [ ] Le middleware requireRole fonctionne correctement
- [ ] Un admin peut supprimer un utilisateur
- [ ] Un admin ne peut pas se supprimer lui-même

---

## 💡 Conseils et Astuces

### 1. Débugger les Stratégies Passport

```javascript
// Dans config/passport.js
passport.use('local', new LocalStrategy(..., async (email, password, done) => {
  console.log('🔍 LocalStrategy : Tentative de login pour', email);

  const user = await User.findByEmail(email);
  console.log('👤 Utilisateur trouvé :', user ? 'Oui' : 'Non');

  // ...
}));
```

### 2. Tester les Rôles

```bash
# Créer un admin personnalisé
curl -X POST http://localhost:3003/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"myadmin@example.com","password":"admin456","role":"admin"}'
```

### 3. Ordre des Middlewares

⚠️ **IMPORTANT** : `requireRole` doit toujours être après `passport.authenticate('jwt')`.

```javascript
// ✅ BON
router.get('/admin',
  passport.authenticate('jwt', { session: false }),
  requireAdmin,
  handler
);

// ❌ MAUVAIS
router.get('/admin',
  requireAdmin,  // req.user n'existe pas encore !
  passport.authenticate('jwt', { session: false }),
  handler
);
```

### 4. Gestion des Erreurs JWT

Les erreurs JWT sont gérées automatiquement par Passport JWT :
- Token expiré → 401 Unauthorized
- Token invalide → 401 Unauthorized
- Token absent → 401 Unauthorized

---

## 🚀 Pour Aller Plus Loin (Bonus)

### 1. Ajouter un rôle "moderator"

```javascript
// models/User.js
const ROLES = {
  USER: 'user',
  MODERATOR: 'moderator',
  ADMIN: 'admin'
};

// middleware/roles.js
function requireModerator(req, res, next) {
  return requireRole(['admin', 'moderator'])(req, res, next);
}
```

### 2. Implémenter des permissions granulaires

```javascript
const PERMISSIONS = {
  READ_USERS: ['admin', 'moderator'],
  DELETE_USERS: ['admin'],
  EDIT_USERS: ['admin', 'moderator']
};

function requirePermission(permission) {
  return (req, res, next) => {
    if (PERMISSIONS[permission].includes(req.user.role)) {
      return next();
    }
    return res.status(403).json({ error: 'Permission refusée' });
  };
}
```

### 3. Logger les actions admin

```javascript
// middleware/audit.js
function auditLog(action) {
  return (req, res, next) => {
    console.log(`[AUDIT] ${new Date().toISOString()} - ${req.user.email} - ${action}`);
    next();
  };
}

// Utilisation
router.delete('/admin/users/:id',
  passport.authenticate('jwt', { session: false }),
  requireAdmin,
  auditLog('DELETE_USER'),
  handler
);
```

---

## 📚 Références

### Slides à Consulter
- Section V : Passport.js (LocalStrategy + JwtStrategy)
- Section IV : Implémentation Node.js (jwt.sign, jwt.verify)
- Section VI : Bonnes Pratiques (Sécurité, Refresh Token)

### Code de Référence
- Examinez le code fourni (marqué FOURNI) dans `models/`, `routes/`
- Consultez les implémentations des TPs précédents

### TPs Précédents
- **TP1** : Configuration Passport Local, bcrypt
- **TP2** : JWT generation, verification, refresh token pattern

---

## 📞 Support

- **Email** : joseph.azar@univ-fcomte.fr
- **Slides** : Consultez les slides du cours R401

---

**BUT Info S4 - R401 - 2025**
