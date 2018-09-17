/* eslint-env mocha */
const path = require('path');
const expect = require('chai').expect;
const proxyquire = require('proxyquire');
const ROOT = process.cwd();
var existsList = {};
var createdFolders = [];
const fsMock = {
  'existsSync': file => existsList[file.replace(/\\/g, '/')]||false,
  'mkdirSync': fName => {
    let temp = fName.replace(/\\/g, '/');
    console.log('mkdirSync', temp);
    createdFolders.push(temp);
  },
  '@noCallThru': true
};

const createFolders = proxyquire('../lib/createFolders', {
  fs: fsMock
});

describe('Testing file createFolders.js', () => {
  beforeEach(() => {
    existsList = {
      '/': true
    };
    createdFolders = [];
  });

  afterEach(() => {
  });

  it('should init', () => {
    expect(createFolders).to.be.an('function');
  });

  it('should make a single folder', () => {
    var folder = '/testing';
    createFolders(folder);
    expect(createdFolders.length).to.equal(1);
    expect(createdFolders).to.eql([folder]);
  });

  it('should make a mutiple folders', () => {
    var folder = '/testing/dogs/third';
    createFolders(folder);
    expect(createdFolders.length).to.equal(3);
    expect(createdFolders).to.eql(['/testing', '/testing/dogs', '/testing/dogs/third']);
  });

  it('should make a non-root folder', () => {
    var folder = 'testing/dogs/third';
    createFolders(folder);
    expect(createdFolders.length).to.equal(3);
    expect(createdFolders).to.eql(['testing', 'testing/dogs', 'testing/dogs/third']);
  });
});
