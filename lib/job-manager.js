var db = require('./db/db-connector'),
  compiler = require('./grader/compiler'),
  runner = require('./grader/runner'),
  grader = require('./grader/grader'),
  kue = require('kue'),
  jobs = kue.createQueue();

kue.app.listen(9000);
kue.app.set('title', 'Train Me Grader');
Logger.info('Kue manager interface listening at http://localhost:9000');

global.CURRENT_JOB = 0;

exports.attachJob = function(problemId, solutionId, solutionFile, eventId) {
  var result;
  Logger.info('Attach new job: problem=%s, solution=%s', problemId, solutionId);
  db.solutions.findOne({_id: solutionId}, function(err, doc) {
    if (err || !doc) {
      result = {
        error: err || 'solution not found',
        status: 'SERVER_ERROR'
      };
      Logger.warning('No solution found: %s', solutionId);
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
        Logger.warning('No problem found: %s', problemId);
        db.solutions.update({ _id: solutionId}, {$set: result});
        return;
      }

      var problem = doc;
      db.events.findOne({_id: eventId}, function(err, doc) {
        if (err || !doc) {
          result = {
            error: err || ('Event not found: ' + problemId),
            status: 'SERVER_ERROR'
          };
          Logger.warning('No event found: %s', eventId);
          db.solutions.update({ _id: solutionId}, {$set: result});
          return;
        }

        var event = doc;
        createGradeJob(problem, solution, solutionFile, event);
      });
    });
  });
};

function createGradeJob(problem, solution, solutionFile, event) {
  var job = jobs.create('grade', {
    problem: problem,
    solution: solution,
    solutionFile: solutionFile,
    event: event
  });

  job.on('enqueue', function() {
    Logger.info('Job %s queued', job.id);
  });

  job.on('complete', function() {
    Logger.info('Job %s completed', job.id);
  });

  job.save();
  Logger.info('Job created');
}

jobs.process('grade', 1, function(job, done) {
  Logger.info('Job %s being processed...', job.id);
  CURRENT_JOB = job.id;
  graderProcessor(job.data, done);
});

function graderProcessor(data, done) {
  compiler.compile(data, done);
}
