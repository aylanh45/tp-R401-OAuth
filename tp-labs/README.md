# 🎓 Travaux Pratiques : Authentification JWT

Ce dossier contient 3 TPs progressifs pour maîtriser l'authentification moderne avec Passport.js et JWT.

---

## 📚 Vue d'Ensemble des TPs

| TP | Titre | Difficulté | TODOs | Objectif Principal |
|----|-------|------------|-------|-------------------|
| **TP1** | Passport Local Strategy | ⭐⭐ | 2 | Maîtriser Passport Local |
| **TP2** | JWT avec jsonwebtoken | ⭐⭐⭐ | 6 | Maîtriser JWT et Refresh Tokens |
| **TP3** | Passport JWT Integration | ⭐⭐⭐⭐ | 6 | Intégrer Passport + JWT + RBAC |

**Total** : 14 TODOs

---

## 🎯 Progression Pédagogique

```
TP1 (Passport Local)
  ↓
  Vous maîtrisez : Passport, LocalStrategy, bcrypt
  ↓
TP2 (jsonwebtoken)
  ↓
  Vous maîtrisez : JWT, Access/Refresh Tokens, Révocation
  ↓
TP3 (Passport JWT)
  ↓
  Vous maîtrisez : L'intégration complète pour une API professionnelle
```

---

## 📁 TP1 : Passport Local Strategy

**Dossier** : `tp1-passport-local/`

### Objectifs
- Configurer Passport.js avec LocalStrategy
- Implémenter un système d'inscription sécurisé
- Hacher les mots de passe avec bcrypt
- Créer des routes de login et un middleware de protection

### TODOs (2)
1. Configuration Passport Local (`config/passport.js`)
2. Route de login avec Passport (`routes/auth.js`)

### Installation
```bash
cd tp1-passport-local
npm install
npm start
```

### Test Rapide
```bash
# Inscription
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Login
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

### Concepts Clés
- ✅ Hachage vs Chiffrement
- ✅ Fonction verify de Passport
- ✅ `session: false` pour JWT futur
- ✅ Middleware Express

**📄 Documentation complète** : [tp1-passport-local/README.md](tp1-passport-local/README.md)

---

## 📁 TP2 : JWT avec jsonwebtoken

**Dossier** : `tp2-jsonwebtoken/`

### Objectifs
- Générer des Access Tokens (15 min) et Refresh Tokens (7 jours)
- Vérifier des tokens et gérer les erreurs
- Créer un middleware d'authentification JWT
- Implémenter le pattern Refresh Token complet
- Révoquer des tokens

### TODOs (6)
**Partie 1 : middleware/auth.js**
1. Middleware authenticateToken

**Partie 2 : routes/auth.js**
2. Route de login (génère les 2 tokens)
3. Route de refresh (nouveau Access Token)
4. Route de logout (révoque Refresh Token)
5. Route protégée /profile (utilise le middleware)
6. Route protégée /admin (utilise le middleware)

### Installation
```bash
cd tp2-jsonwebtoken
npm install
npm start
```

### Test Complet
```bash
# 1. Login → obtenir Access + Refresh
RESPONSE=$(curl -s -X POST http://localhost:3002/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"password123"}')

# 2. Extraire les tokens
ACCESS_TOKEN=$(echo $RESPONSE | jq -r '.accessToken')
REFRESH_TOKEN=$(echo $RESPONSE | jq -r '.refreshToken')

# 3. Accéder au profil
curl -X GET http://localhost:3002/auth/profile \
  -H "Authorization: Bearer $ACCESS_TOKEN"

# 4. Rafraîchir l'Access Token
curl -X POST http://localhost:3002/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\":\"$REFRESH_TOKEN\"}"

# 5. Logout
curl -X POST http://localhost:3002/auth/logout \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\":\"$REFRESH_TOKEN\"}"
```

### Concepts Clés
- ✅ Access Token (stateless, courte durée)
- ✅ Refresh Token (stateful, longue durée)
- ✅ Pattern Refresh Token
- ✅ Révocation de tokens
- ✅ Gestion d'erreurs JWT (TokenExpiredError, JsonWebTokenError)
- ✅ Deux clés secrètes (JWT_SECRET vs JWT_REFRESH_SECRET)

**📄 Documentation complète** : [tp2-jsonwebtoken/README.md](tp2-jsonwebtoken/README.md)

---

## 📁 TP3 : Passport JWT Integration

**Dossier** : `tp3-passport-jwt/`

### Objectifs
- Combiner Passport Local (login) + Passport JWT (routes protégées)
- Implémenter un système de rôles (admin, user)
- Créer des middlewares de vérification de rôles (RBAC)
- Intégrer le pattern Refresh Token avec Passport
- Développer une API production-ready complète

### TODOs (6)
**Partie 1 : config/passport.js**
1. Configuration Passport Local (pour login)
2. Configuration Passport JWT (pour routes protégées)

**Partie 2 : middleware/roles.js**
3. Middleware requireRole (RBAC)

**Partie 3 : routes/auth.js**
4. Route de login avec Passport Local + génération JWT
5. Route protégée /profile avec Passport JWT

**Partie 4 : routes/admin.js**
6. Routes admin protégées (dashboard, users, delete)

### Installation
```bash
cd tp3-passport-jwt
npm install
npm start
```

### Test Rapide
```bash
# 1. Login admin
RESPONSE=$(curl -s -X POST http://localhost:3003/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}')

ACCESS_TOKEN=$(echo $RESPONSE | jq -r '.accessToken')

# 2. Accéder au dashboard admin
curl -X GET http://localhost:3003/admin/dashboard \
  -H "Authorization: Bearer $ACCESS_TOKEN"

# 3. Tester avec un user normal (doit échouer avec 403)
USER_RESPONSE=$(curl -s -X POST http://localhost:3003/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"user123"}')

USER_TOKEN=$(echo $USER_RESPONSE | jq -r '.accessToken')

curl -X GET http://localhost:3003/admin/dashboard \
  -H "Authorization: Bearer $USER_TOKEN"
```

### Concepts Clés
- ✅ Stratégies multiples avec Passport (Local + JWT)
- ✅ Extracteurs JWT (fromAuthHeaderAsBearerToken)
- ✅ RBAC (Role-Based Access Control)
- ✅ Middleware requireRole pour protection par rôle
- ✅ Intégration complète pour API production-ready
- ✅ Utilisateurs par défaut (admin et user)

**📄 Documentation complète** : [tp3-passport-jwt/README.md](tp3-passport-jwt/README.md)

---

## 🎯 Compétences Acquises Après les 3 TPs

### TP1 → Vous savez :
- ✅ Configurer Passport.js
- ✅ Hacher des mots de passe avec bcrypt
- ✅ Créer une stratégie d'authentification
- ✅ Protéger des routes avec middleware

### TP1 + TP2 → Vous savez :
- ✅ Générer et vérifier des JWT
- ✅ Implémenter Access Token + Refresh Token
- ✅ Gérer les erreurs JWT
- ✅ Révoquer des tokens
- ✅ Créer une API stateless sécurisée

### TP1 + TP2 + TP3 → Vous savez :
- ✅ Intégrer Passport + JWT
- ✅ Gérer les rôles utilisateurs
- ✅ Créer une API production-ready
- ✅ Combiner différentes stratégies d'authentification

---

## 📊 Correspondance avec la Présentation

| Slides | TP | Concepts Couverts |
|--------|-----|-------------------|
| Section V : Passport.js | TP1 | passport-local, Configuration, Utilisation |
| Section IV : Implémentation Node.js | TP2 | jwt.sign(), jwt.verify(), Middleware |
| Section VI : Bonnes Pratiques | TP2 | Refresh Token, Révocation, Sécurité |
| Section V : passport-jwt | TP3 | Stratégie JWT, Extracteurs, Intégration |

---

## 🧪 Validation des Acquis

### Checklist TP1
- [ ] L'inscription hache le mot de passe
- [ ] Le login vérifie les credentials avec Passport
- [ ] Les routes sont protégées par middleware
- [ ] Impossible de se connecter avec mauvais password

### Checklist TP2
- [ ] Login génère Access + Refresh Token
- [ ] Access Token expire après 15 min
- [ ] Refresh Token fonctionne pour rafraîchir
- [ ] Logout révoque le Refresh Token
- [ ] Routes protégées nécessitent JWT valide
- [ ] Erreurs JWT gérées (expiré, invalide)

### Checklist TP3
- [ ] Passport Local pour login (génère Access + Refresh Token)
- [ ] Passport JWT pour routes protégées
- [ ] Rôles utilisateur fonctionnels (admin, user)
- [ ] Routes admin protégées (requireRole/requireAdmin)
- [ ] Admin peut accéder à /admin/dashboard
- [ ] User normal reçoit 403 sur routes admin
- [ ] Suppression d'utilisateur fonctionne (admin uniquement)
- [ ] Impossible de se supprimer soi-même
- [ ] Intégration complète et fonctionnelle

---

## 💡 Conseils pour les Étudiants

### Ordre de Travail Recommandé
1. **Commencez par TP1** : Fondations essentielles
2. **Passez au TP2** : Le plus important, prenez votre temps
3. **Terminez par TP3** : Intégration finale

### Stratégie de Résolution
1. **Lisez le README complet** avant de commencer
2. **Consultez les slides** mentionnées dans les TODOs
3. **Testez après chaque TODO** complété
4. **Utilisez les routes de debug** pour comprendre l'état
5. **Examinez le code fourni** dans les autres fichiers du TP

### En Cas de Blocage
1. Relisez le TODO et la référence slide
2. Regardez les fichiers fournis (marqués FOURNI) dans le même TP
3. **Consultez les exemples** dans `../exemples-presentation/` (code complet fonctionnel)
4. Testez avec curl pour voir l'erreur exacte
5. Vérifiez les variables d'environnement (.env)
6. Demandez de l'aide avec le message d'erreur complet

---

## 📁 Fichiers Fournis vs À Compléter

### TP1 : passport-local
- ✅ **Fourni** : `server.js`, `package.json`
- ❌ **À compléter** : `config/passport.js`, `models/User.js`, `routes/auth.js`

### TP2 : jsonwebtoken
- ✅ **Fourni** : `server.js`, `package.json`, `.env`, `models/User.js`
- ❌ **À compléter** : `utils/jwt.js`, `middleware/auth.js`, `models/RefreshToken.js`, `routes/auth.js`

### TP3 : passport-jwt
- ✅ **Fourni** : `server.js`, `package.json`, `.env`, `models/User.js`, `models/RefreshToken.js`
- ❌ **À compléter** : `config/passport.js`, `middleware/roles.js`, `routes/auth.js`, `routes/admin.js`

---

## 🎓 Évaluation Suggérée

### Critères de Notation (sur 20)

**TP1** (6 points) :
- Fonctionnalité : 4 pts
- Code qualité : 1 pt
- Tests réussis : 1 pt

**TP2** (10 points) :
- Fonctionnalité : 6 pts
- Code qualité : 2 pts
- Tests réussis : 2 pts

**TP3** (4 points) :
- Intégration : 2 pts
- Bonus/Créativité : 2 pts

---

## 📞 Support

- **Email** : joseph.azar@univ-fcomte.fr
- **Exemples** : Dossier `../exemples-presentation/` (5 fichiers .js complets)
- **Slides** : Consultez les slides du cours R401

---

**BUT Info S4 - R401 - 2025**
