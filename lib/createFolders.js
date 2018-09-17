const fs = require('fs');
const path = require('path');

function createFolders(filePath) {
  let pathParts = filePath.replace(/\\/g, '/').split('/');
  let tempPath = '';

  // Check for Windows Root Folder
  if (pathParts[0].match(/^[a-z]\:$/i)) {
    tempPath = pathParts[0];
    pathParts = pathParts.splice(1);
  }
  else if (pathParts[0] === '') {
    tempPath = '/';
  }

  let len = pathParts.length;
  tempPath = path.join(tempPath, pathParts[0]);
  for (let i = 1; i <= len; i++) {
    // istanbul ignore if
    if (!fs.existsSync(tempPath)) {
      fs.mkdirSync(tempPath);
    }

    tempPath = path.join(tempPath, pathParts[i]||'');
  }
}

module.exports = createFolders;
