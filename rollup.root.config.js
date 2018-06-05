/* eslint brace-style: 0, spaced-comment: 0, no-multi-spaces: 0 */
const fs = require('fs');
const cbtCompile = require('./cbtCompile');
const glob = require('glob');
const path = require('path');
const getFileArrayFromGlob = require('./getFileArrayFromGlob');
const PLUGIN_BUBLE = require('rollup-plugin-buble')({ transforms: { dangerousTaggedTemplateString: true } });
const PLUGIN_UGLIFY = require('rollup-plugin-uglify-es')();
const ROOT = process.cwd();
const BUILD_TYPES = {
  IIFE: 'iife', // IFFE output
  IIFE5: 'iife5', // IFFE output with ES5 transpile
  CJS: 'cjs', // Common JS (require)
  CJS5: 'cjs5', // Common JS (require) with ES5 transpile
  MJS: 'es' // ES6 Modules (import)
};
const globOptions = { cwd: '/', root: '/' };
const getSrcFiles = (...pathParts) => glob.sync(path.resolve(...pathParts), globOptions);

function init(theirConfig = {}) {
  const rollupOptionsArray = [];
  const config = Object.assign({
    addEOLocale: true, // Add the EO locale if it does not exist
    addKELocale: false, // Add the KE locale if it does not exist
    alwaysReturnFile: false,
    buildTypes: [ BUILD_TYPES.MJS, BUILD_TYPES.CJS ],
    debug: false,
    defaultLocale: 'en',
    defaultLocaleVariable: 'document.documentElement.lang',
    distPath: 'dist/js', // Path into which the distribution files will be placed
    dstExtCJS: '.cjs.js',
    dstExtCJS5: '.cjs5.js',
    dstExtIIFE: '.iife.js',
    dstExtIIFE5: '.iife5.js',
    dstExtMJS: '.mjs',
    includePath: false, // Place the dist files in the distPath. `true` puts them in their own folder
    localeFiles: ['locales/strings_*.json'],
    makeMinFiles: false,
    minTemplateWS: true, // Minimize the white space for templates
    plugins: [],
    separateByLocale: false,
    sourcemap: false,
    //srcFileName: 'wc.*.mjs',
    srcFolders: [], // Where to look for source files. User must supply this
    tagMissingStrings: true, // Mark missing locale strings so they are easily seen
    templateFiles: ['*.html'],
    tempLocalesName: 'locales.mjs',
    tempPath: './_compiled/',
    tempTemplateName: 'templates.mjs',
    useStrict: false
  }, theirConfig);

  var tempFolders = Array.isArray(config.srcFolders) ? config.srcFolders : [config.srcFolders];
  const srcFolders = getFileArrayFromGlob(ROOT, tempFolders);

  srcFolders.forEach(
    tempPath => {
      const srcList = [];
      const srcRoot = path.dirname(tempPath);
      const temp = path.basename(tempPath);

      if (fs.lstatSync(tempPath).isDirectory()) {
        let fname = config.srcFileName || `${temp}.mjs`;
        let componentFile = getSrcFiles(tempPath, fname)[0];

        // istanbul ignore else
        if (componentFile && fs.existsSync(componentFile)) {
          const label = `Processing Locales and Templates for ${temp}`;
          console.time(label);

          srcList.push({
            srcPath: temp
          });

          let localeList = false;
          let componentPath = path.join(tempPath);
          // TODO: If we are compiling for each locale then we need to repeat the `srcList.push`

          let localeCode = cbtCompile.locales(componentPath, config);
          // istanbul ignore if
          if (typeof localeCode === 'object') {
            // Create one file per locale
            localeList = Object.keys(localeCode);
            localeList.forEach(
              (key) => {
                writeFile(path.join(componentPath, config.tempPath, config.tempLocalesName.replace('.mjs', `_${key}.mjs`)), localeCode[key]);
              }
            );
          }
          else if (localeCode) {
            localeList = true;
            writeFile(path.join(componentPath, config.tempPath, config.tempLocalesName), localeCode);
          }

          let templateCode = cbtCompile.templates(componentPath, config, localeList);
          if (templateCode) {
            writeFile(path.join(componentPath, config.tempPath, config.tempTemplateName), templateCode);
          }

          console.timeEnd(label);
        }
        else {
          return;
        }
      }

      srcList.forEach(
        ({ varName, srcPath, srcFile = config.srcFileName || srcPath + '.mjs', buildTypes }, index) => {
          // istanbul ignore if
          if (!srcPath) {
            throw new Error('`srcPath` must be defined at index ' + index);
          }
          // istanbul ignore if
          if (!srcFile) {
            throw new Error('`srcFile` must be defined at index ' + index);
          }

          const input = getSrcFiles(srcRoot, srcPath, srcFile)[0];

          config.buildTypes.forEach(
            buildType => {
              let format = buildType;
              let transpile = false;
              let dstName = srcPath;
              let plugins = [...config.plugins];

              if (buildType === BUILD_TYPES.IIFE5) {
                dstName += config.dstExtIIFE5;
                transpile = true;
                format = BUILD_TYPES.IIFE;
                // istanbul ignore else
                if (!varName) {
                  varName = srcPath.replace(/[.-]/g, '_');
                }
              }
              else if (buildType === BUILD_TYPES.IIFE) {
                dstName += config.dstExtIIFE;
                // istanbul ignore else
                if (!varName) {
                  varName = srcPath.replace(/[.-]/g, '_');
                }
              }
              else if (buildType === BUILD_TYPES.CJS5) {
                dstName += config.dstExtCJS5;
                transpile = true;
                format = BUILD_TYPES.CJS;
              }
              else if (buildType === BUILD_TYPES.CJS) {
                dstName += config.dstExtCJS;
              }
              else {
                dstName += config.dstExtMJS;
              }

              var outputPath = config.distPath || 'dist';
              var file = config.includePath ? path.resolve(ROOT, outputPath, srcPath, dstName) : path.resolve(ROOT, outputPath, dstName);

              const buildItem = {
                input,
                plugins,
                output: {
                  file,
                  format,
                  name: varName,
                  strict: config.useStrict || false
                }
              };

              if (transpile) {
                buildItem.plugins.push(PLUGIN_BUBLE);
              }

              if (config.sourcemap) {
                buildItem.output.sourcemap = true;
              }
              rollupOptionsArray.push(buildItem);

              if (config.makeMinFiles) {
                const buildItem2 = Object.assign({}, buildItem);
                buildItem2.plugins = [];
                if (transpile) {
                  buildItem2.plugins.push(PLUGIN_BUBLE);
                }
                buildItem2.plugins.push(PLUGIN_UGLIFY);
                buildItem2.output = Object.assign({}, buildItem.output);
                buildItem2.output.file = buildItem.output.file.replace(/(.[a-z]{2,3}$)/, '.min$1');
                rollupOptionsArray.push(buildItem2);
              }
            }
          );
        }
      );
    }
  );

  return rollupOptionsArray;
}

function createFolders(filePath) {
  let pathParts = filePath.split(path.sep);
  let len = pathParts.length;
  let tempPath = path.sep + pathParts[0];
  for (let i = 1; i < len; i++) {
    // istanbul ignore if
    if (!fs.existsSync(tempPath)) {
      fs.mkdirSync(tempPath);
    }

    tempPath = path.join(tempPath, pathParts[i]);
  }
}

function writeFile(filePath, content) {
  createFolders(filePath);

  let bakFilePath = `${filePath}.bak`;

  // istanbul ignore else
  if (fs.existsSync(bakFilePath)) {
    fs.unlinkSync(bakFilePath);
  }
  // istanbul ignore else
  if (fs.existsSync(filePath)) {
    fs.renameSync(filePath, bakFilePath);
  }

  fs.writeFileSync(filePath, content);
}

module.exports = {
  init,
  BUILD_TYPES
};
