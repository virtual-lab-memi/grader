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
        },
        update: function(query, data) {
          query.should.have.property('_id', 1);
          trueData = data.$set;
          trueData.should.have.property('error', 'Problem not found: 0');
          trueData.should.have.property('status', 'SERVER_ERROR');
        }
      }
    },
    jobsMock = {
      create: function() {}
    },
    revertDB = jobManager.__set__('db', dbMock),
    revertJobs = jobManager.__set__('jobs', jobsMock);

  it('should update solution if problem do not exist', function() {
    var dbMockSpy = sinon.mock(dbMock.solutions);
    dbMockSpy.expects('update').once();
    jobManager.attachJob(0, 1, 'fixtures/solution.java');
    dbMockSpy.verify();
    dbMockSpy.restore();
  });

  it('should create job if solution and problem exist', function() {
    var stub = sinon.stub(jobsMock, 'create');
    stub.returns({on: function() {}, save: function() {}});
    jobManager.attachJob(1, 1, 'fixtures/solution.java');
    stub.called.should.be.true;
    stub.restore();
  });

  it('should not call attach job if solution do not exist', function() {
    var jobMockSpy = sinon.mock(jobsMock);
    jobMockSpy.expects('create').never();
    jobManager.attachJob(1, 0, 'fixtures/solution.java');
    jobMockSpy.verify();
    jobMockSpy.restore();
  });
});
