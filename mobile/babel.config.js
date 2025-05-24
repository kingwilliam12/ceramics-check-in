// This file is the main Babel configuration
// For better organization, we've moved the plugin configuration to babel.config.plugin.js
const babelConfig = require('./babel.config.plugin');

module.exports = function(api) {
  return babelConfig(api);
};
