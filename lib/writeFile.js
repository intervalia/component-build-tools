const fs = require('fs');
const createFolders = require('./createFolders');

function writeFile(filePath, content, makeBak = false) {
  createFolders(filePath);

  if (makeBak) {
    let bakFilePath = `${filePath}.bak`;

    // istanbul ignore else
    if (fs.existsSync(bakFilePath)) {
      fs.unlinkSync(bakFilePath);
    }
    // istanbul ignore else
    if (fs.existsSync(filePath)) {
      fs.renameSync(filePath, bakFilePath);
    }
  }

  fs.writeFileSync(filePath, content);
}

module.exports = writeFile;
