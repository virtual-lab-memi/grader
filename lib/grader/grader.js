var executor = require('./executor.js'),
  logger = require('../logger.js').Logger,
  fileCompare = require('file-compare'),
  db = require('../db/db-connector.js'),
  fs = require('fs'),
  utils = require('./utils.js');

exports.grade = function(data, done) {
  var solution = data.solution,
    problem = data.problem,
    expectedOutput = executor.PROBLEMS_REPO + '/problemFiles-' + problem.outputTest + '-output',
    output = executor.SANDBOX + '/output',
    result;
  //TODO: Test if the files exist.

  fileCompare.compare(expectedOutput, output, 'md5', function(compareResult, err) {
    result = data.result;
    result.error = '';
    logger.info('Comparator result: %s', compareResult);

    if (err || !compareResult) {
      logger.info('FINAL RESULT: WRONG_ANSWER');
      result.grade = 0;
      result.status = 'WRONG_ANSWER';
    } else {
      logger.info('FINAL RESULT: SUCCESS');
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
