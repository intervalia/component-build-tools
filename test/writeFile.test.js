/* eslint-env mocha */
const path = require('path');
const expect = require('chai').expect;
const proxyquire = require('proxyquire');
const ROOT = process.cwd();
var existsList = {};
var unlinkedFiles = [];
var renamedFiles = [];
var writtenFiles = [];
const fsMock = {
  'existsSync': file => existsList[file]||false,
  'renameSync': (fName, tName) => renamedFiles.push({fName, tName}),
  'unlinkSync': file => unlinkedFiles.push(file),
  'writeFileSync': (file, data) => writtenFiles.push({file, data}),
  '@noCallThru': true
};

const writeFile = proxyquire('../lib/writeFile', {
  './createFolders': filePath => undefined, // eslint-disable-line no-undefined
  'fs': fsMock
});

describe('Testing file writeFile.js', () => {
  beforeEach(() => {
    existsList = {};
    renamedFiles = [];
    unlinkedFiles = [];
    writtenFiles = [];
  });

  afterEach(() => {
  });

  it('should init', () => {
    expect(writeFile).to.be.an('function');
  });

  it('should handle writing new file', () => {
    var file = 'testing1';
    var data = 'this is my data';
    writeFile(file, data);

    expect(writtenFiles.length).to.equal(1);
    expect(writtenFiles).to.eql([{file, data}]);
  });

  it('should handle writing new file with backup on', () => {
    var file = 'testing1';
    var data = 'this is my data';
    writeFile(file, data, true);

    expect(writtenFiles.length).to.equal(1);
    expect(writtenFiles).to.eql([{file, data}]);
  });

  it('should handle writing old file and no backup', () => {
    existsList.testing1 = true;
    var file = 'testing1';
    var data = 'this is my data';
    writeFile(file, data, true);

    expect(writtenFiles.length).to.equal(1);
    expect(writtenFiles).to.eql([{file, data}]);
    expect(renamedFiles.length).to.equal(1);
    expect(renamedFiles).to.eql([{fName: file, tName: file+'.bak'}]);
    expect(unlinkedFiles.length).to.equal(0);
  });

  it('should handle writing old file and backup', () => {
    existsList.testing1 = true;
    existsList['testing1.bak'] = true;
    var file = 'testing1';
    var data = 'this is my data';
    writeFile(file, data, true);

    expect(writtenFiles.length).to.equal(1);
    expect(writtenFiles).to.eql([{file, data}]);
    expect(renamedFiles.length).to.equal(1);
    expect(renamedFiles).to.eql([{fName: file, tName: file+'.bak'}]);
    expect(unlinkedFiles.length).to.equal(1);
    expect(unlinkedFiles).to.eql([file+'.bak']);
  });
});
