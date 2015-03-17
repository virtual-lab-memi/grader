var executor = require('./executor'),
  grader = require('./grader'),
  db = require('../db/db-connector'),
  utils = require('./utils'),
  fs = require('fs');

exports.run = function(data, done) {
  var language = data.solution.language,
    problem = data.problem;

  if (!data.runnerConfig) {
    data.runnerConfig = {
      partialRuns: Config.sandbox.partialRunCount,
      finishedRuns: 0,
      timeSumResult: 0,
      testCasesCount: problem.testCases.length,
      currentTestCase: 0,
      testCaseTimeSum: 0,
      testCaseGradeSum: 0,
      testCasesFinalStatus: 'SUCCESS'
    };
  }

  //TODO: Test if the file exists
  //TODO: Improve name of the problem file getting from problemFiles collection.
  data.input = executor.PROBLEMS_REPO + '/problemFiles-'
    + problem.testCases[data.runnerConfig.currentTestCase].input + '-input';

  Logger.info('ID: %s - Starting running: %s, test case: %s', CURRENT_JOB, language, data.runnerConfig.currentTestCase);
  switch (language) {
    case 'Java':
      data.runnerConfig.command = 'java';
      data.runnerConfig.args = ['Main'];
      executor.execute(data, 'java', ['Main'], runFinished, done, {timeout: problem.timeConstraint});
      break;
    case 'C++':
      data.runnerConfig.command = './compiled';
      data.runnerConfig.args = [];
      executor.execute(data, './compiled', [], runFinished, done, {timeout: problem.timeConstraint});
      break;
    default:
      Logger.info('ID: %s - No option available for runtime: %S', CURRENT_JOB, language);
      db.solutions.update({_id: data.solution._id}, {$set: {
        error: 'No executable option for ' + language,
        status: 'RUNTIME_ERROR'
      }});
      done && done();
  }
}

function runFinished(data, code, done, timeout) {
  var solution = data.solution,
    problem = data.problem,
    errorLog,
    status;

  if (code === 0) {
    Logger.info('ID: %s - Successful run', CURRENT_JOB);
    data.runnerConfig.finishedRuns++;
    if (data.runnerConfig.partialRuns === data.runnerConfig.finishedRuns) {
      Logger.debug('ID: %s - Time: %s for run: %s', CURRENT_JOB, data.result.time, data.runnerConfig.finishedRuns);
      Logger.debug('ID: %s - Number of finished runs: %s', CURRENT_JOB, data.runnerConfig.finishedRuns);
      data.runnerConfig.timeSumResult += data.result.time;
      data.runnerConfig.testCaseTimeSum += data.runnerConfig.timeSumResult / data.runnerConfig.partialRuns;
      Logger.debug('ID: %s - Final time for solutions: %s', CURRENT_JOB, data.runnerConfig.testCaseTimeSum);
      data.runnerConfig.timeSumResult = 0;
      data.runnerConfig.finishedRuns = 0;
      grader.grade(data, done);
    } else {
      Logger.debug('ID: %s - Time: %s for run: %s', CURRENT_JOB, data.result.time, data.runnerConfig.finishedRuns);
      data.runnerConfig.timeSumResult += data.result.time;
      data.result.time = 0;
      executor.execute(data, data.runnerConfig.command, data.runnerConfig.args, runFinished, done, {timeout: problem.timeConstraint});
    }
  } else {
    Logger.info('ID: %s - FINAL RESULT: Not successful run', CURRENT_JOB);
    errorLog = fs.readFileSync(executor.ERROR_FILE, 'utf8');
    status = timeout ? 'TIMEOUT_ERROR' : 'RUNTIME_ERROR';
    db.solutions.update({_id:solution._id}, {$set: {status: status, error: errorLog}});
    utils.setBestSolutionForInstance(solution, problem);
    utils.cleanUpSandbox(solution._id);
    done && done();
  }
}
