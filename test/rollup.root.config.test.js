/* eslint-env mocha */
const expect = require('chai').expect;
const proxyquire =  require('proxyquire');
const fsOriginal = require('fs');
const path = require('path');
const cbtCompileMock = {};
const fsMock = {
  existsSync: (file) => true,
  lstatSync: fsOriginal.lstatSync,
  mkdirSync: (file) => 0o777,
  readdirSync: fsOriginal.readdirSync,
  renameSync: (fName, tName) => undefined,
  writeFileSync: (file, data) => writtenFiles.push({file,data}),
  unlinkSync: (file) => undefined,
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

  it('should process a folder with one MSJ to compile', () => {
    let resp = rollupConfig.init({
      alwaysReturnFile: false,
      distPath: 'test/testFolders/rollupFolders/dist',
      srcFolders: ['test/testFolders/rollupFolders/onlyOneMJS']
    });

    expect(resp.length).to.equal(2);
    expect(resp[0].input.split('test/testFolders')[1]).to.equal('/rollupFolders/onlyOneMJS/one/one.mjs');
    expect(resp[0].output.format).to.equal('es');
    expect(resp[0].output.sourcemap).to.equal(undefined);
    expect(resp[0].output.file.split('test/testFolders')[1]).to.equal('/rollupFolders/dist/one/one.mjs');
    expect(resp[1].input.split('test/testFolders')[1]).to.equal('/rollupFolders/onlyOneMJS/one/one.mjs');
    expect(resp[1].output.format).to.equal('iife');
    expect(resp[1].output.sourcemap).to.equal(undefined);
    expect(resp[1].output.file.split('test/testFolders')[1]).to.equal('/rollupFolders/dist/one/one.iife.js');
    expect(writtenFiles.length).to.equal(0);
  });

  it('should process a folder with one MSJ with locales to compile', () => {
    let resp = rollupConfig.init({
      alwaysReturnFile: false,
      distPath: 'test/testFolders/rollupFolders/dist',
      srcFolders: ['test/testFolders/rollupFolders/MJSWithLocales'],
      sourcemap: true
    });

    expect(resp.length).to.equal(2);
    expect(resp[0].input.split('test/testFolders')[1]).to.equal('/rollupFolders/MJSWithLocales/one/one.mjs');
    expect(resp[0].output.format).to.equal('es');
    expect(resp[0].output.sourcemap).to.equal(true);
    expect(resp[0].output.file.split('test/testFolders')[1]).to.equal('/rollupFolders/dist/one/one.mjs');
    expect(resp[1].input.split('test/testFolders')[1]).to.equal('/rollupFolders/MJSWithLocales/one/one.mjs');
    expect(resp[1].output.format).to.equal('iife');
    expect(resp[1].output.sourcemap).to.equal(true);
    expect(resp[1].output.file.split('test/testFolders')[1]).to.equal('/rollupFolders/dist/one/one.iife.js');
    expect(writtenFiles.length).to.equal(1);
    expect(writtenFiles[0].file.split('test/testFolders')[1]).to.equal('/rollupFolders/MJSWithLocales/one/_compiled/locales.mjs');

    let results = writtenFiles[0].data.replace('export default', 'return');
    var testFn = new Function(results); // Create a temporary function to test this compiled code.

    // Get the `getLocaleStrings` function
    var locales = testFn();
    expect(locales('en').LABEL_NAME).to.equal('Please enter your name.');
    expect(locales('fr').LABEL_NAME).to.equal('Veuillez entrer votre nom.');
    expect(locales('it').LABEL_NAME).to.equal('Inserisci il tuo nome.');
    expect(locales('ja').LABEL_NAME).to.equal('あなたの名前を入力してください');
    expect(locales('ke').LABEL_NAME).to.equal('LABEL_NAME');
  });

  it('should process a folder with one MSJ with templates and locales to compile', () => {
    let resp = rollupConfig.init({
      buildTypes: [rollupConfig.BUILD_TYPES.IIFE5,rollupConfig.BUILD_TYPES.CJS,rollupConfig.BUILD_TYPES.CJS5],
      alwaysReturnFile: false,
      distPath: 'test/testFolders/rollupFolders/dist',
      makeMinFiles: true,
      srcFolders: ['test/testFolders/rollupFolders/MJSWithLocalesAndTemplates'],
      sourcemap: true
    });

    expect(resp.length).to.equal(6);
    expect(resp[0].output.format).to.equal('iife');
    expect(resp[0].plugins.length).to.equal(1, 'iife only buble');
    expect(resp[0].plugins[0].name).to.equal('buble');
    expect(resp[1].output.format).to.equal('iife');
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

    expect(writtenFiles.length).to.equal(2);
    expect(writtenFiles[0].file.split('test/testFolders')[1]).to.equal('/rollupFolders/MJSWithLocalesAndTemplates/one/_compiled/locales.mjs');
    expect(writtenFiles[1].file.split('test/testFolders')[1]).to.equal('/rollupFolders/MJSWithLocalesAndTemplates/one/_compiled/templates.mjs');

    let results = writtenFiles[0].data.replace('export default', 'return');
    var testFn = new Function(results); // Create a temporary function to test this compiled code.

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
