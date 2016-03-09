var executor = require('./executor'),
  diffTool = require('./diff-tool'),
  runner = require('./runner'),
  formatter = require('sprintf-js').sprintf,
  db = require('../db/db-connector'),
  fs = require('fs'),
  utils = require('./utils');

exports.grade = function(data, done) {

  var task = data.task,
    output = data.output,
    expectedOutput = executor.PROBLEMS_REPO +
        task.testCases[data.runnerConfig.currentTestCase].outputPath;

  diffTool.compareStrict(expectedOutput, output, finishedGrade, data, done);
};

function finishedGrade(err, compareResult, data, done) {
  var task = data.task,
    result = data.result,
    execution = data.execution;

  if (err || !compareResult) {
    Logger.info('ID: %s - FINAL COMPARE RESULT: WRONG_ANSWER', CURRENT_JOB);
    data.runnerConfig.testCasesFinalStatus = 'WRONG_ANSWER';
  } else {
    Logger.info('ID: %s - FINAL COMPARE RESULT: SUCCESS', CURRENT_JOB);
    data.runnerConfig.testCaseGradeSum += task.testCases[data.runnerConfig.currentTestCase].value;
  }

  if (data.runnerConfig.testCasesCount === (data.runnerConfig.currentTestCase + 1)) {
    result.time = data.runnerConfig.testCaseTimeSum;
    result.memory = data.runnerConfig.testCaseMemorySum;
    result.grade = data.runnerConfig.testCaseGradeSum;
    result.status = data.runnerConfig.testCasesFinalStatus;
    result.error = '';

    db.taskExecutions.update({
      _id: execution._id
    }, {
      $set: result
    });

    //utils.setBestSolutionForInstance(solution, problem);
    //utils.cleanUpSandbox(solution._id);
    done && done();
  } else {
    data.runnerConfig.currentTestCase++;
    runner.run(data, done);
  }
}