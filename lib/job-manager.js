var db = require('./db/db-connector.js'),
  logger = require('./logger.js').Logger,
  compiler = require('./grader/compiler.js'),
  runner = require('./grader/runner.js'),
  grader = require('./grader/grader.js'),
  kue = require('kue'),
  jobs = kue.createQueue();

kue.app.listen(9000);
kue.app.set('title', 'Train Me Grader');

exports.attachJob = function(problemId, solutionId, solutionFile) {
  var result;
  logger.info('Attach new job: problem=%s, solution=%s', problemId, solutionId);
  db.solutions.findOne({_id: solutionId}, function(err, doc) {
    if (err || !doc) {
      result = {
        error: err || 'solution not found',
        status: 'SERVER_ERROR'
      };
      logger.warning('No solution found: %s', solutionId);
      db.solutions.update({ _id: solutionId}, {$set: result});
      return;
    }

    var solution = doc;
    db.problems.findOne({_id: problemId}, function(err, doc) {
      if (err || !doc) {
        result = {
          error: err || ('Problem not found: ' + problemId),
          status: 'SERVER_ERROR'
        };
        logger.warning('No problem found: %s', problemId);
        db.solutions.update({ _id: solutionId}, {$set: result});
        return;
      }

      var problem = doc;
      createGradeJob(problem, solution, solutionFile);
    });
  });
};

function createGradeJob(problem, solution, solutionFile) {
  var job = jobs.create('grade', {
    problem: problem,
    solution: solution,
    solutionFile: solutionFile
  });

  job.on('enqueue', function() {
    logger.info('Job %s queued', job.id);
  });

  job.on('complete', function() {
    logger.info('Job %s completed', job.id);
  });

  job.save();
  logger.info('Job created');
}

jobs.process('grade', function(job, done) {
  logger.info('Job %s being processed...', job.id);
  graderProcessor(job.data, done);
});

function graderProcessor(data, done) {
  compiler.compile(data, done);
}
