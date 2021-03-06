var executor = require('./executor'),
  statsParser = require('./stats-parser'),
  grader = require('./grader'),
  db = require('../db/db-connector'),
  utils = require('./utils'),
  formatter = require('sprintf-js').sprintf,
  fs = require('fs');

exports.run = function(data, done) {
  var language = data.execution.language,
      task = data.execution;

  //TODO: Test if the file exists
  //TODO: Improve name of the problem file getting from problemFiles collection.
  data.inputName = 'input';
  data.output = executor.OUTPUT;

  if (!data.runnerConfig) {
    data.runnerConfig = {
      partialRuns: Config.sandbox.partialRunCount,
      finishedRuns: 0,
      timeSumResult: 0,
      testCasesCount: data.task.testCases.length,
      currentTestCase: 0,
      testCaseTimeSum: 0,
      testCaseGradeSum: 0,
      testCaseMemorySum: 0,
      testCasesFinalStatus: 'SUCCESS'
    };
  }

  Logger.info('ID: %s - Starting running: %s', CURRENT_JOB, language);

  switch (language) {
    case 'C++':
      var envVars = formatter(Config.sandbox.envVars, data.inputName, 512000, 3);
      fs.writeFile(executor.SANDBOX + '/env-vars', envVars);
      fs.createReadStream(executor.PROBLEMS_REPO + data.task.testCases[data.runnerConfig.currentTestCase].inputPath)
        .pipe(fs.createWriteStream(executor.SANDBOX + '/' + data.inputName, task.input));
      var command = 'docker';
      var args = ['start', '--attach=true', 'official-sandbox'];
      executor.execute(data, command, args, runFinished, done);
      break;
    default:
      Logger.info('ID: %s - No option available for runtime: %s', CURRENT_JOB, language);
      db.taskExecutions.update({_id: task._id}, {$set: {status: 1, error: 'No executable option for ' + language}});
      done && done();
  }
};

function runFinished(data, code, done, timeout) {
  data.result = statsParser.parse(executor.SANDBOX + 'run-stats');
  var execution = data.execution;
  console.log(data.result);
  if (code === 0 && !data.result.status) {
    Logger.info('ID: %s - Successful run', CURRENT_JOB);
    data.runnerConfig.testCaseTimeSum += data.result.time;
    data.runnerConfig.testCaseMemorySum += data.result.memory;
    grader.grade(data, done);
    done && done();
  } else {
    Logger.info('ID: %s - FINAL RESULT: Not successful run', CURRENT_JOB);
    var errorLog = fs.readFileSync(executor.ERROR_FILE, 'utf8');
    data.result.error = errorLog;
    db.taskExecutions.update({_id: execution._id}, {$set: data.result});
    done && done();
  }
}
