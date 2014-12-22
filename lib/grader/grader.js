var executor = require('./executor.js'),
  fileCompare = require('file-compare'),
  db = require('../db/db-connector.js'),
  fs = require('fs'),
  utils = require('./utils.js');

exports.grade = function(data, done) {
  var solution = data.solution,
    problem = data.problem,
    expectedOutput = executor.PROBLEMS_REPO + '/' + problem._id + '.out',
    output = executor.SANDBOX + '/output',
    result;

  fileCompare.compare(expectedOutput, output, 'md5', function(compareResult, err) {
    result = data.result;
    result.error = '';
    console.log(compareResult);
    if (err || !compareResult) {
      console.log('WRONG_ANSWER');
      result.grade = 0;
      result.status = 'WRONG_ANSWER';
    } else {
      console.log('SUCCESS');
      result.grade = 100;
      result.status = 'SUCCESS';
    }

    db.solutions.update({_id:solution._id}, {$set: result});
    utils.cleanUpSandbox();
    done && done();
  });
}
