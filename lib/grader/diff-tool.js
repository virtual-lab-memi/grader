var parser = require('parse-diff'),
  fs = require('fs'),
  executor = require('./executor'),
  fileCompare = require('file-compare'),
  _ = require('lodash');

exports.compareNonStrict = function(expectedOutput, output, callback, data, done) {
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
        return callback(err, false, data, done);
      };

      if (!fileContent) {
        return callback(err, true, data, done);
      }
      //TODO: Put parser here if needed.
      return callback(null, false, data, done);
    });
  }
};

exports.compareStrict = function(expectedOutput, output, callback, data, done) {
  fileCompare.compare(expectedOutput, output, 'md5', function(compareResult, err) {
    Logger.info('ID: %s - Comparator result: %s', CURRENT_JOB, compareResult);
    callback(err, compareResult, data, done);
  });
};