const fs = require('fs');
const cbtCompile = require('./cbtCompile');
const glob = require('glob');
const path = require('path');
const getFileArrayFromGlob = require('./getFileArrayFromGlob');
const writeFile = require('./writeFile');

function locales(rootFolder, theirConfig = {}) {
  const label = `Processing Locales for ${rootFolder}`;
  console.time(label);
  let localeList = false;
  const config = Object.assign({
    addEOLocale: true,
    addKELocale: false,
    alwaysReturnFile: false,
    defaultLocale: 'en',
    defaultLocaleVariable: 'document.documentElement.lang',
    localeFiles: ['locales/strings_*.json'],
    separateByLocale: false,
    tagMissingStrings: true,
    tempLocalesName: 'locales.mjs',
    tempPath: './_compiled/'
  }, theirConfig);

  const localeCode = cbtCompile.locales(rootFolder, config);
  // istanbul ignore if
  if (typeof localeCode === 'object') {
    // Create one file per locale
    localeList = Object.keys(localeCode);
    localeList.forEach(
      (key) => {
        writeFile(path.join(rootFolder, config.tempPath, config.tempLocalesName.replace('.mjs', `_${key}.mjs`)), localeCode[key]);
      }
    );
  }
  else if (localeCode) {
    localeList = true;
    writeFile(path.join(rootFolder, config.tempPath, config.tempLocalesName), localeCode);
  }

  console.timeEnd(label);

  return localeList;
}

function templates(rootFolder, theirConfig = {}, localeList = false) {
  const label = `Processing Templates for ${rootFolder}`;
  console.time(label);

  const config = Object.assign({
    alwaysReturnFile: false,
    minTemplateWS: true, // Minimize the white space for templates
    templateFiles: ['*.html'],
    tempPath: './_compiled/',
    tempTemplateName: 'templates.mjs'
  }, theirConfig);

  const templateCode = cbtCompile.templates(rootFolder, config, localeList);
  if (templateCode) {
    writeFile(path.join(rootFolder, config.tempPath, config.tempTemplateName), templateCode);
  }

  console.timeEnd(label);
}

module.exports = {locales, templates};
