interface Request {
  headers: {
    [key: string]: string | string[] | undefined;
  };
}

function extractToken(req: Request): string | null {
  const auth = req.headers.authorization;
  if (!auth) return null;
  if (typeof auth === 'string' && auth.startsWith("Bearer ")) {
    return auth.slice(7);
  }
  return null;
}

export default extractToken;