var	trainMeApp = require('../app.js').app,
	request = require('supertest')(trainMeApp);

describe('POST /api/solutions', function() {
  it('should return 400 on request without solution file', function(done) {
    request
			.post('/api/solutions')
      .expect(400)
      .end(function(err, res) {
        if (err) return done(err);
        done();
      });
  });
});
