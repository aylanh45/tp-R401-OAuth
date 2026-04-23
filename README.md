# 🎓 R401-S01 : Authentification JWT avec Node.js

**BUT Informatique - Semestre 4 - Module R401**
**Sujet** : Travaux Pratiques sur l'Authentification JWT et Passport.js

---

## 📋 Description

Ce dépôt contient **3 travaux pratiques progressifs** pour maîtriser l'authentification moderne avec **JSON Web Tokens (JWT)** et **Passport.js** dans des applications Node.js/Express.

Les TPs sont conçus pour être complétés en **75 minutes au total** et couvrent :
- L'authentification basée sur sessions → tokens
- La génération et vérification de JWT
- Le pattern Access Token + Refresh Token
- Le contrôle d'accès basé sur les rôles (RBAC)
- L'intégration de stratégies Passport multiples

---

## 🎯 Objectifs Pédagogiques

À la fin de ces TPs, vous serez capable de :

1. ✅ **Comprendre les limites** des sessions et pourquoi migrer vers JWT
2. ✅ **Implémenter Passport.js** avec différentes stratégies (Local, JWT)
3. ✅ **Générer et vérifier des JWT** avec `jsonwebtoken`
4. ✅ **Gérer le cycle de vie des tokens** (Access Token, Refresh Token, révocation)
5. ✅ **Sécuriser une API RESTful** avec authentification et autorisation
6. ✅ **Implémenter RBAC** (Role-Based Access Control) avec middleware
7. ✅ **Développer une architecture API production-ready**

---

## 📁 Structure du Projet

```
jwt-webservices/
├── README.md                    # Ce fichier
├── .gitignore                   # Configuration Git
├── exemples-presentation/       # Exemples de code complets (référence)
│   ├── 1-basic-jwt.js           # Exemple : Génération/vérification JWT basique
│   ├── 2-simple-api-jwt.js      # Exemple : API simple avec JWT
│   ├── 3-passport-local.js      # Exemple : Passport Local Strategy
│   ├── 4-passport-jwt.js        # Exemple : Passport JWT + RBAC
│   └── 5-refresh-token.js       # Exemple : Pattern Refresh Token complet
└── tp-labs/                     # Dossier des TPs
    ├── README.md                # Vue d'ensemble des 3 TPs
    ├── tp1-passport-local/      # TP1 : Passport Local Strategy (2 TODOs)
    ├── tp2-jsonwebtoken/        # TP2 : JWT avec jsonwebtoken (6 TODOs)
    └── tp3-passport-jwt/        # TP3 : Passport JWT + RBAC (6 TODOs)
```

---

## 🚀 Démarrage Rapide

### 1. Cloner le dépôt

```bash
git clone git@github.com:josephazar/R401-S01-AUTH.git
cd R401-S01-AUTH
```

### 2. Lire la documentation

Consultez le fichier principal des TPs :

```bash
cat tp-labs/README.md
```

### 3. Commencer par TP1

```bash
cd tp-labs/tp1-passport-local
npm install
cat README.md  # Lire les instructions
npm start      # Démarrer le serveur
```

---

## 📚 Progression des TPs

| TP | Titre | TODOs | Objectif |
|----|-------|-------|----------|
| **TP1** | Passport Local Strategy | 2 | Maîtriser Passport Local et authentification basique |
| **TP2** | JWT avec jsonwebtoken | 6 | Maîtriser JWT, Access/Refresh Tokens, middleware |
| **TP3** | Passport JWT + RBAC | 6 | Intégrer Passport JWT et contrôle d'accès par rôles |

**Total** : 14 TODOs · **Durée estimée** : ~75 minutes

---

## 📖 Exemples de Référence

Le dossier `exemples-presentation/` contient **5 exemples complets et fonctionnels** pour vous aider :

| Fichier | Description | Utilité |
|---------|-------------|---------|
| `1-basic-jwt.js` | Génération et vérification JWT de base | Comprendre jwt.sign() et jwt.verify() |
| `2-simple-api-jwt.js` | API simple avec JWT | Voir une implémentation minimale |
| `3-passport-local.js` | Passport Local Strategy | Référence pour TP1 |
| `4-passport-jwt.js` | Passport JWT + RBAC | Référence pour TP3 |
| `5-refresh-token.js` | Pattern Refresh Token complet | Référence pour TP2 et TP3 |

**💡 Comment utiliser les exemples** :
- Consultez-les si vous êtes bloqué sur un TODO
- Comparez votre code avec les exemples
- Ne copiez pas directement : comprenez la logique !

---

## 🔑 Concepts Clés

### Sessions vs Tokens

```
Sessions (Stateful)              Tokens (Stateless)
┌─────────────────┐              ┌─────────────────┐
│   Client        │              │   Client        │
│   ┌──────┐      │              │   ┌──────┐      │
│   │Cookie│      │              │   │ JWT  │      │
│   └──┬───┘      │              │   └──┬───┘      │
└──────┼──────────┘              └──────┼──────────┘
       │                                 │
       │ Session ID                      │ Token complet
       ↓                                 ↓
┌─────────────────┐              ┌─────────────────┐
│   Serveur       │              │   Serveur       │
│  ┌──────────┐   │              │  (Vérifie       │
│  │ Session  │   │              │   signature     │
│  │  Store   │   │              │   uniquement)   │
│  └──────────┘   │              │                 │
└─────────────────┘              └─────────────────┘
    Redis/DB                      Pas de stockage !
```

### JWT (JSON Web Token)

Un JWT est composé de **3 parties** séparées par des points :

```
Header.Payload.Signature
```

**Exemple** :
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20ifQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

- **Header** : Algorithme et type (`{"alg":"HS256","typ":"JWT"}`)
- **Payload** : Données utilisateur (`{"userId":1,"email":"admin@example.com"}`)
- **Signature** : Preuve d'authenticité (calculée avec une clé secrète)

### Access Token + Refresh Token

```
Access Token                     Refresh Token
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Durée de vie : 15 minutes        Durée de vie : 7 jours
Stocké en : Mémoire (JS)         Stocké en : Cookie HttpOnly
Usage : Chaque requête API       Usage : Rafraîchir Access Token
Révocation : Non (expire vite)   Révocation : Oui (en base)
```

### RBAC (Role-Based Access Control)

```javascript
// Utilisateurs avec rôles
{ id: 1, email: "admin@example.com", role: "admin" }
{ id: 2, email: "user@example.com",  role: "user" }

// Middleware de protection
requireRole('admin')  → Autorise uniquement les admins
requireRole(['admin', 'user'])  → Autorise admin ET user
```

---

## 🛠️ Technologies Utilisées

- **Node.js** (v18+)
- **Express** (v5.2.1) - Framework web
- **Passport.js** (v0.7.0) - Middleware d'authentification
  - `passport-local` - Stratégie login/password
  - `passport-jwt` - Stratégie JWT
- **jsonwebtoken** (v9.0.3) - Génération et vérification JWT
- **bcryptjs** (v3.0.3) - Hachage de mots de passe
- **dotenv** (v16.4.7) - Variables d'environnement

---

## 🧪 Exemples de Tests

### Test TP1 : Login avec Passport Local

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

### Test TP2 : JWT Access + Refresh

```bash
# Login → Obtenir tokens
RESPONSE=$(curl -s -X POST http://localhost:3002/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"password123"}')

ACCESS_TOKEN=$(echo $RESPONSE | jq -r '.accessToken')

# Accéder à une route protégée
curl -X GET http://localhost:3002/auth/profile \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

### Test TP3 : RBAC avec Passport JWT

```bash
# Login admin
ADMIN_TOKEN=$(curl -s -X POST http://localhost:3003/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}' \
  | jq -r '.accessToken')

# Accéder au dashboard admin
curl -X GET http://localhost:3003/admin/dashboard \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Login user normal
USER_TOKEN=$(curl -s -X POST http://localhost:3003/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"user123"}' \
  | jq -r '.accessToken')

# Tenter d'accéder au dashboard (doit échouer avec 403)
curl -X GET http://localhost:3003/admin/dashboard \
  -H "Authorization: Bearer $USER_TOKEN"
```

---

## 📖 Documentation

### Lecture Recommandée

1. **JWT Introduction** : https://jwt.io/introduction
2. **Passport.js Documentation** : https://www.passportjs.org/
3. **Express Security Best Practices** : https://expressjs.com/en/advanced/best-practice-security.html

### Références Internes

- [Vue d'ensemble des 3 TPs](tp-labs/README.md)
- [TP1 : Passport Local](tp-labs/tp1-passport-local/README.md)
- [TP2 : JWT avec jsonwebtoken](tp-labs/tp2-jsonwebtoken/README.md)
- [TP3 : Passport JWT + RBAC](tp-labs/tp3-passport-jwt/README.md)

---

## ⚠️ Notes Importantes

### Secrets et Variables d'Environnement

**Exception Éducative** : Les fichiers `.env` sont **inclus** dans ce dépôt pour faciliter les TPs.

```
⚠️ EN PRODUCTION : NE JAMAIS COMMITER DE FICHIERS .env RÉELS !

Les secrets présents ici sont factices et à usage pédagogique uniquement.
En production, utilisez des gestionnaires de secrets (Vault, AWS Secrets Manager, etc.)
```

### Base de Données Simulée

Les TPs utilisent des **tableaux en mémoire** pour simuler une base de données :

```javascript
const users = []; // Stockage en mémoire
```

**En production**, utilisez une vraie base de données :
- PostgreSQL / MySQL (relationnel)
- MongoDB (NoSQL)
- Redis (pour les sessions/tokens)

---

## 🔒 Sécurité - Bonnes Pratiques

### ✅ À FAIRE

- ✅ Hacher les mots de passe avec bcrypt (salt rounds ≥ 10)
- ✅ Utiliser HTTPS en production
- ✅ Stocker les Refresh Tokens en base de données
- ✅ Implémenter la révocation de tokens
- ✅ Utiliser des secrets forts (≥ 256 bits aléatoires)
- ✅ Valider les entrées utilisateur
- ✅ Limiter la durée de vie des Access Tokens (15 min)
- ✅ Utiliser des cookies HttpOnly pour les Refresh Tokens

### ❌ À ÉVITER

- ❌ Stocker les mots de passe en clair
- ❌ Utiliser des secrets simples (`"secret"`, `"123456"`)
- ❌ Donner des Access Tokens longue durée (>1h)
- ❌ Stocker des JWT dans localStorage (XSS)
- ❌ Ignorer la validation côté serveur
- ❌ Exposer des informations sensibles dans les tokens
- ❌ Utiliser HTTP en production

---

## 🤝 Support et Contribution

### Contact

- **Enseignant** : Joseph Azar
- **Email** : joseph.azar@univ-fcomte.fr
- **Module** : R401 - BUT Informatique S4

### Signaler un Problème

Si vous rencontrez un bug ou avez une suggestion :

1. Vérifiez que vous avez bien suivi les instructions du README
2. Consultez les exemples de tests fournis
3. Contactez l'enseignant par email avec :
   - Le numéro du TP
   - Le message d'erreur complet
   - Les étapes pour reproduire le problème

---

## 📜 Licence

**Usage Éducatif Uniquement** - BUT Informatique - Université de Franche-Comté

Le code de ce dépôt est fourni à des fins pédagogiques. Les étudiants peuvent l'utiliser pour apprendre et compléter leurs TPs. Toute utilisation commerciale est interdite.

---

## 🎓 Crédits

**Année Universitaire** : 2025-2026
**Module** : R401 - Développement Web Avancé
**Formation** : BUT Informatique - Semestre 4
**Université** : Université de Franche-Comté

---

**Bon courage pour vos TPs ! 🚀**
