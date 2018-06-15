var { init, BUILD_TYPES } = require('./lib/rollup.root.config');

module.exports = {
  init, // Deprecated in 2.1.0 - To be removed in 3.0
  BUILD_TYPES, // Deprecated in 2.1.0 - To be removed in 3.0
  rollup: { init, BUILD_TYPES }
};
