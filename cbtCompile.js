/* eslint brace-style: 0, spaced-comment: 0, no-multi-spaces: 0, object-property-newline: 0 */
const fs = require('fs');
const glob = require('glob');
const path = require('path');
const FILLER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890 .-_!@#$%^&*=+';
const FILLER_MAX = FILLER.length;
const LOCALE_RE = /_([^_]*)\.json/;
const MIXED_LANGS = [
  '鼻毛', '指先', '眉毛', 'ひれ', 'ヘビ', 'カブ', '子供', '日本', '言語', '馬鹿', // Japanese Chars
  '영어', '소금', '트럭', '히피', '포크', '토성', '아픈', '오리', '얼음', '극지', // Korean Chars
  '孩子', '嬉皮', '雲彩', '占星', '胡說', '膀胱', '沙拉', '蠢貨', '烘烤', '蝸牛', // Chinese Chars
  'да', 'ща', 'по', 'не', 'из', 'за', 'Ий', 'дя', 'ИФ', 'ья', // Russian Chars
  'Ãé', 'Ûç', 'Çó', 'Ñá', 'Ýň', 'Èç', 'Ìë', 'Îú', 'Öà', 'Ūê' // Latin Chars
];
const MULTI_WS_RE = /\s+/g;
const REPLACEMENT_MAP = {
  A: 'ÀÁÂÃÄÅĀĄĂѦ', B: 'ƁɃḂ', C: 'ÇĆČĈĊ', D: 'ĎĐ', E: 'ÈÉÊËĒĘĚĔĖ', F: 'ƑḞ', G: 'ĜĞĠĢ',
  H: 'ĤĦ', I: 'ÌÍÎÏĪĨĬĮİ', J: 'ĴɈ', K: 'ĶҞҠ', L: 'ŁĽĹĻĿ', M: 'ṀƜӍ', N: 'ÑŃŇŅŊПИ',
  O: 'ÒÓÔÕÖØŌŐŎ', P: 'ƤṖ', R: 'ŔŘŖЯ', S: 'ŚŠŞŜȘ', T: 'ŤŢŦȚ', U: 'ÙÚÛÜŪŮŰŬŨŲЦ', V: 'ѴѶ',
  W: 'ŴШЩѠ', X: 'ЖҲӾ', Y: 'ÝŶŸ', Z: 'ŹŽŻ',
  a: 'àáâãäåāąă', b: 'БЪЬѢ', c: 'çćčĉċ', d: 'ďđ', e: 'èéêëēęěĕė', f: 'ƒḟ', g: 'ĝğġģ',
  h: 'ĥħ', i: 'ìíîïīĩĭįı', j: 'ĵǰɉ', k: 'ķĸƙǩ', l: 'łľĺļŀ', m: 'ṁӎ', n: 'ñńňņŉŋ',
  o: 'òóôõöøōőŏФ', r: 'ŕřŗя', s: 'śšşŝș', t: 'ťţŧț', u: 'ùúûüūůűŭũų', v: 'ѵѷ',
  w: 'ŵѡ', x: 'ӿӽж', y: 'ýÿŷЧѰ', z: 'žżź'
};
const VALID_TEMPLATE_KEY_TEST_RE = /^[\w$][\w\d$]*$/;

const readFile = filePath => fs.readFileSync(filePath, {'encoding': 'utf-8'}).trim().replace(/`/g, '\\`');

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
    else {
      // Return the processed results as a single string.
      return createSingleLocalesFile(rootFolder, localeFileArray, config);
    }
  }
  else if (config.alwaysReturnFile) {
    // If we are supposed to always return a file then return the
    // default file contents as a string
    return 'export default () => ({});';
  }
  else {
    // Indicate that no files were found
    return false;
  }
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
    else {
      // Return the processed results as a single string.
      return generateTemplateOutput(rootFolder, templateFileArray, config, !!localeList);
    }
  }
  else if (config.alwaysReturnFile) {
    // If we are supposed to always return a file then return the
    // default file contents as a string
    return `export default {dom:()=>null,str:()=>''};`;
  }
  else {
    // Indicate that no template files were found
    return false;
  }
}

/************************************************\
                 Helper Functions
\************************************************/

/*
 * Convert an array of Globby paths into an array of paths of existing files.
 */
function getFileArrayFromGlob(rootFolder, globList) {
  let globArray = globList;
  if (!Array.isArray(globList)) {
    globArray = [globList];
  }
  return globArray.reduce(
    (obj, pattern) => {
      const options = {
        cwd: '/',
        root: '/'
      };

      const tempPath = path.join(rootFolder, pattern);
      const newList = glob.sync(tempPath, options);

      // no files returned
      if (!newList.length) {
        // don't pass the file to the process script if it's a glob tempPath
        // istanbul ignore next
        if (!glob.hasMagic(tempPath)) {
          obj.push(tempPath);
        }
      }
      else {
        newList.forEach(function(item) {
          item = path.resolve(rootFolder, item);

          // istanbul ignore next
          if (obj.indexOf(item) === -1) {
            obj.push(item);
          }
        });
      }

      return obj;
    }, []
  );
}

function readTranslations(rootFolder, fileList, config) {
  //console.log('defaultLocale', config.defaultLocale);
  const translations = fileList.reduce(
    (obj, filePath) => {
      let toks = filePath.match(LOCALE_RE);
      let lang = toks[1];
      let fileContents = readFile(filePath).trim();
      //console.log(`Translations for [${lang}] ${filePath}`);

      var data;
      obj[`${lang}filePath`] = filePath.replace(rootFolder, ''); // Save the filename of this locale file

      // istanbul ignore else
      if (fileContents.length > 0) {
        try {
          data = JSON.parse(fileContents); // Convert the file JSON text into an object
          obj[lang] = data; // Save the JSON
          obj.langs.push(lang); // Indicate that we support this language

          if (lang === config.defaultLocale) {
            // If we are processing the default locale then save off the current set of keys.
            obj.keys = Object.keys(data);
            //console.log('default keys set');
          }
        }
        catch (e) {
          throw new Error(`Unable to parse locale file: ${filePath}:: ${e}`);
        }
      }

      return obj;
    }, {langs: []}
  );

  //console.log(JSON.stringify(translations,0,2));

  if (!translations.keys) {
    // If there was no locale file for the default locale then flag an error
    throw new Error(`locale file for default locale "${config.defaultLocale}" was not found in ${rootFolder}.`);
  }

  // istanbul ignore else
  if (config.addEOLocale && !translations.eo) {
    // If we are adding EO and there was not EO file then generate a version of EO
    translations.eo = createEOTranslations(translations[config.defaultLocale]); // Save the JSON
    translations.eofilePath = ' * Auto Generated * .';
    translations.langs.push('eo'); // Indicate that we support this language
  }

  return translations;
}

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
      str +=  `  // Included locale file: .${filePath}\n`;
      const strings = [];

      translations.keys.forEach(
        (key, keyIndex) => {
          if (config.tagMissingStrings) {
            strings.push(translations[locale][key] || `-*${translations[config.defaultLocale][key]}*-`);
          }
          else {
            strings.push(translations[locale][key] || translations[config.defaultLocale][key]);
          }
        }
      );

      str += `  "${locale}": ${JSON.stringify(strings)}${(index > len) ? '\n' : ',\n'}`;

      return str;
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
  var outputStr = '// This is an auto generated file. Do not edit!\n';
  if (includeLocales) {
    outputStr += `import locales from './${config.tempLocalesName}';\nconst lang = locales();\n\n`;
  }
  outputStr += `function dom(key, data) {
  var el = document.createElement('template');
  el.innerHTML = str(key, data);
  return el.content;
}

function str(key, data) {
  switch (key) {`;

  const len = templateFiles.length - 2;
  outputStr = templateFiles.reduce(
    (str, filePath, i) => {
      let templateStr = readFile(filePath);

      // istanbul ignore else
      if (config.minTemplateWS) {
        templateStr = templateStr.replace(MULTI_WS_RE, ' ');
      }

      let ext = path.extname(filePath);
      let templateKey = path.basename(filePath, ext);
      if (!VALID_TEMPLATE_KEY_TEST_RE.test(templateKey)) {
        throw new Error(`Invalid Template name: ${filePath}\nTemplate file names can only use $, _ or alphanumeric characters.`);
      }

      //let comma = i > len ? '' : ',';
      let tempPath = filePath.replace(rootFolder, '');

      str += `
    // Included template file: .${tempPath}
    case '${templateKey}':
      return \`${templateStr}\`;
`;

      return str;
    }, outputStr
  ) + `
    default:
      return '';
  }
}

export default {dom, str};
`;

  return outputStr;
}

/*
 * creates pseudo locale object from one english locale object
 */
function createEOTranslations(engProps) {
  return Object.keys(engProps).reduce(
    (obj, key) => {
      obj[key] = makeEOProp(key, engProps[key]);
      return obj;
    }, {}
  );
}

/*
 * converts characters, adds length, and adds CKJ characters for a single string in a locale
 */
function makeEOProp(key, enStr) {
  const keyHashCode = getKeyHash(key);
  let newValue = convertString(keyHashCode, enStr);
  let suffix = MIXED_LANGS[keyHashCode % MIXED_LANGS.length];
  let length = newValue.length;
  let combinedLength = length + suffix.length;

  if (length > 0 && length <= 5) {
    length = 9;
  }
  else if (length >= 6 && length <= 25) {
    length *= 1.9;
  }
  else if (length >= 26 && length <= 40) {
    length *= 1.6;
  }
  else if (length >= 41 && length <= 70) {
    length *= 1.3;
  }

  let expansion = createFiller(Math.round(length - combinedLength));

  return '[' + newValue + expansion + suffix + ']';
}

/*
 * performs the character replacement for pseudo locale creation
 */
function convertString(keyHashCode, str) {
  let i;
  let isInTag = false;
  let isInVar = false;
  let strLength = str.length;
  let ret = '';

  for (i = 0; i < strLength; i++) {
    let current = str[i];

    if (isInTag) {
      ret += current;
      isInTag = current !== '>';
      continue;
    }
    else if (isInVar) {
      ret += current;
      isInVar = current !== '}';
      continue;
    }
    else if (current === '<') {
      // ignore HTML tags (but not content inside opening and closing tags,
      // e.g. for <p>Something</p> ignores <p> and </p> but not "Something")
      ret += current;
      isInTag = true;
      continue;
    }
    else if ((current === '$' && str[i + 1] === '{') ||
             (current === '%' && str[i + 1] === '{')) {
      // ignore replacement variables, e.g. ${myVar} and %{myVar}
      ret += current;
      isInVar = true;
      continue;
    }

    var replacements = REPLACEMENT_MAP[current] || [current];
    ret += replacements[keyHashCode % replacements.length];
  }

  return ret;
}

/*
 * Create a hash based on the string's KEY
 *
 * str = string to use for the hash
 */
function getKeyHash(str) {
  let hash = 0;

  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }

  return Math.abs(hash);
}

/*
 * Create filler to bring the EO strings up to a percentage longer
 *
 * count = number of characters to include
 */
function createFiller(count) {
  var fill = '';

  // istanbul ignore else
  if (count > 0) {
    fill = '-';
    for (let i = 1; i < count; i++) {
      fill += FILLER[Math.round(Math.random() * FILLER_MAX)];
    }
  }

  return fill + '-:';
}

module.exports = {
  locales,
  templates
};
