const fs = require('fs');
const path = require('path');

const pkgs = new Set();

function walk(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const f of files) {
    const fp = path.join(dir, f.name);
    if (f.isDirectory() && !f.name.startsWith('.') && f.name !== 'node_modules' && f.name !== '.next') {
      walk(fp);
    } else if (/\.(tsx?|jsx?)$/.test(f.name)) {
      const c = fs.readFileSync(fp, 'utf8');
      // Match: from "package", from "pkg/sub", import "package", require("package")
      const re = /(?:from|import|require\()\s*['"]([^'".\/][^'"]*?)['"]/g;
      let m;
      while ((m = re.exec(c)) !== null) {
        const full = m[1];
        const pkg = full.startsWith('@') ? full.split('/').slice(0, 2).join('/') : full.split('/')[0];
        pkgs.add(pkg);
      }
    }
  }
}

walk('.');

const deps = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const all = { ...deps.dependencies, ...deps.devDependencies };
const missing = [...pkgs].filter(p => !all[p]);

console.log('External imports found:', pkgs.size);
console.log('Missing packages:');
missing.forEach(p => console.log('  ' + p));
if (missing.length === 0) console.log('  (none)');
