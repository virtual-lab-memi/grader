var parser = require('parse-diff'),
  fs = require('fs'),
  executor = require('./executor'),
  fileCompare = require('file-compare'),
  _ = require('lodash');

exports.compareNonStrict = function(expectedOutput, output, type, callback, data, done) {
  data.output = '/home/dann/sandbox/diff-output';
  command = 'diff',
  args = ['-u'];

  _.forEach(data.event.diffConfig, function(value, key) {
    args.push(value);
  });

  args.push(output);
  args.push(expectedOutput);
  executor.execute(data, command, args, executeCallback);

  function executeCallback(data, code, done) {
    fs.readFile('/home/dann/sandbox/diff-output', 'utf8', function(err, fileContent) {
      if (err) {
        return callback(err, false, type, data, done);
      };

      if (!fileContent) {
        return callback(err, true, type, data, done);
      }
      //TODO: Put parser here if needed.
      return callback(null, false, type, data, done);
    });
  }
};

exports.compareStrict = function(expectedOutput, output, type, callback, data, done) {
  fileCompare.compare(expectedOutput, output, 'md5', function(compareResult, err) {
    Logger.info('ID: %s - Comparator result: %s', CURRENT_JOB, compareResult);
    callback(err, compareResult, type, data, done);
  });
};