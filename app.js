var express = require('express'),
	app = exports.app = express(),
	server;

app.post('/api/solutions', function(req, res) {
  res.status(400).send('Bad Request');
});

server = app.listen(8888, function() {
  var	host = server.address().address,
		port = server.address().port;
  console.log('Train Me Grader listening at http://%s:%s', host, port)
});
