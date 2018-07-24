const fs = require('fs');
const path = require('path');
const minify = require('html-minifier').minify;
const getFileArrayFromGlob = require('./getFileArrayFromGlob.js');
const readFile = require('./readFile.js');
const readTranslations = require('./readTranslations.js');
const IMPORT_RE = /<%([^%]+)%>/;
const MULTI_WS_RE = /\s+/g;
const VALID_TEMPLATE_KEY_TEST_RE = /^[\w$][\w\d$]*$/;
const minifyOptions = {
  collapseBooleanAttributes: true,
  collapseInlineTagWhitespace: true,
  collapseWhitespace: true,
  conservativeCollapse: true,
  decodeEntities: true,
  minifyCSS: true,
  minifyJS: true,
  removeComments: true,
  removeScriptTypeAttributes: true,
  removeStyleLinkTypeAttributes: true
};

/************************************************\
                 Public Functions
\************************************************/

/*
 * Compile the locale files into a single output string
 * representing the contents of the file
 */
function locales(rootFolder, config) {
  // Convert the list of globby locale filenames into a list of available filenames
  const localeFileArray = getFileArrayFromGlob(rootFolder, config.localeFiles);

  if (localeFileArray.length > 0) {
    // If we have a list of locale files then process them
    // istanbul ignore if
    if (config.separateByLocale) {
      // Return the processed results as an object of strings.
      return createMultiLocaleFiles(rootFolder, localeFileArray, config);
    }

    // Return the processed results as a single string.
    return createSingleLocalesFile(rootFolder, localeFileArray, config);
  }
  else if (config.alwaysReturnFile) {
    // If we are supposed to always return a file then return the
    // default file contents as a string
    return 'export default () => ({});';
  }

  // Indicate that no files were found
  return false;
}

/*
 * Compile the tempalte files into a single output string
 * representing the contents of the file
 */
function templates(rootFolder, config, localeList) {
  // Convert the list of globby template filenames into a list of available filenames
  const templateFileArray = getFileArrayFromGlob(rootFolder, config.templateFiles);

  if (templateFileArray.length > 0) {
    // If we have a list of template files then process them
    // istanbul ignore if
    if (Array.isArray(localeList) && localeList.length > 0) {
      // Return the processed results as a single string.
      return generateMultipleTemplates(rootFolder, templateFileArray, config, localeList);
    }

    // Return the processed results as a single string.
    return generateTemplateOutput(rootFolder, templateFileArray, config, !!localeList);
  }
  else if (config.alwaysReturnFile) {
    // If we are supposed to always return a file then return the
    // default file contents as a string
    return `export default {dom:()=>null,str:()=>''};`;
  }

  // Indicate that no template files were found
  return false;
}

/************************************************\
                 Helper Functions
\************************************************/

/*
 * Generate an array of locale file contents for every locale source file
 */
// istanbul ignore next
function createMultiLocaleFiles(rootFolder, fileList, config) {
  throw new Error('Not implamented yet.');
  /*
  const contents = {};

  // Read all of the locale file
  let translations = readTranslations(rootFolder, fileList, config);

  // Build up the contents object. Each entry will contain the contents of the `locales_??.mjs` file to create.
  translations.langs.forEach(
    (locale) => {
      var strings = {};
      translations.keys.forEach(
        (key, keyIndex) => {
          if (config.tagMissingStrings) {
            strings[key] = translations[locale][key] || `-*${translations[config.defaultLocale][key]}*-`;
          }
          else {
            strings[key] = translations[locale][key] || translations[config.defaultLocale][key];
          }
        }
      );

      contents[locale] = `// This is an auto generated file. Do not edit!
export default function () (${JSON.stringify(strings)});
`;
    }
  );

  return contents;
  */
}

/*
 * Generate locale file contents that includes every locale source file
 */
function createSingleLocalesFile(rootFolder, fileList, config) {
  // Read all of the locale file
  let translations = readTranslations(rootFolder, fileList, config);
  let len = translations.langs.length - 2;
  // Build up the file content for the file `locales.mjs`
  let strings = translations.langs.sort().reduce(
    (str, locale, index) => {
      let filePath = translations[`${locale}filePath`];
      const strs = translations.keys.map((key, keyIndex) => translations[locale][key] || (config.tagMissingStrings ? `-*${translations[config.defaultLocale][key]}*-` : translations[config.defaultLocale][key]));

      return str + `  // Included locale file: .${filePath}\n  "${locale}": ${JSON.stringify(strs)}${(index > len) ? '\n' : ',\n'}`; // eslint-disable-line no-multi-spaces
    }, '{\n'
  ) + '}';

  var keyLookup = (config.addKELocale ? `locale === 'ke' ? key : strs[locale][i]` : `strs[locale][i]`);

  return `// This is an auto generated file. Do not edit!
const strCache = {};
const strKeys = ${JSON.stringify(translations.keys)};
const strs = ${strings};

function getLocaleStrings(locale = ${config.defaultLocaleVariable}) {
  // If the requested locale is not supported the use the default locale
  if (!strs[locale]${config.addKELocale?"&&locale!=='ke'":""}) {
    locale = locale.split('-')[0];
    if (!strs[locale]) {
      locale = '${config.defaultLocale}';
    }
  }

  if (!strCache[locale]) {
    // If this locale isn't already in the cache, then create it and store it in the cache
    strCache[locale] = strKeys.reduce((obj, key, i) => { obj[key] = ${keyLookup}; return obj; }, {});
  }

  // Return the cached language strings
  return strCache[locale];
}

export default getLocaleStrings;
`;
}

// istanbul ignore next
function generateMultipleTemplates(rootFolder, templateFiles, config, localeList) {
  throw new Error('Not implamented yet.');
  /*
  const results = {};

  localeList.forEach(
    (locale) => {
      var {localesName} = config.tempLocalesName;
      localesName = localesName.replace('.mjs', `${locale}.mjs`);
      const len = templateFiles.length - 2;
      let templateOutputStr = templateFiles.reduce(
        (str, filePath, i) => {
          // localeList = array of locales that are to be processed
          // locale = current locale we are processing
          // localesName = name of locale file to import into template file.
          // templateFiles = array of template files to include
          // str = templateCode we are producing
          // filePath = file path of current template file
          // i = index into templateFiles array
          let templateStr = readFile(filePath);
          let code = `var ret;with(this){try{ret=(${property})}catch(ex){}return ret}`;

          try {
            getValFn = new Function('lang, $index', code); // eslint no-new-func: 0
          }

          catch(ex) {
            console.error(`Exception while trying to process template "${filePath}".`);
            console.error('Code:', code);
            throw ex;
          }

          const newFn = new Function();
          if (config.minTemplateWS) {
            templateStr = templateStr.replace(MULTI_WS_RE, ' ');
          }
          let ext = path.extname(filePath);
          let templateKey = path.basename(filePath, ext);
          if (!VALID_TEMPLATE_KEY_TEST_RE.test(templateKey)) {
            throw new Error(`Invalid Template name: ${filePath}\nTemplate file names can only use $, _ or alphanumeric characters.`);
          }

          let comma = i > len ? '' : ',';
          let tempPath = filePath.replace(rootFolder, '');

          str += `  // Included template file: .${tempPath}\n`;
          str += `  '${templateKey}': getter(\`${templateStr}\`)${comma}\n`;

          return str;
        }, '');
    }
  );

  return results;
  */
}

function generateTemplateOutput(rootFolder, templateFiles, config, includeLocales) {
  const len = templateFiles.length - 2;
  let scriptLines = [];
  const templateList = templateFiles.reduce(
    (str, filePath, i) => {
      let templateStr = readFile(filePath);
      let script;

      do {
        script = templateStr.match(IMPORT_RE);
        if (script) {
          templateStr = templateStr.replace(script[0], '').trim();
          // TODO: Find a way to improve the imports
          script[1].trim().split(/[;\r\n]+/).forEach(
            line => {
              line = line.trim();
              if (line.length > 0) {
                if (line.substr(0, 7) !== 'import ') {
                  throw new Error(`Only "import" is allowed: "${line}"`);
                }
                line+=';';
                if (!scriptLines.includes(line)) {
                  scriptLines.push(line);
                }
              }
            }
          );
        }
      } while (script);

      // istanbul ignore else
      if (config.minTemplateWS) {
        try {
          templateStr = minify(templateStr, minifyOptions);
        }

        catch(_) {
          templateStr = templateStr.replace(/\s{2,}/g, ' ');
        }
      }

      let ext = path.extname(filePath);
      let templateKey = path.basename(filePath, ext);
      if (!VALID_TEMPLATE_KEY_TEST_RE.test(templateKey)) {
        throw new Error(`Invalid Template name: ${filePath}\nTemplate file names can only use $, _ or alphanumeric characters.`);
      }

      //let comma = i > len ? '' : ',';
      let tempPath = filePath.replace(rootFolder, '');

      return str + `    // Included template file: .${tempPath}
    case '${templateKey}':
      return \`${templateStr}\`;

`;
    }, ''
  );

  var outputStr = '// This is an auto generated file. Do not edit!\n';
  if (scriptLines.length > 0) {
    outputStr += scriptLines.join('\n')+'\n\n';
  }

  if (includeLocales) {
    outputStr += `import locales from './${config.tempLocalesName}';\nconst lang = locales();\n\n`;
  }
  outputStr += `function dom(key, data) {
  var el = document.createElement('template');
  el.innerHTML = str(key, data);
  return el.content;
}

function str(key, data) {
  switch (key) {
${templateList}    default:
      return '';
  }
}

export default {dom, str};
`;

  return outputStr;
}

module.exports = {
  locales,
  templates
};
