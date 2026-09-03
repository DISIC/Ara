const fs = require("fs");
const path = require("path");

// Copier confiture-api.ts vers confiture-web-app/src/types
const src = path.join(__dirname, "..", "confiture-rest-api", "confiture-api.ts");
const destDir = path.join(__dirname, "..", "confiture-web-app", "src", "types");
const dest = path.join(destDir, "confiture-api.ts");

// Créer le dossier de destination s'il n'existe pas
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

if (fs.existsSync(src)) {
  fs.copyFileSync(src, dest);
  console.log(`Copied confiture-api.ts to ${destDir}`);
} else {
  console.warn(`Warning: confiture-api.ts not found at ${src}`);
}
