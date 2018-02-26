# component-build-tools
A set of build tools to help in the creation of components

## Install

You need to install the component build tools in your project:

    npm install --save-dev git+https://github.com/intervalia/component-build-tools.git
    
You will also need to install the latest `rollup` in your project

    npm install --save-dev rollup

## Usage

Here is a sample `rollup.config.js` file:

```JavaScript
const rollup = require('./node_modules/component-build-tools/rollup.root.config');

const config = {
  buildTypes: [ rollup.BUILD_TYPES.MJS, rollup.BUILD_TYPES.IIFE, rollup.BUILD_TYPES.CJS ], // Set this to any build styles you want.
  srcFolders: ['assets/wc-n1', 'assets/wc-p3'] // Set this to any folder you want to have rollup up
};

module.exports = rollup.init(config);
```

Then, to run rollup:

    ./node_modules/.bin/rollup -c
    

## Options

### BUILD Styles

There are 5 build styles:

| Build Style | Description |
| --- | --- |
| IIFE | IFFE styled output with no transpiling |
| IIFE5 | IFFE output with ES5 transpile operation |
| CJS | Common JS output. Load by using `require` |
| CJS5 | Common JS output with ES5 transpile. Load by using `require` |
| MJS | ES6 Module output. Load by using `import` |

### Config options

When you call `rollup.init` you pass in a set of options. Most are optional. The only one required is `srcFolders`.

| Option | Type | Default Value | Description |
| --- | --- | --- | --- |
| addEOLocale | bool | `true` | Add the EO (Esperanto) locale if it does not exist |
| alwaysReturnFile | bool | `true` | The files `_compiled/locales.msj` and `_compiled/templates.mjs` will always be created if this value is `true`. Otherwise they will not be created |
| buildTypes |array | `[BUILD_TYPES.MJS, BUILD_TYPES.IIFE]` | The list of build styles to create. See Build Styles above. |
| debug | bool | `false` | `true` to enable debug output. |
| defaultLocale | string | `'en'` | The locale to use as the default locale when compiling locale files |
| distPath | string | `'dist/js'` | Path into which the distribution files will be placed |
| includePath | bool | `true` | Place the dist files inside a folder named after the source folder |
| localeFiles | array | `['locales/strings_*.json']` | An array of relative globby paths defining the locale files to load. |
| makeMinFiles | bool | `false` | If set to `true` then the output will include creating minimized files |
| minTempalteWS | bool | `true` | Minimize the white space within the template files |
| separateByLocale | bool | `false` | **Currently not supported** When `true` this will generate one output file per locale supported in the `localesFile` globby list. `false` will only produce one file with all locale data embeded. |
| srcFileName | string | `undefined` | If undefined then we use the folder name to specify the source file name. Otherwise the `srcFileName` string is used.<br/>_See [`srcFileName`](#srcFileName) below._ |
| srcFolders | array | `[]` | Which folders to look into for source files.<br/>**This is required**<br/>_See [`srcFolders`](#srcFolders) below._ |
| tagMissingStrings | bool | `true` | When `true` Mark missing locale strings so they are easily seen
| templateFiles | array | `['*.html']` | |
| tempLocalesName | string | `'locales.mjs'` | |
| tempPath | string | `'./_compiled/'` | |
| tempTemplateName | string | `'templates.mjs'` | |
| useStrict | bool | `false` | |
