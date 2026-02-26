/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const path = require('path');
const fg = require('fast-glob');

const root = path.resolve(__dirname, '..');
const pub = path.join(root, 'public');

function copyFile(src, dest) {
  const dir = path.dirname(dest);
  fs.mkdirSync(dir, { recursive: true });
  fs.copyFileSync(src, dest);
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function copyGlob(pattern, destDir) {
  const files = fg.sync(pattern, { cwd: root, absolute: true });
  fs.mkdirSync(destDir, { recursive: true });
  for (const file of files) {
    fs.copyFileSync(file, path.join(destDir, path.basename(file)));
  }
}

// assets/icons/* -> public/constellation/icons/
copyGlob('assets/icons/*', path.join(pub, 'constellation', 'icons'));

// assets/css/* -> public/assets/css/
copyGlob('assets/css/*', path.join(pub, 'assets', 'css'));

// assets/img/* -> public/assets/img/
copyGlob('assets/img/*', path.join(pub, 'assets', 'img'));

// sdk-config.json -> public/sdk-config.json
copyFile(path.join(root, 'sdk-config.json'), path.join(pub, 'sdk-config.json'));

// sdk-local-component-map.js -> public/sdk-local-component-map.js
copyFile(path.join(root, 'sdk-local-component-map.js'), path.join(pub, 'sdk-local-component-map.js'));

// @pega/auth auth files
const authDir = path.join(root, 'node_modules', '@pega', 'auth', 'lib', 'oauth-client');
if (fs.existsSync(authDir)) {
  copyFile(path.join(authDir, 'authDone.html'), path.join(pub, 'auth.html'));
  copyFile(path.join(authDir, 'authDone.js'), path.join(pub, 'authDone.js'));
}

// tinymce -> public/tinymce/
const tinymceSrc = path.join(root, 'node_modules', 'tinymce');
if (fs.existsSync(tinymceSrc)) {
  copyDir(tinymceSrc, path.join(pub, 'tinymce'));
}

// @pega/constellationjs
const constDir = path.join(root, 'node_modules', '@pega', 'constellationjs', 'dist');
if (fs.existsSync(constDir)) {
  // bootstrap-shell.js -> public/constellation/
  copyFile(path.join(constDir, 'bootstrap-shell.js'), path.join(pub, 'constellation', 'bootstrap-shell.js'));

  // bootstrap-shell.*.* -> public/constellation/
  copyGlob('node_modules/@pega/constellationjs/dist/bootstrap-shell.*.*', path.join(pub, 'constellation'));

  // lib_asset.json -> public/constellation/
  copyFile(path.join(constDir, 'lib_asset.json'), path.join(pub, 'constellation', 'lib_asset.json'));

  // constellation-core.*.* -> public/constellation/prerequisite/
  copyGlob('node_modules/@pega/constellationjs/dist/constellation-core.*.*', path.join(pub, 'constellation', 'prerequisite'));
}

console.log('Pega assets copied to public/');
