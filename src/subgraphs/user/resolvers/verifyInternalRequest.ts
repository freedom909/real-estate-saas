function verifyInternalRequest(req) {
  const token = req.headers["x-service-token"];

  if (token !== process.env.INTERNAL_SERVICE_TOKEN) {
    throw new Error("Forbidden");
  }
}

export default verifyInternalRequest;