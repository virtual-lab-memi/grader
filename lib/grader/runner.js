var executor = require('./executor.js'),
  logger = require('../logger.js').Logger,
  grader = require('./grader.js'),
  db = require('../db/db-connector.js'),
  utils = require('./utils.js'),
  fs = require('fs');

exports.run = function(data, input, done) {
  logger.info('ID: %s - Starting solution run...', CURRENT_JOB);
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
    logger.info('ID: %s - Successful run', CURRENT_JOB);
    grader.grade(data, done);
  } else {
    logger.info('ID: %s - FINAL RESULT: Not successful run', CURRENT_JOB);
    errorLog = fs.readFileSync(executor.ERROR_FILE, 'utf8');
    status = timeout ? 'TIMEOUT_ERROR' : 'RUNTIME_ERROR';
    db.solutions.update({_id:solution._id}, {$set: {status: status, error: errorLog}});
    utils.setBestSolutionForInstance(solution, problem);
    utils.cleanUpSandbox(solution._id);
    done && done();
  }
}
