var path = require('path'),
  TEST_DIR = path.dirname(__dirname),
  rewire = require('rewire'),
  fs = require('fs'),
  grader = rewire('../../lib/grader/grader.js'),
  executor = require('../../lib/grader/executor.js');

describe('Grader', function() {
  var output = TEST_DIR + '/fixtures/1.out',
    targetOutput = executor.PROBLEMS_REPO + '/1.out',
    expectedOutput = TEST_DIR + '/fixtures/wrong-expected.out',
    targetExpectedOutput = executor.SANDBOX + '/output';

  it('should save wrong answer if run is not equal files', function(done) {
    var mockDb, data;
    fs.writeFileSync(targetOutput, fs.readFileSync(output));
    fs.writeFileSync(targetExpectedOutput, fs.readFileSync(expectedOutput));

    mockDb = {
      solutions: {
        update: function(query, data) {
          query.should.have.property('_id', 1);
          trueData = data.$set;
          trueData.error.should.be.empty;
          trueData.should.have.property('status', 'WRONG_ANSWER');
          trueData.should.have.property('grade', 0);
          trueData.should.have.property('time', 100);
          trueData.should.have.property('memory', 300);
          console.log('-------------');
        }
      }
    };
    grader.__set__('db', mockDb);

    data = {
      solution: {
        _id: 1
      },
      problem: {
        _id: 1
      },
      result: {
        time: 100,
        memory: 300
      }
    };

    grader.grade(data, done);
  });
  it('should save success answer if is equal files', function(done) {
    var mockDb, data;
    fs.writeFileSync(targetExpectedOutput, fs.readFileSync(output));

    mockDb = {
      solutions: {
        update: function(query, data) {
          query.should.have.property('_id', 1);
          trueData = data.$set;
          trueData.error.should.be.empty;
          trueData.should.have.property('status', 'SUCCESS');
          trueData.should.have.property('grade', 100);
          trueData.should.have.property('time', 100);
          trueData.should.have.property('memory', 300);
          console.log('-------------');
        }
      }
    };
    grader.__set__('db', mockDb);

    data = {
      solution: {
        _id: 1
      },
      problem: {
        _id: 1
      },
      result: {
        time: 100,
        memory: 300
      }
    };

    grader.grade(data, done);

  });

  after(function() {
    fs.unlinkSync(targetOutput);
    if (fs.existsSync(targetExpectedOutput)) {
      fs.unlinkSync(targetExpectedOutput);
    }
  });
});
