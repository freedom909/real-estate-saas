async function getUserFromContext(req: any) {
  const header = req.headers["x-user"];

  if (!header) return null;

  try {
    return JSON.parse(
      Buffer.from(header, "base64").toString()
    );
  } catch (error) {
    console.error("Error parsing user from context:", error);
    return null;
  }
}

export default getUserFromContext;