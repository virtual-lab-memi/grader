var db = require('./db/db-connector.js'),
  compiler = require('./grader/compiler.js'),
  runner = require('./grader/runner.js'),
  grader = require('./grader/grader.js'),
  kue = require('kue'),
  jobs = kue.createQueue();

kue.app.listen(9000);
kue.app.set('title', 'Train Me Grader');

exports.attachJob = function(problemId, solutionId, solutionFile) {
  var result;

  db.solutions.findOne({_id: solutionId}, function(err, doc) {
    if (err || !doc) {
      result = {
        error: err || 'solution not found',
        status: 'SERVER_ERROR'
      };
    }

    if (!result) {
      var solution = doc;
      db.problems.findOne({_id: problemId}, function(err, doc) {
        if (err || !doc) {
          result = {
            error: err || ('Problem not found: ' + problemId),
            status: 'SERVER_ERROR'
          };
        }

        if (!result) {
          var problem = doc;
          createGradeJob(problem, solution, solutionFile);
        } else {
          console.log('Problem not found');
          db.solutions.update({ _id: solutionId}, {$set: result});
        }
      });
    } else {
      console.warn('No solution found: ' + solutionId);
    }
  });
};

function createGradeJob(problem, solution, solutionFile) {
  var job = jobs.create('grade', {
    problem: problem,
    solution: solution,
    solutionFile: solutionFile
  });

  job.on('enqueue', function() {
    console.log('enqueued ' + job.id);
  });

  job.on('complete', function() {
    console.log('completed ' + job.id);
  });

  job.save();
}

jobs.process('grade', function(job, done) {
  graderProcessor(job.data, done);
});

function graderProcessor(data, done) {
  compiler.compile(data, done);
}
