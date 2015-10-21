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

module.exports = {
    attachJob: attachJob
};

function attachJob(taskExecutionID, isRunTask) {
  Logger.info('Attach new job: taskExecutionId=%s', taskExecutionID);
  db.taskExecutions.findOne({_id: taskExecutionID}, function(err, task) {

    if (err || !task) {
      Logger.warning('No task execution found: %s', taskExecutionID);
      return;
    }

    db.documents.findOne({_id: task.sourceCode}, function(err, document) {
      if (err || !document) {
        Logger.warning('No document found: %s', documentId);

        var result = {
          output: "Document not found",
          status: 1
        };

        db.taskExecutions.update({ _id: taskExecutionID}, {$set: result});
      }

      createGradeJob(task, document, isRunTask);
    });
  });
}

function createGradeJob(task, doc, isRunTask) {
  var job = jobs.create('grade', {
    task: task,
    doc: doc,
    run: isRunTask
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
