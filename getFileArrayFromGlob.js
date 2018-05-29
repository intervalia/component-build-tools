const glob = require('glob');
const path = require('path');

/*
 * Convert an array of Globby paths into an array of paths of existing files.
 */
function getFileArrayFromGlob(rootFolder, globList) {
  let globArray = globList;
  if (!Array.isArray(globList)) {
    globArray = [globList];
  }

  return globArray.reduce(
    (obj, pattern) => {
      const options = {cwd: '/', root: '/'};
      const tempPath = path.join(rootFolder, pattern);
      const newList = glob.sync(tempPath, options);

      if (!newList.length) {
        // no files returned: Copy this path if it is not a globby path
        // istanbul ignore next
        if (!glob.hasMagic(tempPath)) {
          obj.push(tempPath);
        }
      }
      else {
        newList.forEach(function(item) {
          item = path.resolve(rootFolder, item);

          // istanbul ignore next
          if (obj.indexOf(item) === -1) {
            obj.push(item);
          }
        });
      }

      return obj;
    }, []
  );
}

module.exports = getFileArrayFromGlob;
