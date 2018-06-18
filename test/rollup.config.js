const { init, BUILD_TYPES } = require('../index.js').components.rollup;

var config = {
  buildTypes: [ BUILD_TYPES.MJS, BUILD_TYPES.CJS, BUILD_TYPES.CJS5, BUILD_TYPES.IIFE, BUILD_TYPES.IIFE5 ],
  distPath: 'dumpme',
  includePath: false,
  makeMinFiles: true,
  srcFolders: ['test/testFolders/rollupFolders/MJSWithLocalesAndTemplates/one']
};

module.exports = init(config);
