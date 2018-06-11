/* eslint-env mocha */
const expect = require('chai').expect;
const proxyquire = require('proxyquire');
const fsOriginal = require('fs');
const path = require('path');
const cbtCompileMock = {};
const fsMock = {
  'existsSync': file => true,
  'lstatSync': fsOriginal.lstatSync,
  'mkdirSync': file => 0o777,
  'readdirSync': fsOriginal.readdirSync,
  'renameSync': (fName, tName) => undefined, // eslint-disable-line no-undefined
  'writeFileSync': (file, data) => writtenFiles.push({file, data}),
  'unlinkSync': file => undefined, // eslint-disable-line no-undefined
  '@noCallThru': true
};

const rollupConfig = proxyquire('../rollup.root.config.js', {
  './cbtCompile': cbtCompileMock,
  'fs': fsMock
});

var writtenFiles = [];

const ROOT = process.cwd();

describe('Testing file `rollup.root.config.js`', () => {
  beforeEach(() => {
    writtenFiles = [];
  });

  afterEach(() => {
  });

  it('should init', () => {
    expect(rollupConfig).to.be.an('object');
    expect(rollupConfig.init).to.be.a('function');
    expect(rollupConfig.BUILD_TYPES).to.be.an('object');
  });

  it('should handle invalid `sourcemap`', (done) => {
    try {
      let resp = rollupConfig.init({
        sourcemap: 'badthings'
      });
      done('Exception was not thrown.');
    }

    catch (ex) {
      expect(ex instanceof TypeError).to.equal(true);
      expect(ex.message).to.equal('The value for `config.sourcemap` must be [true | false | "inline"].');
      done();
    }
  });

  it('should handle invalid `srcFolders`', () => {
    let resp = rollupConfig.init({
      srcFolders: 'test/testFolders/rollupFolders/onlyOneMJS/one/one.mjs'
    });

    expect(resp).to.eql([]);
  });

  it('should handle invalid `distPath` 1', (done) => {
    try {
      let resp = rollupConfig.init({
        distPath: 123
      });
      done('Exception was not thrown.');
    }

    catch (ex) {
      expect(ex instanceof TypeError).to.equal(true);
      expect(ex.message).to.equal('The value for `config.distPath` must be a `string` or an `object`.');
      done();
    }
  });

  it('should handle invalid `distPath` 2', (done) => {
    try {
      let resp = rollupConfig.init({
        distPath: {
          dog: ''
        }
      });
      done('Exception was not thrown.');
    }

    catch (ex) {
      expect(ex instanceof TypeError).to.equal(true);
      expect(ex.message).to.equal('The value for `config.distPath.MJS` is missing.');
      done();
    }
  });

  it('should handle invalid `distPath` 3', (done) => {
    try {
      let resp = rollupConfig.init({
        distPath: {
          MJS: 'apath'
        }
      });
      done('Exception was not thrown.');
    }

    catch (ex) {
      expect(ex instanceof TypeError).to.equal(true);
      expect(ex.message).to.equal('The value for `config.distPath.CJS` is missing.');
      done();
    }
  });

  it('should handle invalid `buildType` 1', (done) => {
    try {
      let resp = rollupConfig.init({
        buildTypes: null
      });
      done('Exception was not thrown.');
    }

    catch (ex) {
      expect(ex instanceof TypeError).to.equal(true);
      expect(ex.message).to.equal('The value for `config.buildTypes` is invalid.');
      done();
    }
  });

  it('should handle invalid `buildType` 2', (done) => {
    try {
      let resp = rollupConfig.init({
        buildTypes: ['dogs']
      });
      done('Exception was not thrown.');
    }

    catch (ex) {
      expect(ex instanceof TypeError).to.equal(true);
      expect(ex.message).to.equal('The `config.buildTypes` value of `dogs` is invalid.');
      done();
    }
  });

  it('should process nothing with no `srcFolders` set', () => {
    let resp = rollupConfig.init();

    expect(resp).to.eql([]);
  });

  it('should process a folder with nothing to compile', () => {
    let resp = rollupConfig.init({
      srcFolders: ['test/testFolders/rollupFolders/noCompile']
    });

    expect(resp).to.eql([]);
  });

  it('should process a folder with srcFolders as a string', () => {
    let resp = rollupConfig.init({
      srcFolders: 'test/testFolders/rollupFolders/noCompile'
    });

    expect(resp).to.eql([]);
  });

  it('should process a folder with one MSJ to compile', () => {
    let resp = rollupConfig.init({
      distPath: 'test/testFolders/rollupFolders/dist',
      srcFolders: ['test/testFolders/rollupFolders/onlyOneMJS/one']
    });

    expect(resp.length).to.equal(2);
    expect(resp[0].input.split('test/testFolders')[1]).to.equal('/rollupFolders/onlyOneMJS/one/one.mjs');
    expect(resp[0].output.format).to.equal('es');
    expect(resp[0].output.sourcemap).to.equal(false);
    expect(resp[0].output.file.split('test/testFolders')[1]).to.equal('/rollupFolders/dist/one.mjs');
    expect(resp[1].input.split('test/testFolders')[1]).to.equal('/rollupFolders/onlyOneMJS/one/one.mjs');
    expect(resp[1].output.format).to.equal('cjs');
    expect(resp[1].output.sourcemap).to.equal(false);
    expect(resp[1].output.file.split('test/testFolders')[1]).to.equal('/rollupFolders/dist/one.cjs.js');
    expect(writtenFiles.length).to.equal(0);
  });

  it('should handle valid `distPath` object', () => {
    let resp = rollupConfig.init({
      dstExtCJS: '.js',
      dstExtMJS: '.js',
      distPath: {
        MJS: 'test/testFolders/rollupFolders/dist/mjs',
        CJS: 'test/testFolders/rollupFolders/dist/cjs'
      },
      srcFolders: ['test/testFolders/rollupFolders/onlyOneMJS/one']
    });

    expect(resp.length).to.equal(2);
    expect(resp[0].input.split('test/testFolders')[1]).to.equal('/rollupFolders/onlyOneMJS/one/one.mjs');
    expect(resp[0].output.format).to.equal('es');
    expect(resp[0].output.file.split('test/testFolders')[1]).to.equal('/rollupFolders/dist/mjs/one.js');
    expect(resp[1].input.split('test/testFolders')[1]).to.equal('/rollupFolders/onlyOneMJS/one/one.mjs');
    expect(resp[1].output.format).to.equal('cjs');
    expect(resp[1].output.file.split('test/testFolders')[1]).to.equal('/rollupFolders/dist/cjs/one.js');
    expect(writtenFiles.length).to.equal(0);
  });

  it('should process a folder with one MSJ to compile with inline source maps', () => {
    let resp = rollupConfig.init({
      distPath: 'test/testFolders/rollupFolders/dist',
      sourcemap: 'inline',
      srcFolders: ['test/testFolders/rollupFolders/onlyOneMJS/one']
    });

    expect(resp.length).to.equal(2);
    expect(resp[0].input.split('test/testFolders')[1]).to.equal('/rollupFolders/onlyOneMJS/one/one.mjs');
    expect(resp[0].output.format).to.equal('es');
    expect(resp[0].output.sourcemap).to.equal('inline');
    expect(resp[0].output.file.split('test/testFolders')[1]).to.equal('/rollupFolders/dist/one.mjs');
    expect(resp[1].input.split('test/testFolders')[1]).to.equal('/rollupFolders/onlyOneMJS/one/one.mjs');
    expect(resp[1].output.format).to.equal('cjs');
    expect(resp[1].output.sourcemap).to.equal('inline');
    expect(resp[1].output.file.split('test/testFolders')[1]).to.equal('/rollupFolders/dist/one.cjs.js');
    expect(writtenFiles.length).to.equal(0);
  });

  it('should process a folder with one MSJ with locales to compile', () => {
    let resp = rollupConfig.init({
      addKELocale: true,
      includePath: true,
      distPath: 'test/testFolders/rollupFolders/dist',
      srcFolders: ['test/testFolders/rollupFolders/MJSWithLocales/*'],
      sourcemap: true
    });

    expect(resp.length).to.equal(2);
    expect(resp[0].input.split('test/testFolders')[1]).to.equal('/rollupFolders/MJSWithLocales/one/one.mjs');
    expect(resp[0].output.format).to.equal('es');
    expect(resp[0].output.sourcemap).to.equal(true);
    expect(resp[0].output.file.split('test/testFolders')[1]).to.equal('/rollupFolders/dist/one/one.mjs');
    expect(resp[1].input.split('test/testFolders')[1]).to.equal('/rollupFolders/MJSWithLocales/one/one.mjs');
    expect(resp[1].output.format).to.equal('cjs');
    expect(resp[1].output.sourcemap).to.equal(true);
    expect(resp[1].output.file.split('test/testFolders')[1]).to.equal('/rollupFolders/dist/one/one.cjs.js');
    expect(writtenFiles.length).to.equal(1);
    expect(writtenFiles[0].file.split('test/testFolders')[1]).to.equal('/rollupFolders/MJSWithLocales/one/_compiled/locales.mjs');

    let results = writtenFiles[0].data.replace('export default', 'return');

    // Create a temporary function to test this compiled code.
    var testFn = new Function(results); // eslint-disable-line no-new-func

    // Get the `getLocaleStrings` function
    var locales = testFn();
    expect(locales('en').LABEL_NAME).to.equal('Please enter your name.');
    expect(locales('fr').LABEL_NAME).to.equal('Veuillez entrer votre nom.');
    expect(locales('it').LABEL_NAME).to.equal('Inserisci il tuo nome.');
    expect(locales('ja').LABEL_NAME).to.equal('あなたの名前を入力してください');
    expect(locales('ke').LABEL_NAME).to.equal('LABEL_NAME');
  });

  //eslint-disable-next-line max-statements
  it('should process a folder with one MSJ with templates and locales to compile', () => {
    let resp = rollupConfig.init({
      addKELocale: true,
      buildTypes: [rollupConfig.BUILD_TYPES.IIFE5, rollupConfig.BUILD_TYPES.CJS, rollupConfig.BUILD_TYPES.CJS5, rollupConfig.BUILD_TYPES.IIFE],
      distPath: 'test/testFolders/rollupFolders/dist',
      makeMinFiles: true,
      srcFolders: ['test/testFolders/rollupFolders/MJSWithLocalesAndTemplates/*'],
      sourcemap: true
    });

    expect(resp.length).to.equal(8);
    expect(resp[0].output.format).to.equal('iife');
    expect(resp[0].output.name).to.equal('one');
    expect(resp[0].plugins.length).to.equal(1, 'iife only buble');
    expect(resp[0].plugins[0].name).to.equal('buble');
    expect(resp[1].output.format).to.equal('iife');
    expect(resp[1].output.name).to.equal('one');
    expect(resp[1].plugins.length).to.equal(2, 'iife buble and uglify');
    expect(resp[1].plugins[0].name).to.equal('buble');
    expect(resp[1].plugins[1].name).to.equal('uglify');

    expect(resp[2].output.format).to.equal('cjs');
    expect(resp[2].plugins.length).to.equal(0);
    expect(resp[3].output.format).to.equal('cjs');
    expect(resp[3].plugins.length).to.equal(1);
    expect(resp[3].plugins[0].name).to.equal('uglify');

    expect(resp[4].output.format).to.equal('cjs');
    expect(resp[4].plugins.length).to.equal(1);
    expect(resp[4].plugins[0].name).to.equal('buble');
    expect(resp[5].output.format).to.equal('cjs');
    expect(resp[5].plugins.length).to.equal(2);
    expect(resp[5].plugins[0].name).to.equal('buble');
    expect(resp[5].plugins[1].name).to.equal('uglify');

    expect(resp[6].output.format).to.equal('iife');
    expect(resp[6].output.name).to.equal('one');
    expect(resp[6].plugins.length).to.equal(0, 'iife');
    expect(resp[7].output.format).to.equal('iife');
    expect(resp[7].output.name).to.equal('one');
    expect(resp[7].plugins.length).to.equal(1, 'iife and uglify');
    expect(resp[7].plugins[0].name).to.equal('uglify');

    expect(writtenFiles.length).to.equal(2);
    expect(writtenFiles[0].file.split('test/testFolders')[1]).to.equal('/rollupFolders/MJSWithLocalesAndTemplates/one/_compiled/locales.mjs');
    expect(writtenFiles[1].file.split('test/testFolders')[1]).to.equal('/rollupFolders/MJSWithLocalesAndTemplates/one/_compiled/templates.mjs');

    let results = writtenFiles[0].data.replace('export default', 'return');

    // Create a temporary function to test this compiled code.
    var testFn = new Function(results); // eslint-disable-line no-new-func

    // Get the `getLocaleStrings` function
    var locales = testFn();
    expect(locales('en').LABEL_NAME).to.equal('Please enter your name.');
    expect(locales('fr').LABEL_NAME).to.equal('Please enter your name.');
    expect(locales('it').LABEL_NAME).to.equal('Please enter your name.');
    expect(locales('ja').LABEL_NAME).to.equal('Please enter your name.');
    expect(locales('ke').LABEL_NAME).to.equal('LABEL_NAME');

    // TODO: Check templates
  });
});
