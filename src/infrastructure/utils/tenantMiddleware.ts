// src/infrastructure/utils/tenantMiddleware.ts

function tenantMiddleware(req, res, next) {
  const user = req.user; // JWT解析后

  req.tenantId = user.tenantId;

  next();
}

export default tenantMiddleware;