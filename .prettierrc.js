// Prettier config options: https://prettier.io/docs/en/options.html
// Shared front-end config: https://git.pega.io/projects/FE/repos/configs/browse/packages/prettier-config/index.json

const pegaPrettierConfig = require('@pega/prettier-config');
const tailwindPrettierConfig = require('prettier-plugin-tailwindcss');

module.exports = {
  ...pegaPrettierConfig,
  ...tailwindPrettierConfig,
  printWidth: 150
};
