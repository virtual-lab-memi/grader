var sinon = require('sinon'),
  rewire = require('rewire'),
  jobManager = rewire('../../lib/job-manager.js');

describe('Attach job', function() {
  var dbMock = {
      problems: {
        findOne: function(query, callback) {
          if (query._id === 1) {
            callback(null, {name: 'asd'});
          } else {
            callback(null, null);
          }
        }
      },
      solutions: {
        findOne: function(query, callback) {
          if (query._id === 1) {
            callback(null, {name: 'asd'});
          } else {
            callback(null, null);
          }
        }
      }
    };
  jobManager.__set__('db', dbMock);

  it('should return fail if problem do not exist', function(done) {
    var result = jobManager.attachJob(0, 1, 'fixtures/solution.java');
    console.log(result);
    result.should.have.property('error', 'problem not found');
    result.should.have.property('status', 1);
    done();
  });

  it('should return fail if solution do not exist', function(done) {
    var result = jobManager.attachJob(1, 0, 'fixtures/solution.java');
    result.should.have.property('error', 'solution not found');
    result.should.have.property('status', 1);
    done();
  });
  it('should return ok if problem and solution exist', function(done) {
     var result = jobManager.attachJob(1, 1, 'fixtures/solution.java');
     result.should.have.property('message', 'ok');
     result.should.have.property('status', 0);
     done();
   });
});
