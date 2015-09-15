var executor = require('./executor'),
  runner = require('./runner'),
  fileCompare = require('file-compare'),
  formatter = require('sprintf-js').sprintf,
  db = require('../db/db-connector'),
  fs = require('fs'),
  utils = require('./utils');

exports.grade = function(data, done) {

  var solution = data.solution,
    problem = data.problem,
    expectedOutput = formatter(Config.sandbox.expectedOutputFormat,
        problem.testCases[data.runnerConfig.currentTestCase].output),
    output = data.output,
    result = data.result;
  //TODO: Test if the files exist.
  fileCompare.compare(expectedOutput, output, 'md5', function(compareResult, err) {
    Logger.info('ID: %s - Comparator result: %s', CURRENT_JOB, compareResult);

    if (err || !compareResult) {
      Logger.info('ID: %s - FINAL COMPARE RESULT: WRONG_ANSWER', CURRENT_JOB);
      data.runnerConfig.testCasesFinalStatus = 'WRONG_ANSWER';
    } else {
      Logger.info('ID: %s - FINAL COMPARE RESULT: SUCCESS', CURRENT_JOB);
      data.runnerConfig.testCaseGradeSum += problem.testCases[data.runnerConfig.currentTestCase].value;
    }

    if (data.runnerConfig.testCasesCount === (data.runnerConfig.currentTestCase + 1)) {
      result.time = data.runnerConfig.testCaseTimeSum.toFixed(3);
      result.grade = data.runnerConfig.testCaseGradeSum;
      result.status = data.runnerConfig.testCasesFinalStatus;
      result.error = '';

      db.solutions.update({
        _id: solution._id
      }, {
        $set: result
      });

      if(solution.isProblemValidation && !err && compareResult) {
        Logger.info('ID: %s - Problem Validation Successful', CURRENT_JOB);
        db.problems.update({
          _id: solution.parent
        }, {
          $set: {
            isValidated: true
          }
        });
      }

      utils.setBestSolutionForInstance(solution, problem);
      utils.cleanUpSandbox(solution._id);
      done && done();
    } else {
      data.runnerConfig.currentTestCase++;
      runner.run(data, done);
    }
  });
}
