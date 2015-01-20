var executor = require('./executor.js'),
  grader = require('./grader.js'),
  db = require('../db/db-connector.js'),
  utils = require('./utils.js'),
  fs = require('fs');

exports.run = function(data, input, done) {
  var problem = data.problem;
  data.input = input + '/problemFiles-' + problem.inputTest + '-input';
  executor.execute(data, 'java', ['Main'], runFinished, done, {timeout: problem.time});
}

function runFinished(data, code, done, timeout) {
  var solution = data.solution,
    errorLog,
    status;

  if (code === 0) {
    console.log('Successful run');
    grader.grade(data, done);
    done && done();
  } else {
    console.log('Not successful run');
    console.log(data.result);
    errorLog = fs.readFileSync(executor.ERROR_FILE, 'utf8');
    status = timeout ? 'TIMEOUT_ERROR' : 'RUNTIME_ERROR';
    db.solutions.update({_id:solution._id}, {$set: {status: status, error: errorLog}});
    utils.cleanUpSandbox();
    done && done();
  }
}
