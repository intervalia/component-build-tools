const fs = require('fs');

function readFile(filePath) {
  return fs.readFileSync(filePath, {encoding: 'utf-8'}).trim();
}

module.exports = readFile;
