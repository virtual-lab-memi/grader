var executor = require('./executor'),
  fileCompare = require('file-compare'),
  formatter = require('sprintf-js').sprintf,
  db = require('../db/db-connector'),
  fs = require('fs'),
  utils = require('./utils');

exports.grade = function(data, done) {
  var solution = data.solution,
    problem = data.problem,
    expectedOutput = formatter(Config.sandbox.expectedOutputFormat, problem.outputTest),
    output = executor.OUTPUT,
    result;
  //TODO: Test if the files exist.

  fileCompare.compare(expectedOutput, output, 'md5', function(compareResult, err) {
    result = data.result;
    result.error = '';
    Logger.info('ID: %s - Comparator result: %s', CURRENT_JOB, compareResult);

    if (err || !compareResult) {
      Logger.info('ID: %s - FINAL COMPARE RESULT: WRONG_ANSWER', CURRENT_JOB);
      result.grade = 0;
      result.status = 'WRONG_ANSWER';
    } else {
      Logger.info('ID: %s - FINAL COMPARE RESULT: SUCCESS', CURRENT_JOB);
      result.grade = 100;
      result.status = 'SUCCESS';
    }

    db.solutions.update({
      _id: solution._id
    }, {
      $set: result
    });

    utils.setBestSolutionForInstance(solution, problem);
    utils.cleanUpSandbox(solution._id);
    done && done();
  });
}
