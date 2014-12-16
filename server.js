var multer = require('multer'),
	bodyParser = require('body-parser'),
	express = require('express'),
  jobManager = require('./lib/job-manager.js'),
	app = express(),
	server;

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }));
app.use(multer({ dest: './uploads/'}));

app.post('/api/solutions', function(req, res) {
  var files = req.files,
    data = req.body,
    invalidInputs = validateInputs(files, data);

  if (invalidInputs) {
    res.status(400).send({error: invalidInputs, status: 1});
    return;
  }
  console.log("asdasdadaaa");
  jobManager.attachJob(data.problemId, data.solutionId, files.solution.path);

  res.status(200).send({message: 'Solution submitted', status: 0});
});

server = app.listen(8888, function() {
  var	host = server.address().address,
		port = server.address().port;
  console.log('Train Me Grader listening at http://%s:%s', host, port)
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
}
