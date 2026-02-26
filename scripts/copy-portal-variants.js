const fs = require('fs');
const path = require('path');

const distDir = path.resolve(__dirname, '..', 'dist');
const indexPath = path.join(distDir, 'index.html');

if (!fs.existsSync(indexPath)) {
  console.error('dist/index.html not found. Run the build first.');
  process.exit(1);
}

const variants = ['simpleportal.html', 'portal.html', 'fullportal.html', 'embedded.html'];

for (const variant of variants) {
  fs.copyFileSync(indexPath, path.join(distDir, variant));
}

console.log('Portal variants created:', variants.join(', '));
