var db = require('./db/db-connector'),
  compiler = require('./grader/compiler'),
  runner = require('./grader/runner'),
  grader = require('./grader/grader'),
  utils = require('./grader/utils'),
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
  var defaultResult = {
    output: "Task execution, task, files or project not found",
    status: 1
  };

  db.taskExecutions.findOne({_id: taskExecutionID}, function(err, execution) {

    if (err || !execution) {
      Logger.warning('No task execution found: %s', taskExecutionID);
      db.taskExecutions.update({ _id: taskExecutionID}, {$set: defaultResult});
      return;
    }

    db.tasks.findOne({_id: execution.task}, function(err, task) {
      if (err || !task) {
        Logger.warning('No task found');
        db.taskExecutions.update({ _id: taskExecutionID}, {$set: defaultResult});
        return;
      }

      db.projects.findOne({_id: execution.project}, function(err, project) {
        if (err || !project) {
          Logger.warning('No project found');
          db.taskExecutions.update({ _id: taskExecutionID}, {$set: defaultResult});
          return;
        }

        db.files.find({'_id': {'$in': project.files}}, function(err, files) {
          if (err || !files) {
            Logger.warning('No files found');
            db.taskExecutions.update({ _id: taskExecutionID}, {$set: defaultResult});
            return;
          }

          utils.generateFilesForRun(files);
          utils.generateFilesForGrade(execution, task, project, files, isRunTask)
            .spread(createGradeJob)
            .done();
        });
      });
    });
  });
}

function createGradeJob(execution, task, project, files, isRunTask) {
  var job = jobs.create('grade', {
    task: task,
    execution: execution,
    project: project,
    files: files,
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
