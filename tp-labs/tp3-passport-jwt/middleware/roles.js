// Middleware de vérification des rôles (RBAC)

// TODO 3 : Middleware requireRole
function requireRole(allowedRoles) {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Non authentifié',
          message: 'Vous devez être connecté pour accéder à cette ressource'
        });
      }

      if (!req.user.role) {
        return res.status(403).json({
          error: 'Accès refusé',
          message: 'Aucun rôle assigné à cet utilisateur'
        });
      }

      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          error: 'Accès refusé',
          message: `Rôle requis : ${roles.join(' ou ')}. Votre rôle : ${req.user.role}`,
          required: roles,
          current: req.user.role
        });
      }

      next();
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  };
}

// Middleware requireAdmin (FOURNI)
function requireAdmin(req, res, next) {
  return requireRole('admin')(req, res, next);
}

// Middleware requireUser (FOURNI)
function requireUser(req, res, next) {
  return requireRole(['admin', 'user'])(req, res, next);
}

module.exports = {
  requireRole,
  requireAdmin,
  requireUser
};
