var	trainMeApp = require('../server.js').app,
	request = require('supertest')(trainMeApp);

describe('POST /api/solutions', function() {
  it('should return 400 on request without solution file', function(done) {
    request
			.post('/api/solutions')
      .expect(400, {error:'No solution file', status: 1})
      .end(function(err, res) {
        if (err) return done(err);
        done();
      });
  });

  it('should return 400 on request without problem id', function(done) {
    request
      .post('/api/solutions')
      .attach('solution', 'test/fixtures/solution.java')
      .expect(400, {error:'No problem id', status: 1})
      .end(function(err, res) {
        if (err) return done(err);
        done();
      });
  });

  it('should return 400 on request without solution id', function(done) {
    request
			.post('/api/solutions')
      .field('problemId', 1)
      .attach('solution', 'test/fixtures/solution.java')
      .expect(400, {error: 'No solution id', status: 1})
      .end(function(err, res) {
        if (err) return done(err);
        done();
      });
  });

  it('should return 200 on request completed', function(done) {
    request
			.post('/api/solutions')
			.field('problemId', 1)
			.field('solutionId', 1)
			.attach('solution', 'test/fixtures/solution.java')
      .expect(200, {message: 'Solution submitted', status: 0})
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        done();
      });
  });
});
