var executor = require('./executor'),
  grader = require('./grader'),
  db = require('../db/db-connector'),
  utils = require('./utils'),
  fs = require('fs');

exports.run = function(data, input, done) {
  Logger.info('ID: %s - Starting solution run...', CURRENT_JOB);
  var problem = data.problem;
  //TODO: Test if the file exists
  //TODO: Improve name of the problem file getting from problemFiles collection.
  data.input = input + '/problemFiles-' + problem.inputTest + '-input';
  executor.execute(data, 'java', ['Main'], runFinished, done, {timeout: problem.timeConstraint});
}

function runFinished(data, code, done, timeout) {
  var solution = data.solution,
    problem = data.problem,
    errorLog,
    status;

  if (code === 0) {
    Logger.info('ID: %s - Successful run', CURRENT_JOB);
    grader.grade(data, done);
    done && done();
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
