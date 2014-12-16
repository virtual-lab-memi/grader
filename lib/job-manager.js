var db = require('./db/db-connector.js'),
  kue = require('kue'),
  sleep = require('sleep'),
  jobs = kue.createQueue();

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
          console.log('Creating job');
          createGradeJob(problem, solution, solutionFile);
          var problem = doc;
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

  job.on('complete', function() {
    console.log('Job', job.id, 'with name', job.data.solution._id, 'is    done');
  });

  job.on('failed', function() {
    console.log('Job', job.id, 'with name', job.data.solution._id, 'has  failed');
  });

  job.save();
}

jobs.process('grade', function(job, done) {
  console.log(job.data);
  sleep.sleep(10);
  done && done();
});
