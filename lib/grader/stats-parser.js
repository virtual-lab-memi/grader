var fs = require('fs'),
  _ = require('lodash');

exports.parse = function(path) {
  var result = {
    time: 0,
    memory: 0,
    status: null,
    error: null
  };

  var content = fs.readFileSync(path).toString();
  var lines = content.split('\n');

  lines.forEach(function(line) {
    var keyValue = line.split(':');
    if (_.startsWith(line, 'status')) {
      switch (keyValue[1]) {
        case 'RE':
          result.status = 'RUNTIME_ERROR';
          break;
        case 'SG':
          result.status = 'RUNTIME_ERROR';
          break;
        case 'TO':
          result.status = 'TIMEOUT_ERROR';
          break;
        case 'XX':
          result.status = 'SERVER_ERROR';
          break;
        default :
          result.status = 'SERVER_ERROR';
          break;
      }
    }

    if (_.startsWith(line, 'cg-mem')) {
      result.memory = parseFloat(keyValue[1]) / 1024;
    }

    if (_.startsWith(line, 'time:')) {
      result.time = parseFloat(keyValue[1]) * 1000;
    }
  });

  return result;
};
