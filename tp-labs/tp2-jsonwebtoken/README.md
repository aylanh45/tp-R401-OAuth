# 🔑 TP2 : Authentification JWT avec jsonwebtoken

## 🎯 Objectifs Pédagogiques

À la fin de ce TP, vous serez capable de :
- ✅ Générer des Access Tokens et Refresh Tokens avec `jwt.sign()`
- ✅ Vérifier des tokens avec `jwt.verify()` et gérer les erreurs
- ✅ Créer un middleware d'authentification JWT
- ✅ Implémenter le pattern Refresh Token complet
- ✅ Révoquer des tokens pour la déconnexion
- ✅ Comprendre la différence entre Access Token et Refresh Token

**⚠️ Ce TP est le plus important du module !** Il couvre le cœur de l'authentification JWT.

---

## 📚 Prérequis

Avant de commencer, assurez-vous d'avoir vu :
- **Slide Section IV** : "💻 Implémentation en Node.js"
- **Slide** : "📦 La Bibliothèque `jsonwebtoken`"
- **Slide** : "🔐 Créer un JWT : `jwt.sign()`"
- **Slide** : "🔍 Vérifier un JWT : `jwt.verify()`"
- **Slide** : "⚠️ Gestion des Erreurs JWT"
- **Slide Section VI** : "⏱️ Durée de Vie des Tokens"
- **Slide** : "🔄 Implémentation : Refresh Token"

---

## 📁 Structure du Projet

```
tp2-jsonwebtoken/
├── server.js                   # Point d'entrée (FOURNI)
├── .env                        # Variables d'environnement (FOURNI)
├── utils/
│   └── jwt.js                  # TODO 1-5: Fonctions JWT
├── middleware/
│   └── auth.js                 # TODO 6: Middleware protection
├── models/
│   ├── User.js                 # (FOURNI)
│   └── RefreshToken.js         # TODO 7-9: Gestion refresh tokens
├── routes/
│   └── auth.js                 # TODO 10-13: Routes auth
├── package.json                # (FOURNI)
└── README.md                   # Ce fichier
```

**Total : 13 TODOs à compléter**

---

## 🚀 Installation

```bash
cd tp2-jsonwebtoken
npm install
```

---

## 📝 Travail à Réaliser (13 TODOs)

### Partie 1 : Génération et Vérification JWT (utils/jwt.js)

---

#### TODO 1 : Générer un Access Token

**Fichier** : `utils/jwt.js`

**Fonction** : `generateAccessToken(userId, email)`

**À faire** :
- Utiliser `jwt.sign()` pour créer un token
- Payload : `{ userId, email }`
- Clé secrète : `process.env.JWT_SECRET`
- Expiration : `'15m'` (15 minutes)

**Référence** : Slide "🔐 Créer un JWT : `jwt.sign()`"

**Code** :
```javascript
return jwt.sign(
  { userId, email },
  process.env.JWT_SECRET,
  { expiresIn: '15m' }
);
```

**Pourquoi 15 minutes ?** Pour minimiser les risques si le token est volé.

---

#### TODO 2 : Générer un Refresh Token

**Fichier** : `utils/jwt.js`

**Fonction** : `generateRefreshToken(userId)`

**À faire** :
- Utiliser `jwt.sign()` pour créer un refresh token
- Payload : `{ userId }` (pas besoin de l'email)
- Clé secrète : `process.env.JWT_REFRESH_SECRET` (**clé différente !**)
- Expiration : `'7d'` (7 jours)

**Référence** : Slide "🔄 Implémentation : Refresh Token (1/2)"

**Code** :
```javascript
return jwt.sign(
  { userId },
  process.env.JWT_REFRESH_SECRET,
  { expiresIn: '7d' }
);
```

**Pourquoi une clé différente ?** Pour que la compromission d'une clé n'affecte pas l'autre.

---

#### TODO 3 : Vérifier un Access Token

**Fichier** : `utils/jwt.js`

**Fonction** : `verifyAccessToken(token)`

**À faire** :
- Utiliser `jwt.verify()` pour vérifier le token
- Clé secrète : `process.env.JWT_SECRET`
- Retourner le payload décodé
- Laisser les erreurs se propager

**Référence** : Slide "🔍 Vérifier un JWT : `jwt.verify()`"

**Code** :
```javascript
return jwt.verify(token, process.env.JWT_SECRET);
```

**Que fait `jwt.verify()` ?**
1. Vérifie la signature cryptographique
2. Vérifie l'expiration
3. Retourne le payload si tout est OK
4. Lance une erreur sinon

---

#### TODO 4 : Vérifier un Refresh Token

**Fichier** : `utils/jwt.js`

**Fonction** : `verifyRefreshToken(token)`

**À faire** :
- Utiliser `jwt.verify()` avec `process.env.JWT_REFRESH_SECRET`
- Retourner le payload décodé

**Code** :
```javascript
return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
```

---

#### TODO 5 : Décoder un token sans vérification

**Fichier** : `utils/jwt.js`

**Fonction** : `decodeToken(token)`

**À faire** :
- Utiliser `jwt.decode()` pour décoder SANS vérifier

**⚠️ ATTENTION** : Cette fonction sert UNIQUEMENT pour le debug ! Ne JAMAIS l'utiliser pour l'authentification.

**Code** :
```javascript
return jwt.decode(token);
```

**Pourquoi ?** Le payload JWT est encodé en Base64, pas chiffré. On peut le lire sans la clé secrète.

---

### Partie 2 : Middleware d'Authentification (middleware/auth.js)

---

#### TODO 6 : Middleware de vérification JWT

**Fichier** : `middleware/auth.js`

**Fonction** : `authenticateToken(req, res, next)`

**À faire** :
1. Extraire le token du header `Authorization: Bearer <token>`
2. Vérifier qu'il existe
3. Vérifier sa validité avec `verifyAccessToken()`
4. Ajouter le payload à `req.user`
5. Gérer les erreurs (manquant, expiré, invalide)

**Référence** : Slide "⚠️ Gestion des Erreurs JWT"

**Code** :
```javascript
const authHeader = req.headers['authorization'];
const token = authHeader && authHeader.split(' ')[1];

if (!token) {
  return res.status(401).json({ error: 'Token manquant' });
}

try {
  const decoded = verifyAccessToken(token);
  req.user = decoded;
  next();
} catch (err) {
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token expiré',
      message: 'Utilisez /auth/refresh pour obtenir un nouveau token'
    });
  }
  if (err.name === 'JsonWebTokenError') {
    return res.status(403).json({ error: 'Token invalide' });
  }
  return res.status(500).json({ error: 'Erreur de vérification' });
}
```

**Types d'erreurs JWT** :
- `TokenExpiredError` : Le token a expiré (normal après 15 min)
- `JsonWebTokenError` : Signature invalide ou token malformé
- Autres : Erreurs serveur

---

### Partie 3 : Gestion des Refresh Tokens (models/RefreshToken.js)

---

#### TODO 7 : Stocker un refresh token

**Fichier** : `models/RefreshToken.js`

**Méthode** : `RefreshToken.store(userId, token)`

**À faire** :
1. Créer une instance de RefreshToken
2. L'ajouter au tableau `refreshTokens`
3. Retourner l'instance

**Code** :
```javascript
const refreshToken = new RefreshToken(userId, token);
refreshTokens.push(refreshToken);
return refreshToken;
```

**Pourquoi stocker ?** Pour pouvoir révoquer les tokens (logout).

---

#### TODO 8 : Trouver un refresh token

**Fichier** : `models/RefreshToken.js`

**Méthode** : `RefreshToken.findByToken(token)`

**À faire** :
- Chercher dans le tableau
- Retourner le RefreshToken ou null

**Code** :
```javascript
return refreshTokens.find(rt => rt.token === token) || null;
```

---

#### TODO 9 : Révoquer un refresh token

**Fichier** : `models/RefreshToken.js`

**Méthode** : `RefreshToken.revoke(token)`

**À faire** :
1. Trouver l'index du token
2. Le supprimer avec `splice()`
3. Retourner true si supprimé, false sinon

**Code** :
```javascript
const index = refreshTokens.findIndex(rt => rt.token === token);
if (index !== -1) {
  refreshTokens.splice(index, 1);
  return true;
}
return false;
```

**Référence** : Slide "🚫 Révocation des Tokens"

---

### Partie 4 : Routes d'Authentification (routes/auth.js)

---

#### TODO 10 : Route de connexion (Login)

**Fichier** : `routes/auth.js`

**Route** : `POST /auth/login`

**Body** : `{ email, password }`

**À faire** :
1. Vérifier les credentials
2. Générer Access Token (15 min)
3. Générer Refresh Token (7 jours)
4. Stocker le Refresh Token en DB
5. Retourner les deux tokens

**Référence** : Slide "🔄 Implémentation : Refresh Token (1/2)"

**Code (structure)** :
```javascript
const { email, password } = req.body;

// Vérifier credentials
const user = await User.findByEmail(email);
if (!user || !(await user.comparePassword(password))) {
  return res.status(401).json({ error: 'Credentials invalides' });
}

// Générer tokens
const accessToken = generateAccessToken(user.id, user.email);
const refreshToken = generateRefreshToken(user.id);

// Stocker le refresh token
await RefreshToken.store(user.id, refreshToken);

// Retourner
res.json({
  message: 'Connexion réussie',
  accessToken,
  refreshToken,
  expiresIn: '15 minutes'
});
```

---

#### TODO 11 : Route de rafraîchissement (Refresh)

**Fichier** : `routes/auth.js`

**Route** : `POST /auth/refresh`

**Body** : `{ refreshToken }`

**À faire** :
1. Vérifier que le refresh token est fourni
2. Vérifier sa signature
3. Vérifier qu'il existe en DB (pas révoqué)
4. Générer un nouveau Access Token
5. Retourner le nouveau token

**Référence** : Slide "🔄 Implémentation : Refresh Token (2/2)"

**Code (structure)** :
```javascript
const { refreshToken } = req.body;

// Vérifier la signature
let decoded;
try {
  decoded = verifyRefreshToken(refreshToken);
} catch (err) {
  if (err.name === 'TokenExpiredError') {
    return res.status(403).json({ error: 'Refresh token expiré' });
  }
  return res.status(403).json({ error: 'Refresh token invalide' });
}

// Vérifier qu'il existe en DB
const storedToken = await RefreshToken.findByToken(refreshToken);
if (!storedToken) {
  return res.status(403).json({ error: 'Refresh token révoqué' });
}

// Récupérer l'utilisateur
const user = await User.findById(decoded.userId);

// Générer nouveau Access Token
const newAccessToken = generateAccessToken(user.id, user.email);

res.json({
  message: 'Access Token rafraîchi',
  accessToken: newAccessToken,
  expiresIn: '15 minutes'
});
```

---

#### TODO 12 : Route de déconnexion (Logout)

**Fichier** : `routes/auth.js`

**Route** : `POST /auth/logout`

**Body** : `{ refreshToken }`

**À faire** :
1. Extraire le refresh token
2. Révoquer le token
3. Retourner succès

**Code** :
```javascript
const { refreshToken } = req.body;

if (!refreshToken) {
  return res.status(400).json({ error: 'Refresh token requis' });
}

const revoked = await RefreshToken.revoke(refreshToken);

if (revoked) {
  res.json({ message: 'Déconnexion réussie' });
} else {
  res.status(404).json({ error: 'Token non trouvé' });
}
```

---

#### TODO 13 : Route protégée

**Fichier** : `routes/auth.js`

**Route** : `GET /auth/profile`

**Header** : `Authorization: Bearer <access_token>`

**À faire** :
- Utiliser le middleware `authenticateToken`
- Retourner les infos de `req.user`

**Code** :
```javascript
router.get('/profile', authenticateToken, async (req, res) => {
  res.json({
    message: 'Profil utilisateur',
    user: {
      id: req.user.userId,
      email: req.user.email
    },
    tokenInfo: {
      issuedAt: new Date(req.user.iat * 1000),
      expiresAt: new Date(req.user.exp * 1000)
    }
  });
});
```

---

## 🧪 Tests Complets

### Préparation

```bash
npm start
```

### Test 1 : Inscription

```bash
curl -X POST http://localhost:3002/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"password123"}'
```

**Résultat attendu** :
```json
{
  "message": "Utilisateur créé",
  "user": {
    "id": 1,
    "email": "alice@example.com"
  }
}
```

---

### Test 2 : Login (obtenir Access + Refresh Token)

```bash
curl -X POST http://localhost:3002/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"password123"}'
```

**Résultat attendu** :
```json
{
  "message": "Connexion réussie",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "15 minutes"
}
```

**💾 Sauvegardez les tokens dans des variables** :
```bash
ACCESS_TOKEN="eyJhbGci..."
REFRESH_TOKEN="eyJhbGci..."
```

---

### Test 3 : Accéder au profil avec Access Token

```bash
curl -X GET http://localhost:3002/auth/profile \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

**Résultat attendu** :
```json
{
  "message": "Profil utilisateur",
  "user": {
    "id": 1,
    "email": "alice@example.com"
  },
  "tokenInfo": {
    "issuedAt": "2026-01-14T01:00:00.000Z",
    "expiresAt": "2026-01-14T01:15:00.000Z"
  }
}
```

---

### Test 4 : Rafraîchir l'Access Token

```bash
curl -X POST http://localhost:3002/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\":\"$REFRESH_TOKEN\"}"
```

**Résultat attendu** :
```json
{
  "message": "Access Token rafraîchi",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "15 minutes"
}
```

---

### Test 5 : Logout (révoquer le Refresh Token)

```bash
curl -X POST http://localhost:3002/auth/logout \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\":\"$REFRESH_TOKEN\"}"
```

**Résultat attendu** :
```json
{
  "message": "Déconnexion réussie"
}
```

---

### Test 6 : Essayer de rafraîchir avec un token révoqué

```bash
curl -X POST http://localhost:3002/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\":\"$REFRESH_TOKEN\"}"
```

**Résultat attendu** :
```json
{
  "error": "Refresh token révoqué ou invalide"
}
```

---

### Test 7 : Accéder au profil sans token

```bash
curl -X GET http://localhost:3002/auth/profile
```

**Résultat attendu** :
```json
{
  "error": "Token manquant"
}
```

---

### Test 8 : Accéder au profil avec token invalide

```bash
curl -X GET http://localhost:3002/auth/profile \
  -H "Authorization: Bearer invalid_token"
```

**Résultat attendu** :
```json
{
  "error": "Token invalide"
}
```

---

### Tests Debug (optionnels)

```bash
# Voir tous les refresh tokens actifs
curl -X GET http://localhost:3002/auth/debug/tokens

# Voir tous les utilisateurs
curl -X GET http://localhost:3002/auth/debug/users

# Décoder un token sans vérification
curl -X POST http://localhost:3002/auth/debug/decode \
  -H "Content-Type: application/json" \
  -d "{\"token\":\"$ACCESS_TOKEN\"}"
```

---

## ✅ Critères de Validation

Votre TP est réussi si :
- ✅ Le login génère Access Token + Refresh Token
- ✅ L'Access Token expire après 15 minutes
- ✅ Le Refresh Token fonctionne pour obtenir un nouveau Access Token
- ✅ La route `/profile` est accessible avec un Access Token valide
- ✅ La route `/profile` retourne 401 si token expiré
- ✅ Le logout révoque le Refresh Token
- ✅ Un Refresh Token révoqué ne peut plus être utilisé

---

## 💡 Concepts Clés à Comprendre

### 1. Pourquoi deux tokens ?

- **Access Token (15 min)** :
  - Courte durée = Risque limité si volé
  - Envoyé à chaque requête
  - JAMAIS stocké en DB (stateless !)

- **Refresh Token (7 jours)** :
  - Longue durée = Meilleure UX (pas de reconnexion constante)
  - Utilisé UNIQUEMENT pour /refresh
  - Stocké en DB = Peut être révoqué

### 2. Le pattern Refresh Token

```
Login → Access (15min) + Refresh (7j)
  ↓
Utiliser Access pour les requêtes
  ↓
Access expire → Utiliser Refresh pour en obtenir un nouveau
  ↓
Logout → Révoquer le Refresh
```

### 3. Pourquoi deux clés secrètes ?

```javascript
JWT_SECRET          // Pour Access Token
JWT_REFRESH_SECRET  // Pour Refresh Token
```

Si une clé est compromise, l'autre reste sécurisée.

### 4. Stateless vs Stateful

- **Access Token** : Stateless (pas de DB)
  - ✅ Rapide (vérification cryptographique)
  - ✅ Scalable
  - ❌ Impossible à révoquer

- **Refresh Token** : Stateful (stocké en DB)
  - ✅ Peut être révoqué
  - ❌ Requiert une DB

**Compromis parfait** : Access stateless + Refresh stateful

### 5. Gestion des erreurs JWT

```javascript
try {
  jwt.verify(token, secret);
} catch (err) {
  if (err.name === 'TokenExpiredError') {
    // Token expiré (normal)
  } else if (err.name === 'JsonWebTokenError') {
    // Signature invalide (attaque ?)
  }
}
```

---

## 🐛 Dépannage

### "generateAccessToken() à compléter"

→ Vous devez implémenter la fonction dans `utils/jwt.js`

### "Middleware authenticateToken à compléter"

→ Implémentez le middleware dans `middleware/auth.js`

### "Route /login à compléter"

→ Implémentez la route dans `routes/auth.js`

### Le token ne fonctionne pas

→ Vérifiez que vous utilisez bien `Authorization: Bearer <token>` (avec "Bearer" et un espace)

### "invalid signature"

→ Vérifiez que vous utilisez la bonne clé secrète (JWT_SECRET vs JWT_REFRESH_SECRET)

---

## 📚 Ressources

- **Slides** : Section IV et VI
- **Documentation** : [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)
- **JWT Debugger** : [jwt.io](https://jwt.io)

---

## 🎓 Pour Aller Plus Loin (Bonus)

1. **Ajouter un blacklist de tokens** révoqués
2. **Implémenter la rotation des Refresh Tokens** (nouveau à chaque refresh)
3. **Ajouter un champ "rôle"** dans le payload
4. **Limiter le nombre de Refresh Tokens** par utilisateur
5. **Implémenter un système de "Remember Me"** (Refresh Token plus long)

---

## 📞 Questions ?

joseph.azar@univ-fcomte.fr

**BUT Info S4 - R401 - TP2**
