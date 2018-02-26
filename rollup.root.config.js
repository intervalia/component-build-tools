/* eslint brace-style: 0, spaced-comment: 0, no-multi-spaces: 0 */
const fs = require('fs');
const cbtCompile = require('./cbtCompile');
const glob = require('glob');
const path = require('path');
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
    alwaysReturnFile: true,
    buildTypes: [ BUILD_TYPES.MJS, BUILD_TYPES.IIFE ],
    debug: false,
    defaultLocale: 'en',
    distPath: 'dist/js', // Path into which the distribution files will be placed
    includePath: true, // Place the dist files inside their folder
    localeFiles: ['locales/strings_*.json'],
    makeMinFiles: true,
    minTempalteWS: true, // Minimize the white space for templates
    separateByLocale: false,
    //srcFileName: 'wc.*.mjs',
    srcFolders: [], // Where to look for source files. User must supply this
    tagMissingStrings: true, // Mark missing locale strings so they are easily seen
    templatefiles: ['*.html'],
    tempLocalesName: 'locales.mjs',
    tempPath: './_compiled/',
    tempTemplateName: 'templates.mjs',
    useStrict: false
  }, theirConfig);

  config.srcFolders.forEach(
    temp => {
      const srcList = [];
      const srcRoot = path.join(ROOT, temp);
      const label = `Processing Locales and Templates for ${temp}`;

      console.time(label);
      fs.readdirSync(srcRoot).forEach(
        (tempPath) => {
          let fname = config.srcFileName || `${tempPath}.mjs`;
          let componentFile = getSrcFiles(srcRoot, tempPath, fname)[0];

          if (componentFile && fs.existsSync(componentFile)) {
            srcList.push({
              srcPath: tempPath
            });

            let localeList = [];
            let componentPath = path.join(srcRoot, tempPath);
            // TODO: If we are compiling for each locale then we need to repeat the `srcList.push`
            let localeCode = cbtCompile.locales(componentPath, config);
            if (typeof localeCode === 'object') {
              localeList = Object.keys(localeCode);
              localeList.forEach(
                (key) => {
                  writeFile(path.join(componentPath, config.tempPath, config.tempLocalesName.replace('.mjs', `_${key}.mjs`)), localeCode[key]);
                }
              );
            }
            else {
              writeFile(path.join(componentPath, config.tempPath, config.tempLocalesName), localeCode);
            }

            let templateCode = cbtCompile.templates(componentPath, config, localeList);
            writeFile(path.join(componentPath, config.tempPath, config.tempTemplateName), templateCode);
          }
        }
      );
      console.timeEnd(label);

      srcList.forEach(
        ({ varName, srcPath, srcFile = config.srcFileName || srcPath + '.mjs', buildTypes }, index) => {
          if (!srcPath) {
            throw new Error('`srcPath` must be defined at index ' + index);
          }
          if (!srcFile) {
            throw new Error('`srcFile` must be defined at index ' + index);
          }

          const input = getSrcFiles(srcRoot, srcPath, srcFile)[0];

          config.buildTypes.forEach(
            buildType => {
              let format = buildType;
              let transpile = false;
              let dstName = srcPath;
              if (buildType === BUILD_TYPES.IIFE5) {
                dstName += '.iife5.js';
                transpile = true;
                format = BUILD_TYPES.IIFE;
                if (!varName) {
                  varName = srcPath.replace(/[.-]/g, '_');
                }
              }
              else if (buildType === BUILD_TYPES.IIFE) {
                dstName += '.iife.js';
                if (!varName) {
                  varName = srcPath.replace(/[.-]/g, '_');
                }
              }
              else if (buildType === BUILD_TYPES.CJS5) {
                dstName += '.cjs5.js';
                transpile = true;
                format = BUILD_TYPES.CJS;
              }
              else if (buildType === BUILD_TYPES.CJS) {
                dstName += '.cjs.js';
              }
              else {
                dstName += '.mjs';
              }

              var outputPath = config.distPath || 'dist';
              var file = config.includePath ? path.resolve(ROOT, outputPath, srcPath, dstName) : path.resolve(ROOT, outputPath, dstName);

              const buildItem = {
                input,
                plugins: [],
                output: {
                  file,
                  format,
                  name: varName
                  strict: config.useStrict || false
                }
              };

              if (transpile) {
                buildItem.plugins.push(PLUGIN_BUBLE);
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
    if (!fs.existsSync(tempPath)) {
      fs.mkdirSync(tempPath);
    }

    tempPath = path.join(tempPath, pathParts[i]);
  }
}

function writeFile(filePath, content) {
  createFolders(filePath);

  let bakFilePath = `${filePath}.bak`;

  if (fs.existsSync(bakFilePath)) {
    fs.unlinkSync(bakFilePath);
  }
  if (fs.existsSync(filePath)) {
    fs.renameSync(filePath, bakFilePath);
  }

  fs.writeFileSync(filePath, content);
}

module.exports = {
  init,
  BUILD_TYPES
};
