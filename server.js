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

app.post('/api/solutions', function(req, res) {
  var files = req.files,
    data = req.body,
    invalidInputs = validateInputs(files, data),
    jobManager = require('./lib/job-manager.js');

  if (invalidInputs) {
    res.status(400).send({error: invalidInputs, status: 1});
    return;
  }

  jobManager.attachJob(data.problemId, data.solutionId, files.solution.path, data.eventId);

  res.status(200).send({message: 'Solution submitted', status: 0});
});

app.get('/api/outputs', function(req, res) {
  var data = utils.getDiffLines(req.body);
  res.json(data);
});

server = app.listen(8888, function() {
  var	host = server.address().address,
		port = server.address().port;
  Logger.info('Train Me Grader listening at http://%s:%s', host, port)
});

exports.app = app;

function validateInputs(files, data) {
  if (!files.solution) {
    return 'No solution file';
  }

  if (!data.problemId) {
    return 'No problem id';
  }

  if (!data.solutionId) {
    return 'No solution id';
  }

  if (!data.eventId) {
    return 'No event id';
  }
}