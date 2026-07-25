const { createRequire } = require("module");
const require2 = createRequire(__filename);
const crypto = require2("crypto");
const fs = require2("fs");
const path = require2("path");

const keysDir = path.join(__dirname, "..", "keys");
fs.mkdirSync(keysDir, { recursive: true });

if (!fs.existsSync(path.join(keysDir, "private.pem"))) {
  const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
  });
  fs.writeFileSync(
    path.join(keysDir, "private.pem"),
    privateKey.export({ type: "pkcs8", format: "pem" })
  );
  fs.writeFileSync(
    path.join(keysDir, "public.pem"),
    publicKey.export({ type: "spki", format: "pem" })
  );
  fs.writeFileSync(
    path.join(keysDir, "refresh_private.pem"),
    privateKey.export({ type: "pkcs8", format: "pem" })
  );
  fs.writeFileSync(
    path.join(keysDir, "refresh_public.pem"),
    publicKey.export({ type: "spki", format: "pem" })
  );
  console.log("RSA keys generated.");
} else {
  console.log("RSA keys already exist.");
}
