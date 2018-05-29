const createEOTranslations = require('./createEOTranslations.js');
const readFile = require('./readFile.js');
const LOCALE_RE = /_([^_]*)\.json/;

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

module.exports = readTranslations;
