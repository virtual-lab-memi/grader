var SANDBOX = require('./executor.js').SANDBOX,
  fs = require('fs');

exports.cleanUpSandbox = function(dirPath) {
  var removeSelf = false,
    files,
    index,
    filePath;

  dirPath = dirPath ? dirPath : SANDBOX;

  try {
    files = fs.readdirSync(dirPath);
  } catch (e) {
    return;
  }

  if (files.length > 0)
    for (index = 0; index < files.length; index++) {
      filePath = dirPath + '/' + files[index];
      if (fs.statSync(filePath).isFile())
        fs.unlinkSync(filePath);
      else
        rmDir(filePath);
    }

  if (removeSelf)
    fs.rmdirSync(dirPath);
};
