# component-build-tools
A set of build tools to help in the creation of components

Used with [rollup](https://www.npmjs.com/package/rollup), these tools will allow you to process locale file and template files into a set of `.mjs` files that are importable in your script files.

For those of you that have used [gulp-component-assembler](https://www.npmjs.com/package/gulp-component-assembler) these tools allow similar functionality but by using ES6 imports instead of defining the component through an `assembly.json` file.

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
  buildTypes: [ rollup.BUILD_TYPES.MJS ], // Set this to any build styles you want.
  srcFolders: ['assets/wc-n1', 'assets/wc-p3'] // Set this to any folder you want to have rollup process
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
| IIFE | IFFE styled output with no transpiling. |
| IIFE5 | IFFE output with ES5 transpile operation. For compatibility with older ES5 browsers. |
| CJS | Common JS output. Load by using `require` |
| CJS5 | Common JS output with ES5 transpile. Load by using `require`. For compatibility with older ES5 browsers. |
| MJS | ES6 Module output. Load by using `import` |

### Config options

When you call `rollup.init` you pass in a set of options. Most are optional. The only one required is `srcFolders`.

| Option | Type | Default Value | Description |
| --- | --- | --- | --- |
| addEOLocale | bool | `true` | Add the EO (Esperanto) locale if it does not exist. |
| addKELocale | bool | `true` | Add the KE locale if it does not exist. This is a fake locale that returns the KEY as the string to help in debugging. |
| alwaysReturnFile | bool | `true` | The files `_compiled/locales.msj` and `_compiled/templates.mjs` will always be created if this value is `true`. Otherwise they will not be created. |
| buildTypes |array | `[`<br/>&nbsp;&nbsp;`BUILD_TYPES.MJS,`<br/>&nbsp;&nbsp;`BUILD_TYPES.IIFE`<br/>`]` | The list of build styles to create. See Build Styles above. |
| debug | bool | `false` | `true` to enable debug output. |
| defaultLocale | string | `'en'` | The locale to use as the default locale when compiling locale files. |
| defaultLocaleVariable | string | `'window.locale'` | The variable to use as the default locale that is read at runtime that your app defines. |
| distPath | string | `'dist/js'` | Path into which the distribution files will be placed.|
| includePath | bool | `true` | Place the dist files inside a folder named after the source folder. |
| localeFiles | array | `['locales/strings_*.json']` | An array of relative globby paths defining the locale files to load. |
| makeMinFiles | bool | `false` | If set to `true` then the output will include creating minimized files. |
| minTemplateWS | bool | `true` | Minimize the white space within the template files. |
| separateByLocale | bool | `false` | **Currently not supported** When `true` this will generate one output file per locale supported in the `localesFile` globby list. `false` will only produce one file with all locale data embeded. |
| sourcemap  | bool | `false` | If `true` then sourcemap files are generated. If `false` then sourcemap files are not generated. |
| srcFileName | string | `undefined` | If undefined then we use the folder name to specify the source file name. Otherwise the `srcFileName` string is used.<br/>_See [`srcFileName`](#srcFileName) below._ |
| srcFolders | array | `[]` | Which folders to look into for source files.<br/>**This is required**<br/>_See [`srcFolders`](#srcFolders) below._ |
| tagMissingStrings | bool | `true` | When `true` Mark missing locale strings so they are easily seen. |
| templateFiles | array | `['*.html']` | A globby array of files to include as templates. |
| tempLocalesName | string | `'locales.mjs'` | The filename used for the compiled `locales` file. |
| tempPath | string | `'./_compiled/'` | The path into which all compiled files are place. |
| tempTemplateName | string | `'templates.mjs'` | The filename used for the compiled `templates` file. |
| useStrict | bool | `false` | If `true` then add `"use strict"` at the top of the rolled up output files. |




#### srcFileName

If `srcFileName` is left as `undefined` then the name of the source files will be the same name as the folder with the extension of `.mjs`.

For example, the file structure below shows a folder named `test1` and within it is a file named `test1.mjs`. The build process of the build tools will take `test1.mjs` as the root file to use in the rollup config file.

```
+- components
   +- test1
      +- test1.msj
      +- style.html
      +- content.html
```

And the default output file will be placed in:

```
+- dist
   +- js
      +- test1
         +- test1.mjs
```

The output file `./dist/js/test1/test1.mjs` will combine the two template files `style.html` and `content.html` as well as the source file `test1.js` as one set of code.

If `srcFileName` were set to `index.mjs` then the build tools would use `index.msj` as the root file to use in the rollup config file.

```
+- components
   +- test1
      +- index.msj
      +- style.html
      +- content.html
```

would still produce the same output structure of:

```
+- dist
   +- js
      +- test1
         +- test1.mjs
```

#### srcFolders

`srcFolder` is the only option that must be supplied. This specifies the folder or folders that are to be processed by the build tools.

If you have all of your components in the folder `./comps` then you would call `rollup.init({srcFolders:['./comps']})`.

Every folder directly under `./comps` would get processed and the build tools and handed off to rollup.


## History

| Date | Version | Description |
| --- | --- | --- |
| 03/20/2018 | 2.0.0 | &#x25cf; Added options for `addKELocale`, `defaultLocaleVariable ` and `sourcemap`.<br/>&#x25cf; Spelling Correction: Renamed option `minTempalteWS` to `minTemplateWS`.<br/>&#x25cf; If there are no compiled files to generate and `alwaysReturnFile` if set to `false` then no temporary folder is created. |
| 02/26/2018 | 1.0.0 | Initial Release |


