const fs = require('fs');

function readFile(filePath) {
  return fs.readFileSync(filePath, {encoding: 'utf-8'}).trim().replace(/`/g, '\\`');
}

module.exports = readFile;
