/* eslint-env mocha */
const path = require('path');
const expect = require('chai').expect;
const cbtCompile = require('../cbtCompile');
const ROOT = process.cwd();

function showCode(code) {
  code.split(/[\r\n]+/).forEach(
    (line, i) => {
      console.log((i+1).toString().padStart(3)+':  ', line);
    }
  );
}

describe('Testing file cbtCompile.js', () => {
  var defaultConfig;
  beforeEach(() => {
    defaultConfig = {
      addEOLocale: true,
      addKELocale: true,
      alwaysReturnFile: true,
      debug: false,
      defaultLocale: 'en',
      defaultLocaleVariable: 'window.locale',
      distPath: 'dist/js',
      includePath: true,
      localeFiles: ['locales/strings_*.json'],
      makeMinFiles: false,
      minTemplateWS: true,
      separateByLocale: false,
      sourcemap: false,
      //srcFileName: 'wc.*.mjs',
      srcFolders: [],
      tagMissingStrings: true,
      templateFiles: ['*.html'],
      tempLocalesName: 'locales.mjs',
      tempPath: './_compiled/',
      tempTemplateName: 'templates.mjs',
      useStrict: false
    };
  });

  afterEach(() => {
  });

  it('should init', () => {
    expect(cbtCompile).to.be.an('object');
    expect(cbtCompile.locales).to.be.a('function');
    expect(cbtCompile.templates).to.be.a('function');
  });

  describe('Tests for cbtCompile.locales()', () => {
    it('should handle no locale files: no return', () => {
      const config = Object.assign({}, defaultConfig,{
        alwaysReturnFile: false
      });

      var results = cbtCompile.locales(path.join(ROOT, './test/testFolders/cbtCompileFolders/noLocales'), config);
      expect(results).to.equal(false);
    });

    it('should handle no locale files: sent as string, no return', () => {
      const config = Object.assign({}, defaultConfig,{
        alwaysReturnFile: false,
        localeFiles: 'locales/strings_*.json',
      });

      var results = cbtCompile.locales(path.join(ROOT, './test/testFolders/cbtCompileFolders/noLocales'), config);
      expect(results).to.equal(false);
    });

    it('should handle no locale files: default return', () => {
      const config = Object.assign({}, defaultConfig);

      var results = cbtCompile.locales(path.join(ROOT, './test/testFolders/cbtCompileFolders/noLocales'), config);
      expect(results).to.equal('export default () => ({});');
    });

    it('should handle folder with locale files', () => {
      const config = Object.assign({}, defaultConfig);

      var results = cbtCompile.locales(path.join(ROOT, './test/testFolders/cbtCompileFolders/withLocales'), config);

      // Convert from ES6 module import to IIFE like return value
      results = results.replace('export default', 'return');
      var testFn = new Function(results); // Create a temporary function to test this compiled code.
      //showCode(testFn.toString());

      // Get the `getLocaleStrings` function
      var locales = testFn();
      expect(locales('en')).to.eql({"BUTTON_OK": "OK","LABEL_FIND": "Find Me","TITLE_COOL": "This is a cool title"}, 'English');
      expect(locales('fr')).to.eql({"BUTTON_OK": "OK","LABEL_FIND": "Trouvez-moi","TITLE_COOL": "C'est un titre sympa"}, "French");
      expect(locales('it')).to.eql({"BUTTON_OK": "Bene","LABEL_FIND": "Trovami","TITLE_COOL": "Questo è un titolo interessante"}, "Italian");
      expect(locales('ja')).to.eql({"BUTTON_OK": "OK","LABEL_FIND": "私を見つける","TITLE_COOL": "これはクールなタイトルです"}, "Japanese");
      expect(locales('ke')).to.eql({"BUTTON_OK": "BUTTON_OK","LABEL_FIND": "LABEL_FIND","TITLE_COOL": "TITLE_COOL"}, "KE");
      var eo = locales('eo');
      expect(eo).to.be.an('object');
      expect(Object.keys(eo)).to.eql(["BUTTON_OK","LABEL_FIND","TITLE_COOL"]);
    });

    it('should handle poorly formed locale file', (done) => {
      const config = Object.assign({}, defaultConfig);

      var results;

      try {
        results = cbtCompile.locales(path.join(ROOT, './test/testFolders/cbtCompileFolders/withBadLocales'), config);
        done(new Error('We did not throw an exception for invalid JSON locale file and should have.'));
      }

      catch(ex) {
        expect(ex.message.substr(0,27)).to.equal('Unable to parse locale file');
        done();
      }
    });

    it('should handle folder with locale files and missing default strings', (done) => {
      const config = Object.assign({}, defaultConfig);

      var results;

      try {
        results = cbtCompile.locales(path.join(ROOT, './test/testFolders/cbtCompileFolders/withLocalesMissingDefault'), config);
        done(new Error('We did not throw an exception for missing default locale file and should have.'));
      }

      catch(ex) {
        expect(ex.message).to.equal('locale file for default locale "en" was not found.');
        done();
      }
    });

    it('should handle folder with locale files and missmatched strings', () => {
      const config = Object.assign({}, defaultConfig);

      var results = cbtCompile.locales(path.join(ROOT, './test/testFolders/cbtCompileFolders/withLocalesMissmatched'), config);

      // Convert from ES6 module import to IIFE like return value
      results = results.replace('export default', 'return');
      var testFn = new Function(results); // Create a temporary function to test this compiled code.
      //showCode(testFn.toString());

      // Get the `getLocaleStrings` function
      var locales = testFn();
      expect(locales('en')).to.eql({"BUTTON_CANCEL": "Cancel","ONLY_EN": "This is only in EN"}, 'English');
      expect(locales('fr')).to.eql({"BUTTON_CANCEL": "Annuler","ONLY_EN": "-*This is only in EN*-"}, "French");
      expect(locales('it')).to.eql({"BUTTON_CANCEL": "Annulla","ONLY_EN": "-*This is only in EN*-"}, "Italian");
      expect(locales('ja')).to.eql({"BUTTON_CANCEL": "キャンセル","ONLY_EN": "-*This is only in EN*-"}, "Japanese");
      expect(locales('ke')).to.eql({"BUTTON_CANCEL": "BUTTON_CANCEL","ONLY_EN": "ONLY_EN"}, "KE");
      var eo = locales('eo');
      expect(eo).to.be.an('object');
      expect(Object.keys(eo)).to.eql(["BUTTON_CANCEL","ONLY_EN"]);
    });

    it('should handle alternate options', () => {
      const config = Object.assign({}, defaultConfig, {
        addKELocale: false,
        tagMissingStrings: false
      });

      var results = cbtCompile.locales(path.join(ROOT, './test/testFolders/cbtCompileFolders/withLocalesAlternate'), config);
      // Convert from ES6 module import to IIFE like return value
      results = results.replace('export default', 'return');
      var testFn = new Function(results); // Create a temporary function to test this compiled code.
      //showCode(testFn.toString());

      // Get the `getLocaleStrings` function
      var locales = testFn();
      expect(locales('en')).to.eql({"BUTTON_OK": "OK","LABEL_FIND": "Find Me","TITLE_COOL": "This is a cool title","LONG_NAME_27": "This is a long named string","LONG_NAME_42": "This is an even longer named string. Weee.","HTML_STR": "<div class=\"first class\">This is the <b>best</b> thing ever on planet earth!</div>","VAR_STR": "Do ${something} and %{something_else} too."}, 'English');
      expect(locales('ke')).to.eql({"BUTTON_OK": "OK","LABEL_FIND": "Find Me","TITLE_COOL": "This is a cool title","LONG_NAME_27": "This is a long named string","LONG_NAME_42": "This is an even longer named string. Weee.","HTML_STR": "<div class=\"first class\">This is the <b>best</b> thing ever on planet earth!</div>","VAR_STR": "Do ${something} and %{something_else} too."}, 'KE');
      var eo = locales('eo');
      expect(eo).to.be.an('object');
      expect(Object.keys(eo)).to.eql(["BUTTON_OK","LABEL_FIND","TITLE_COOL","LONG_NAME_27","LONG_NAME_42","HTML_STR","VAR_STR"], "EO");
    });
  });

  describe('Tests for cbtCompile.templates()', () => {
    it('should handle no template files: no return', () => {
      const config = Object.assign({}, defaultConfig,{
        alwaysReturnFile: false
      });

      var results = cbtCompile.templates(path.join(ROOT, './test/testFolders/cbtCompileFolders/noTemplates'), config);
      expect(results).to.equal(false);
    });

    it('should handle no template files: sent as string, no return', () => {
      const config = Object.assign({}, defaultConfig,{
        alwaysReturnFile: false,
        templateFiles: '*.html',
      });

      var results = cbtCompile.templates(path.join(ROOT, './test/testFolders/cbtCompileFolders/noTemplates'), config);
      expect(results).to.equal(false);
    });

    it('should handle no template files: default return', () => {
      const config = Object.assign({}, defaultConfig);

      var results = cbtCompile.templates(path.join(ROOT, './test/testFolders/cbtCompileFolders/noTemplates'), config);
      expect(results).to.equal(`export default {dom:()=>null,str:()=>''};`);
    });

    it('should handle template files', () => {
      const config = Object.assign({}, defaultConfig);

      var results = cbtCompile.templates(path.join(ROOT, './test/testFolders/cbtCompileFolders/withTemplates'), config);

      // Convert from ES6 module import to IIFE like return value
      results = results.replace('export default', 'return');
      var testFn = new Function(results); // Create a temporary function to test this compiled code.
      var templates = testFn();

      expect(templates.str('test1')).to.equal('<div>Content for Test1</div>');
    });

    it('should handle bad template file name', (done) => {
      const config = Object.assign({}, defaultConfig);

      try {
        cbtCompile.templates(path.join(ROOT, './test/testFolders/cbtCompileFolders/withBadTemplateName'), config);
        done(new Error('template compile succeded and should not have.'));
      }

      catch(ex) {
        expect(ex.message.substr(0,22)).to.equal('Invalid Template name:');
        done();
      }
    });

    it('should handle template files with locales', () => {
      const config = Object.assign({}, defaultConfig, {
        defaultLocaleVariable: 'gLocale'
      });

      var data = {
        gender: "MALE",
        name: "Frank N. Stein"
      };

      var results = cbtCompile.templates(path.join(ROOT, './test/testFolders/cbtCompileFolders/withTemplatesAndLocales'), config, true);

      // Convert from ES6 module import to IIFE like return value
      results = results.replace('export default', 'return');
      results = results.replace('import locales from \'./locales.mjs\'', `function locales() {
        return {
          "BUTTON_CANCEL": "取消",
          "BUTTON_OK": "好"
        };
      }`);
      //showCode(results);
      var testFn = new Function(results); // Create a temporary function to test this compiled code.
      //showCode(testFn.toString());
      var templates = testFn();

      expect(templates.str('withoutStrings')).to.equal('<ol> <li>One</li> <li>Two</li> <li>Three</li> <li>Four</li> </ol>');
      expect(templates.str('withStrings')).to.equal('<div> <button>好</button> <button>取消</button> </div>');
      expect(templates.str('withData', data)).to.equal('<div> <style> .gender { color: #666; } .gender-male { color: blue; } .gender-female { color: pink; } </style> <div class="gender gender-male">MALE</div> <div class="name">Frank N. Stein</div> </div>');
    });
  });
});
