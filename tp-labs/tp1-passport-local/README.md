# 🔐 TP1 : Authentification avec Passport Local Strategy

## 🎯 Objectifs Pédagogiques

À la fin de ce TP, vous serez capable de :
- ✅ Configurer Passport.js avec la stratégie Local
- ✅ Implémenter un système d'inscription sécurisé avec bcrypt
- ✅ Créer une route de connexion avec vérification des credentials
- ✅ Protéger des routes avec middleware d'authentification
- ✅ Comprendre la différence entre hachage et chiffrement

---

## 📚 Prérequis

Avant de commencer, assurez-vous d'avoir vu :
- **Slide Section V** : "🛂 Passport.js : Middleware d'Authentification"
- **Slide** : "📦 passport-local : Installation"
- **Slide** : "⚙️ passport-local : Configuration"
- **Slide** : "🔐 passport-local : Utilisation"

---

## 📁 Structure du Projet

```
tp1-passport-local/
├── server.js              # Point d'entrée (FOURNI)
├── config/
│   └── passport.js        # TODO: Configuration Passport
├── models/
│   └── User.js            # TODO: Modèle utilisateur
├── routes/
│   └── auth.js            # TODO: Routes d'authentification
├── package.json           # (FOURNI)
└── README.md              # Ce fichier
```

---

## 🚀 Installation

```bash
cd tp1-passport-local
npm install
```

---

## 📝 Travail à Réaliser

### TODO 1 : Configuration de Passport Local (config/passport.js)

**Fichier** : `config/passport.js`

**À faire** :
- Configurer `LocalStrategy` avec les options :
  - `usernameField: 'email'`
  - `passwordField: 'password'`
  - `session: false` (important pour JWT plus tard)
- Implémenter la fonction verify qui :
  1. Trouve l'utilisateur par email avec `User.findByEmail()`
  2. Vérifie le mot de passe avec `user.comparePassword()`
  3. Retourne `done(null, user)` si succès
  4. Retourne `done(null, false, { message: '...' })` si échec

**Référence** : Slide "⚙️ passport-local : Configuration"

**Exemple de structure** :
```javascript
passport.use('local', new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password',
    session: false
  },
  async (email, password, done) => {
    // Votre code ici
  }
));
```

---

### TODO 2 : Créer un utilisateur (models/User.js)

**Fichier** : `models/User.js`

**Méthode** : `User.create(email, password)`

**À faire** :
1. Vérifier si l'email existe déjà → lever une erreur si oui
2. Hacher le mot de passe avec `bcrypt.hash(password, 10)`
3. Créer un nouvel utilisateur avec le hash (jamais le mot de passe en clair !)
4. L'ajouter au tableau `users`
5. Retourner l'utilisateur (sans le password)

**Référence** : Slide "📦 passport-local : Configuration" (ligne avec bcrypt.hash)

**Indice** :
```javascript
const hashedPassword = await bcrypt.hash(password, 10);
```

---

### TODO 3 : Trouver un utilisateur par email (models/User.js)

**Fichier** : `models/User.js`

**Méthode** : `User.findByEmail(email)`

**À faire** :
- Chercher dans le tableau `users` un utilisateur avec cet email
- Retourner l'utilisateur complet (avec password hash) ou `null`

**Indice** :
```javascript
return users.find(u => u.email === email) || null;
```

---

### TODO 4 : Comparer le mot de passe (models/User.js)

**Fichier** : `models/User.js`

**Méthode** : `user.comparePassword(password)`

**À faire** :
- Utiliser `bcrypt.compare()` pour comparer le mot de passe en clair avec le hash stocké
- Retourner `true` si match, `false` sinon

**Référence** : Slide "⚙️ passport-local : Configuration" (ligne avec bcrypt.compare)

**Indice** :
```javascript
return await bcrypt.compare(password, this.password);
```

---

### TODO 5 : Route d'inscription (routes/auth.js)

**Fichier** : `routes/auth.js`

**Route** : `POST /auth/register`

**À faire** :
1. Extraire `email` et `password` du `req.body`
2. Valider que les deux sont fournis
3. Créer l'utilisateur avec `User.create(email, password)`
4. Retourner un message de succès avec `res.status(201).json(...)`

**Body attendu** :
```json
{
  "email": "alice@example.com",
  "password": "password123"
}
```

---

### TODO 6 : Route de connexion (routes/auth.js)

**Fichier** : `routes/auth.js`

**Route** : `POST /auth/login`

**À faire** :
- Utiliser `passport.authenticate('local', { session: false }, callback)`
- Le callback reçoit `(err, user, info)`
- Si erreur ou pas d'utilisateur : retourner 401
- Sinon : retourner succès avec `user.toJSON()`

**Référence** : Slide "🔐 passport-local : Utilisation"

**Structure** :
```javascript
passport.authenticate('local', { session: false }, (err, user, info) => {
  if (err || !user) {
    return res.status(401).json({ error: info ? info.message : 'Login failed' });
  }
  return res.json({ message: 'Connexion réussie', user: user.toJSON() });
})(req, res, next);
```

---

### TODO 7 : Middleware de protection (routes/auth.js)

**Fichier** : `routes/auth.js`

**Fonction** : `requireAuth(req, res, next)`

**À faire** :
- Vérifier si le header `x-user-id` existe
- Trouver l'utilisateur correspondant avec `User.getAll()`
- Si non trouvé : retourner 401
- Sinon : ajouter l'utilisateur à `req.user` et appeler `next()`

**Note** : On simule ici l'authentification pour ce TP. Dans le TP2, on utilisera un vrai JWT.

---

### TODO 8 : Route protégée (routes/auth.js)

**Fichier** : `routes/auth.js`

**Route** : `GET /auth/profile`

**À faire** :
- Utiliser le middleware `requireAuth`
- Retourner les infos de `req.user`

**Structure** :
```javascript
router.get('/profile', requireAuth, (req, res) => {
  res.json({ message: 'Profil utilisateur', user: req.user });
});
```

---

## 🧪 Tests

### Étape 1 : Démarrer le serveur

```bash
npm start
```

Vous devriez voir :
```
╔════════════════════════════════════════════════╗
║  TP1 : Passport Local Strategy                ║
║  Serveur démarré sur le port 3001             ║
╚════════════════════════════════════════════════╝
```

---

### Étape 2 : Tester l'inscription

```bash
curl -X POST http://localhost:3001/auth/register \
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

### Étape 3 : Tester le login

```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"password123"}'
```

**Résultat attendu** :
```json
{
  "message": "Connexion réussie",
  "user": {
    "id": 1,
    "email": "alice@example.com"
  }
}
```

---

### Étape 4 : Tester le login avec mauvais password

```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"wrong"}'
```

**Résultat attendu** :
```json
{
  "error": "Mot de passe incorrect"
}
```

---

### Étape 5 : Tester la route protégée

```bash
curl -X GET http://localhost:3001/auth/profile \
  -H "x-user-id: 1"
```

**Résultat attendu** :
```json
{
  "message": "Profil utilisateur",
  "user": {
    "id": 1,
    "email": "alice@example.com"
  }
}
```

---

### Étape 6 : Tester la route protégée sans authentification

```bash
curl -X GET http://localhost:3001/auth/profile
```

**Résultat attendu** :
```json
{
  "error": "Non authentifié"
}
```

---

### Étape 7 : Voir tous les utilisateurs (debug)

```bash
curl -X GET http://localhost:3001/auth/users
```

---

## ✅ Critères de Validation

Votre TP est réussi si :
- ✅ L'inscription créé un utilisateur avec mot de passe haché
- ✅ Le login réussit avec les bons credentials
- ✅ Le login échoue avec un mauvais mot de passe
- ✅ La route `/profile` retourne les infos avec le header `x-user-id`
- ✅ La route `/profile` retourne 401 sans le header

---

## 💡 Points Clés à Comprendre

### 1. Hachage vs Chiffrement

- **Hachage** (bcrypt) : One-way, impossible à inverser
- **Chiffrement** : Two-way, peut être déchiffré

```javascript
// ✅ BON : Hachage avec bcrypt
const hash = await bcrypt.hash('password', 10);
// On ne peut PAS récupérer 'password' depuis hash

// ❌ MAUVAIS : Stocker en clair
user.password = 'password123'; // JAMAIS FAIRE ÇA
```

### 2. Session: false

```javascript
{ session: false }
```

Pourquoi ? Parce qu'on va utiliser JWT (TP2), pas de sessions serveur.

### 3. La fonction verify de Passport

```javascript
async (email, password, done) => {
  // done(error, user, info)
  done(null, user);        // Succès
  done(null, false, info); // Échec
  done(err);               // Erreur serveur
}
```

### 4. Middleware Express

```javascript
function requireAuth(req, res, next) {
  // Vérifications...
  if (ok) {
    req.user = user;
    next(); // Passe au prochain middleware/route
  } else {
    res.status(401).json(...); // Stop ici
  }
}
```

---

## 🐛 Dépannage

### Erreur : "Méthode create() à compléter"

→ Vous devez implémenter la méthode `User.create()` dans `models/User.js`

### Erreur : "Route /login à compléter"

→ Vous devez implémenter la route dans `routes/auth.js` avec `passport.authenticate()`

### Le login réussit avec n'importe quel mot de passe

→ Vérifiez que vous utilisez bien `bcrypt.compare()` dans `comparePassword()`

### Erreur : "Cannot find module './config/passport'"

→ Vérifiez que le fichier `config/passport.js` existe et exporte `passport`

---

## 📚 Ressources

- **Slides** : Section V - Passport.js
- **Documentation** : [Passport.js](https://www.passportjs.org/)
- **Documentation** : [bcrypt](https://www.npmjs.com/package/bcryptjs)

---

## 🎓 Pour Aller Plus Loin (Bonus)

1. **Ajouter une validation d'email** (regex)
2. **Imposer une politique de mot de passe fort** (longueur, caractères spéciaux)
3. **Ajouter un champ "nom"** dans le modèle User
4. **Implémenter une route de modification de profil**
5. **Ajouter un système de rôles** (admin, user)

---

## 📞 Questions ?

joseph.azar@univ-fcomte.fr

**BUT Info S4 - R401 - TP1**
