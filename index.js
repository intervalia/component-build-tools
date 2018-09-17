var { init, BUILD_TYPES } = require('./lib/rollup.root.config');
var {locales, templates} = require('./lib/build');

module.exports = {
  components: {
    build: {
      locales,
      templates
    },
    rollup: {
      init,
      BUILD_TYPES
    }
  }
};
