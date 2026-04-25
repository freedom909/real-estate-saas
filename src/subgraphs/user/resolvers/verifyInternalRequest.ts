function verifyInternalRequest(req) {
  const token = req.get("x-service-token") || req.headers["x-service-token"];
  console.log("User Subgraph - Received x-service-token in verifyInternalRequest:", token); // Existing log

  if (token !== process.env.INTERNAL_SERVICE_TOKEN) {
    console.error("User Subgraph - Token mismatch or missing. Expected:", process.env.INTERNAL_SERVICE_TOKEN, "Received:", token); // More detailed error
    throw new Error("Forbidden: Invalid service token"); // More specific error message
  }
}

export default verifyInternalRequest;