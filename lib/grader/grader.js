var executor = require('./executor'),
  diffTool = require('./diff-tool'),
  runner = require('./runner'),
  formatter = require('sprintf-js').sprintf,
  db = require('../db/db-connector'),
  fs = require('fs'),
  utils = require('./utils');

exports.grade = function(data, done) {

  var solution = data.solution,
    problem = data.problem,
    solution = data.solution,
    output = data.output,
    event = data.event,
    expectedOutput = formatter(Config.sandbox.expectedOutputFormat,
        problem.testCases[data.runnerConfig.currentTestCase].output);

  //TODO: Test if the files exist.

  if (event.type === "COMPETENCIA") {
    diffTool.compareStrict(expectedOutput, output, finishedGrade, data, done);
  } else {
    diffTool.compareNonStrict(expectedOutput, output, finishedGrade, data, done);
  }
};

function finishedGrade(err, compareResult, data, done) {
  var problem = data.problem,
    result = data.result,
    solution = data.solution;

  if (err || !compareResult) {
    Logger.info('ID: %s - FINAL COMPARE RESULT: WRONG_ANSWER', CURRENT_JOB);
    data.runnerConfig.testCasesFinalStatus = 'WRONG_ANSWER';
  } else {
    Logger.info('ID: %s - FINAL COMPARE RESULT: SUCCESS', CURRENT_JOB);
    data.runnerConfig.testCaseGradeSum += problem.testCases[data.runnerConfig.currentTestCase].value;
  }

  if (data.runnerConfig.testCasesCount === (data.runnerConfig.currentTestCase + 1)) {
    result.time = data.runnerConfig.testCaseTimeSum;
    result.grade = data.runnerConfig.testCaseGradeSum;
    result.status = data.runnerConfig.testCasesFinalStatus;
    result.error = '';

    db.solutions.update({
      _id: solution._id
    }, {
      $set: result
    });

    if (solution.isProblemValidation && !err && compareResult) {
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
}