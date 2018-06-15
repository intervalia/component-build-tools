# component-build-tools

A set of build tools to help in the creation of components

Used with [rollup](https://www.npmjs.com/package/rollup), these tools will allow you to process locale file and template files into a set of `.mjs` files that are importable in your script files.

For those of you that have used [gulp-component-assembler](https://www.npmjs.com/package/gulp-component-assembler) these tools allow similar functionality but by using ES6 imports instead of defining the component through an `assembly.json` file.

## Install

You need to install the component build tools in your project:

    npm install --save-dev component-build-tools

You will also need to install the latest `rollup` in your project

    npm install --save-dev rollup

## Usage

Here are two sample `rollup.config.js` files:

```JavaScript
const rollup = require('component-build-tools').rollup;

const config = {
  buildTypes: [ rollup.BUILD_TYPES.MJS ], // Set this to any build styles you want.
  srcFolders: ['assets/wc-n1', 'assets/wc-p3'] // Set this to any folder you want to have rollup process
};

module.exports = rollup.init(config);
```

and

```JavaScript
const {init, BUILD_TYPES} = require('component-build-tools').rollup;

const config = {
  buildTypes: [ BUILD_TYPES.MJS, BUILD_TYPES.CJS, BUILD_TYPES.CJS5 ],
  srcFolders: ['assets/*']
};

module.exports = init(config);
```

Then, to run rollup:

```shell
./node_modules/.bin/rollup -c
```

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
| addKELocale | bool | `false` | Add the KE locale if it does not exist. This is a fake locale that returns the KEY as the string to help in debugging. |
| alwaysReturnFile | bool | `false` | The files `_compiled/locales.msj` and `_compiled/templates.mjs` will always be created if this value is `true`. Otherwise they will not be created. |
| buildTypes |array | `[`<br/>&nbsp;&nbsp;`BUILD_TYPES.MJS,`<br/>&nbsp;&nbsp;`BUILD_TYPES.IIFE`<br/>`]` | The list of build styles to create. See Build Styles above. |
| debug | bool | `false` | `true` to enable debug output. |
| defaultLocale | string | `'en'` | The locale to use as the default locale when compiling locale files. |
| defaultLocaleVariable | string | `'document.documentElement.lang'` | The variable to use as the default locale that is read at runtime that your app defines.<br/>`document.documentElement.lang` is the value stored in the `lang` attribute of the `<html>` tag. Changing that value will change what locale strings are used.<br/>`<html lang='en'>` will use the `'en'` locale strings.<br/>`<html lang="fr">` will use the `'fr'` locale strings. |
| distPath | string/object | `'dist/js'` | Path into which the distribution files will be placed.<br/>If `distPath` is an object then it must include one entry per output type defined in `buildTypes`.<br/>_See [`distPath`](#distPath) below._ |
| includePath | bool | `false` | If this is set to `false` then the output files are placed directly into the `distPath` folder. If this is set to `true` then the output files are placed in a child folder named after the source folder inside the `distPath` folder. |
| localeFiles | array | `['locales/strings_*.json']` | An array of relative glob paths defining the locale files to load. |
| makeMinFiles | bool | `false` | If set to `true` then the output will include creating minimized files. |
| minTemplateWS | bool | `true` | Minimize the white space within the template files. |
| separateByLocale | bool | `false` | **Currently not supported** When `true` this will generate one output file per locale supported in the `localesFile` glob list. `false` will only produce one file with all locale data embedded. |
| sourcemap  | bool | `false` | If `true` then sourcemap files are generated. If `false` then sourcemap files are not generated. |
| srcFileName | string | `undefined` | If undefined then we use the folder name to specify the source file name. Otherwise the `srcFileName` string is used.<br/>_See [`srcFileName`](#srcFileName) below._ |
| srcFolders | string/array | `[]` | An array of glob folders in which to look into for source files.<br/>**This is required. The user must supply this value.**<br/>_See [`srcFolders`](#srcFolders) below._ |
| tagMissingStrings | bool | `true` | When `true` Mark missing locale strings so they are easily seen. |
| templateFiles | array | `['*.html']` | A glob array of files to include as templates. |
| tempLocalesName | string | `'locales.mjs'` | The filename used for the compiled `locales` file. |
| tempPath | string | `'./_compiled/'` | The path into which all compiled files are place. |
| tempTemplateName | string | `'templates.mjs'` | The filename used for the compiled `templates` file. |
| useStrict | bool | `false` | If `true` then add `"use strict"` at the top of the rolled up output files. |

#### distPath

If `distPath` is a string then the same `distPath` is used in the output for any build type.

You can also define `distPath` as an object to change the output path for each build type.

If you  set `buildType` to `[BUILD_TYPES.MJS, BUILD_TYPES.CJS]` then your `distPath` object needs to include two properties, one per build type:

```JavaScript
distPath: {
  MJS: './path/for/mjs/built/files',
  CJS: './cjs/file/path'
}
```

> If you include extra properties they will be ignored. But you must include one property per build type. If you don't then an exception will be thrown and the build will fail.

#### srcFileName

If `srcFileName` is left as `undefined` then the name of the source files will be the same name as the folder with the extension of `.mjs`.

For example, the file structure below shows a folder named `test1` and within it is a file named `test1.mjs`. The build process of the build tools will take `test1.mjs` as the root file to use in the rollup config file.

```shell
└─ components
   └─ test1
      ├─ test1.msj
      ├─ style.html
      └─ content.html
```

And the default output file will be placed in:

```shell
└─ dist
   └─ js
      └─ test1.mjs
```

The output file `./dist/js/test1/test1.mjs` will combine the two template files `style.html` and `content.html` as well as the source file `test1.js` as one set of code.

If `srcFileName` were set to `index.mjs` then the build tools would use `index.msj` as the root file to use in the rollup config file.

```shell
└─ components
   └─ test1
      ├─ index.msj
      ├─ style.html
      └─ content.html
```

would still produce the same output structure of:

```shell
└─ dist
   └─ js
      └─ test1.mjs
```

If the value for `includePath` had been set to true then the output structure would be:

```shell
└─ dist
   └─ js
      └─ test1
         └─ test1.mjs
```

#### srcFolders

`srcFolder` is the only option that must be supplied. This specifies the folder or folders that are to be processed by the build tools.

If you have all of your components stored in child fodlers of the folder `./comps` then you would call `rollup.init({srcFolders:['./comps/*']})`.

Every folder directly under `./comps` would get processed. Any subfolder that was found to match the requirements of a component will be handed off to rollup for further processing.

You can specify each folder independently within the array, And each entry in the array can either be a real path to a specific folder or a glob path to a set of folders.

> `rollup.init({srcFolders:['./comps/component1']})` will only look at the path `./comps/component1` while `rollup.init({srcFolders:['./comps/*']})` will look at all direct child folders under `./comps`.

## Locale files

Locale files are JSON files that contain locale specific translations of strings you use in your application. By default the files are all placed in the `locales` folder and are named `strings_??.json` where the `??` is the 2 letter locale such as `en`, `fr`, or `ja`.

The file `./locales/strings_en.json` will contain the English version of the strings. The file `./locales/strings_fr.json` contains the French version of the strings. You can use things like `en-US` for US english and `fr-CA` for Canadian French. The two letter [ISO 639-1](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) code and a subset of the [BCP-47](http://www.ietf.org/rfc/bcp/bcp47.txt) codes are supported.

Currently we only support the 2 letter ISO 639-1 code and this ISO 639-1 code followed by a dash `"-"` and then the 2 letter ISO-3166 country code. Like `en`, `fr`, `en-US`, `en-GB`, `fr-CA` and `fr-FR`. **Case is ignored.**

> [ISO-3166 Country Codes and ISO-639 Language Codes](https://docs.oracle.com/cd/E13214_01/wli/docs92/xref/xqisocodes.html)

These locale files are combined into the file `./_compiled/locales.mjs` and you access them by importing that file and then calling the default function to get the set of locale strings for the specified locale.

```JavaScript
import locales from "./_compiled/locales.mjs";
const lang = locales('en');
```

> If no locale key is provided in the `locales()` function then the default locale object is returned.

## Templates

Template files tend to be HTML files but can be any kind of file. As a result of the compile process the contents of the template files are embedded into a template literal inside of the `template.mjs` file.

For example, if there is a template file called `person.html`:

```html
<div class="person">
  <div>Name: <span class="name">Frank N Stein</span></div>
</div>
```

Then the entry generated in the `templates.mjs` file would be:

```JavaScript
case 'person':
  return `<div class="person"> <div>Name: <span class="name">Frank N Stein</span></div> </div>`;
```

### The back-tick: ```

Since all templates become ES6 Template literals you can do some creative things in your template files. Let's say that you want to create a `<table>` with 5 rows. You could do it like this:

```html
<table>
  <tr class="row1">
    <td>1</td>
    <td class="name"></td>
    <td class="age"></td>
  </tr>
  <tr class="row2">
    <td>1</td>
    <td class="name"></td>
    <td class="age"></td>
  </tr>
  <tr class="row3">
    <td>3</td>
    <td class="name"></td>
    <td class="age"></td>
  </tr>
  <tr class="row4">
    <td>4</td>
    <td class="name"></td>
    <td class="age"></td>
  </tr>
  <tr class="row5">
    <td>5</td>
    <td class="name"></td>
    <td class="age"></td>
  </tr>
</table>
```

Or you can embed an second ES6 template literal within your template:

```html
<table>
  ${[1,2,3,4,5].map( i => `<tr class="row${i}">
    <td>${i}</td>
    <td class="name"></td>
    <td class="age"></td>
  </tr>`).join('')}
</table>
```

When you get this string it will execute this template literal expression:

```JavaScript
[1,2,3,4,5].map( i => `<tr class="row${i}">
  <td>${i}</td>
  <td class="name"></td>
  <td class="age"></td>
</tr>`).join('')
```

This, in turn will return five copies of the internal HTML (The `<tr>` with its three `<td>` tags). THe `join('')` will convert them into a string and this will be inserted just inside the `<table>` tags.

The end result of the two example above are almost identical. Since we removed the duplication of code the second example is more flexible and less prone to errors.

---

#### Escaping the back-tick

If you need to add a back-tick ``` character into your template, outside of your template literals, then you must escape it like with the backslash, like this:

```html
<p>This is the back-tick: \`</p>
```

This allows the back-tick to exist as a stand alone character and not as the ending of the generated template literal.

The compiled output would be this:

```JavaScript
return `<p>This is the back-tick: \`</p>`;
```

---


### Using locale strings in templates

If your component includes both templates and locale strings then the strings are made available to the template through the `lang` variable. The `lang` variable is auto-inserted into the `templates.mjs` file for all projects that have locale string files.

Locale file: `./locales/strings_en.json`

```JSON
{
  "NAME": "Frank N Stein"
}
```

Template file: `./person.html`

```html
<div class="person">
  <div>Name: <span class="name">${lang.NAME}</span></div>
</div>
```

Output in `./_compiled/templates.mjs`:

```JavaScript
import locales from './locales.mjs';
const lang = locales();
.
.
.

templates.str = function(key, data) {
  switch(key) {
    case 'person';
      return `<div class="person"> <div>Name: <span class="name">${lang.NAME}</span></div> </div>`;
    .
    .
    .
  }
}
```

### Passing data into a template

The signature of the functions `templates.str` and `templates.dom` is:

```JavaScript
function(key, data) {}
```

So when your code calls either `templates.str` and `templates.dom` you can pass any object as the second parameter.

> The first parameter is they key used to get the correct template.

If you wanted to create a table with a number of rows defined by a variable you would create your template like this:

Template file `content.html`:

```html
<table>
  ${[...Array(data.size).keys()].map( i => `<tr class="row${i}">
    <td>${i}</td>
    <td class="name"></td>
    <td class="age"></td>
  </tr>`).join('')}
</table>
```

If you called `templates.str('content', {size: 10})` then you would get 10 rows created. If you called `templates.str('content', {size: 87})` then you would get 87 rows created.

You can pass in any data and use it any way your imagination can imagine. You just need to follow the rules for [template literals](http://devdocs.io/javascript/template_literals).

### Adding an `import` in a template

Sometimes you need to be able to access external code within a template.

In this example we need an external function called `name`.

```html
<div class="person">
  <div>Name: <span class="name">${name("FRANK")}</span></div>
</div>
```

To do this we can add the import to the template file like this:

```html
<%
import name from "../name.mjs";
%>
<div class="person">
  <div>Name: <span class="name">${name("FRANK")}</span></div>
</div>
```

The import line of code will be inserted into the top of `templates.mjs`. _You can add as many import lines as you need._

> ONLY `import` is valid within a template. No other code is permitted.

## History

| Date | Version | Description |
| --- | --- | --- |
| 06/15/2018 | 2.1.0 | &#x25cf; Moved source files to `lib` folder.<br/>&#x25cf; Added `index.js`.<br/>&#x25cf; Cleaned up documentation.<br/>&#x25cf; Now using `rollup` as a sub-object for require. Getting ready for v3.0.0. |
| 06/11/2018 | 2.0.1 | &#x25cf; Bug fix to correctly set the name of an IIFE conversion. |
| 06/07/2018 | 2.0.0 | **Breaking Changes!!**<br>&#x25cf; Removed the escaping of the back-tick in templates. This was preventing sub-ES6 Template Literals in the templates.<br/>&#x25cf; You now must list the source folders. In most cases you would change from `srcPath: "modules/src"` to `srcPath: "modules/src/*"`<br/>&#x25cf; Changed default build types from MJS and IIFE to MJS and CJS since these can both be loaded in a similar manner.<br/>&#x25cf; `addKELocale` is now `false` by default<br/>&#x25cf; `alwaysReturnFile` is now `false` by default.<br/>&#x25cf; `defaultLocaleVariable` is now set to `document.documentElement.lang` which is the value set in the `lang` attribute of the `<html>` tag: `<html lang="fr">` would use `fr` as the default value when getting the `lang` object.<br/>&#x25cf; `includePath` is now `false` by default.<br/>&#x25cf; New config options `dstExtCJS`, `dstExtCJS5`, `dstExtIIFE`, `dstExtIIFE5` and `dstExtMJS` allow you to set the output extension for the various output file types.<br/>&#x25cf; Added ability for `distPath` to be an object and not just a string.<br/>&#x25cf; Added and cleaned up Docs<br/>&#x25cf; Added more testing for the new code. |
| 05/29/2018 | 1.1.0 | &#x25cf; Added code to allow template files to define imports they need.<br/>&#x25cf; Improved Docs. Added Travis and Code Climate. |
| 05/10/2018 | 1.0.2 | &#x25cf; Corrected REGEX to get correct file names for locale files.<br/>&#x25cf; Improved error output to simplify debugging. |
| 04/03/2018 | 1.0.1 | &#x25cf; Added pre-commit tests. |
| 03/29/2018 | 1.0.0 | &#x25cf; Added options for `addKELocale`, `defaultLocaleVariable ` and `sourcemap`.<br/>&#x25cf; Spelling Correction: Renamed option `minTempalteWS` to `minTemplateWS`.<br/>&#x25cf; If there are no compiled files to generate and `alwaysReturnFile` if set to `false` then no temporary folder is created. |
| 02/26/2018 | 0.0.0 | Initial Release. |
