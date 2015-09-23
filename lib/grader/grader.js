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

  if (event) {
    diffTool.compareStrict(expectedOutput, output, event.type, finishedGrade, data, done);
  } else {
    diffTool.compareStrict(expectedOutput, output, 'PROBLEM_VALIDATION', finishedGrade, data, done);
  }
};

function finishedGrade(err, compareResult, type, data, done) {
  var problem = data.problem,
    result = data.result,
    solution = data.solution;

  if (err || !compareResult) {
    Logger.info('ID: %s - FINAL COMPARE RESULT: WRONG_ANSWER', CURRENT_JOB);
    data.runnerConfig.testCasesFinalStatus = 'WRONG_ANSWER';

    if (type === 'ENTRENAMIENTO') {
      console.log('MODO ENTRENAMIENTO');
      var output = data.output,
        expectedOutput = formatter(Config.sandbox.expectedOutputFormat,
                            problem.testCases[data.runnerConfig.currentTestCase].output);
      diffTool.compareNonStrict(expectedOutput, output, 'ENTRENAMIENTO_2', finishedGrade, data, done);
    }

  } else {
    Logger.info('ID: %s - FINAL COMPARE RESULT: SUCCESS', CURRENT_JOB);
    data.runnerConfig.testCaseGradeSum += problem.testCases[data.runnerConfig.currentTestCase].value;

    if (type === 'ENTRENAMIENTO_2') {
      console.log('PASSS MODO ENTRENAMIENTO');

      data.runnerConfig.testCasesFinalStatus = 'PRESENTATION_ERROR';
    }
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