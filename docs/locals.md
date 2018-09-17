# locales

```js
const build = require('component-build-tools').components;
const rootFolder = 'src/components/comp1/locales';
const config = {
  addEOLocale: true,
  addKELocale: false,
  alwaysReturnFile: false,
  defaultLocale: 'en'
  defaultLocaleVariable: 'document.documentElement.lang',
  localeFiles: ['locales/strings_*.json'],
  separateByLocale: false,
  tagMissingStrings: true,
  tempLocalesName: 'locales.mjs',
  tempPath: './_compiled/'
};

const data = build.locales(rootFolder, config);
```

```js
//templates

config = {
  alwaysReturnFile: false,
  includeLocales: false,
  minTemplateWS: true, // Minimize the white space for templates
  templateFiles: ['*.html'],
  tempPath: './_compiled/',
  tempTemplateName: 'templates.mjs'
}
```
