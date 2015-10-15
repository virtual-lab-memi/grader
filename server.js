var  env = process.env.NODE_ENV || 'development',
  config = require('./config/config.' + env),
  logger = require('./logger'),
  utils = require('./lib/grader/utils'),
  multer = require('multer'),
	bodyParser = require('body-parser'),
	express = require('express'),
	app = express(),
	server;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(multer({ dest: './uploads/'}));

// Virtual lab

app.post('/api/compile', function(req, res) {
  var data = req.body,
    invalidInputs = validateInputs(data),
    jobManager = require('./lib/job-manager.js');

  if (invalidInputs) {
    res.status(400).send({error: invalidInputs, status: 1});
    return;
  }

  jobManager.attachJob(data.taskExecution);

  res.status(200).send({message: 'Task submitted successfully.'});
});

server = app.listen(8888, function() {
  var	host = server.address().address,
		port = server.address().port;
  Logger.info('Train Me Grader listening at http://%s:%s', host, port)
});

exports.app = app;

function validateInputs(data) {
  if (!data.taskExecution) {
    return 'No task execution id';
  }
}
