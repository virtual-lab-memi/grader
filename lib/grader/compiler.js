var fs = require('fs'),
  db = require('../db/db-connector.js'),
  executor = require('./executor.js'),
  runner = require('./runner.js'),
  utils = require('./utils.js'),
  spawn = require('child_process').spawn;

exports.compile = function(data, done) {
  var language = data.solution.language,
    solutionFile = data.solutionFile;

  switch (language) {
    case 'Java':
      compileJava(data, solutionFile, done);
      break;
    default:
      console.log('No option available');
      db.solutions.update({_id: data.solution._id}, {$set: {
        error: 'No option for ' + language,
        status: 'COMPILATION_ERROR'
      }});
      done && done();
  }
};

function compileJava(data, originalSourceFile, done) {
  var fileName = 'Main.java',
    sourceFile = executor.SANDBOX + '/' + fileName,
    command = 'javac';

  fs.createReadStream(originalSourceFile).pipe(fs.createWriteStream(sourceFile));
  executor.execute(data, command, [fileName], compileFinished, done);
}

function compileFinished(data, code, done) {
  var solution = data.solution,
    errorLog;
  if (code === 0) {
    console.log('Succesful compile');
    runner.run(data, executor.PROBLEMS_REPO, done);
  } else {
    console.log('Not succesful compile');
    errorLog = fs.readFileSync(executor.ERROR_FILE, 'utf8');
    db.solutions.update({_id:solution._id}, {$set: {status: 'COMPILATION_ERROR', error: errorLog}});
    utils.cleanUpSandbox();
    done && done();
  }
}
