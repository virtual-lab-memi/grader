var multer = require('multer'),
	bodyParser = require('body-parser'),
	express = require('express'),
	app = exports.app = express(),
	server;

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }));
app.use(multer({ dest: './uploads/'}));
app.post('/api/solutions', function(req, res) {
  var files = req.files,
    data = req.body;
  if (!files.solution) {
    res.status(400).send({error: 'No solution file'});
    return;
  }

  if (!data.problemId) {
    res.status(400).send({error: 'No problem id'});
    return;
  }

  if (!data.solutionId) {
    res.status(400).send({error: 'No solution id'});
    return;
  }

  res.status(200).send({message: 'Solution submitted'});
});

server = app.listen(8888, function() {
  var	host = server.address().address,
		port = server.address().port;
  console.log('Train Me Grader listening at http://%s:%s', host, port)
});
