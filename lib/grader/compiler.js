var fs = require('fs'),
  db = require('../db/db-connector.js'),
  logger = require('../logger.js').Logger,
  executor = require('./executor.js'),
  runner = require('./runner.js'),
  utils = require('./utils.js'),
  spawn = require('child_process').spawn;

exports.compile = function(data, done) {
  var language = data.solution.language,
    solutionFile = data.solutionFile;

  switch (language) {
    case 'Java':
      logger.info('ID: %s - Starting compilation: %s', CURRENT_JOB, language);
      compileJava(data, solutionFile, done);
      break;
    default:
      logger.info('ID: %s - No option available for compilation: %S', CURRENT_JOB, language);
      db.solutions.update({_id: data.solution._id}, {$set: {
        error: 'No compiler available for ' + language,
        status: 'COMPILATION_ERROR'
      }});
      done && done();
  }
};

function compileJava(data, originalSourceFile, done) {
  var fileName = 'Main.java',
    sourceFile = executor.SANDBOX + '/' + fileName,
    command = 'javac';
  //TODO: test if the file exists first.
  fs.createReadStream(originalSourceFile).pipe(fs.createWriteStream(sourceFile));
  executor.execute(data, command, [fileName], compileFinished, done);
}

function compileFinished(data, code, done) {
  var solution = data.solution,
    problem = data.problem,
    errorLog;
  if (code === 0) {
    logger.info('ID: %s - Successful compilation', CURRENT_JOB);
    runner.run(data, executor.PROBLEMS_REPO, done);
  } else {
    logger.info('ID: %s - FINAL RESULT: Not succesful compilation', CURRENT_JOB);
    errorLog = fs.readFileSync(executor.ERROR_FILE, 'utf8');
    db.solutions.update({_id:solution._id}, {$set: {status: 'COMPILATION_ERROR', error: errorLog}});
    utils.setBestSolutionForInstance(solution, problem);
    utils.cleanUpSandbox(solution._id);
    done && done();
  }
}
