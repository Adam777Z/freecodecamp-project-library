/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  
  var _id1;
  var _id2;
  
  // test('Asynchronous test #example', function(done){
  //   setTimeout(function(){
  //     assert.isOk('Async test !!');
  //     done();
  //   }, 500);
  // });

  /*
  * ----[EXAMPLE TEST]----
  * Each test should completely test the response of the API end-point including response status code!
  */
  test('#example Test GET /api/books', function(done) {
    chai.request(server)
      .get('/api/books')
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body, 'response should be an array');
        assert.property(res.body[0], '_id', 'Books in array should contain _id');
        assert.property(res.body[0], 'title', 'Books in array should contain title');
        assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
        done();
      });
  });
  /*
  * ----[END of EXAMPLE TEST]----
  */

  suite('Routing tests', function() {

    suite('POST /api/books with title => create book object/expect book object', function() {
      
      test('Test POST /api/books with title', function(done) {
        chai.request(server)
          .post('/api/books')
          .send({
            title: 'Title'
          })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.isObject(res.body, 'response should be an object');
            assert.property(res.body, '_id', 'Book should contain _id');
            assert.property(res.body, 'title', 'Book should contain title');
            // assert.property(res.body, 'commentcount', 'Book should contain commentcount');
            assert.notEqual(res.body._id, '');
            assert.equal(res.body.title, 'Title');
            // assert.equal(res.body.commentcount, 0);
            _id1 = res.body._id;
            
            done();
          });
      });
      
      test('Test POST /api/books with no title given', function(done) {
        chai.request(server)
          .post('/api/books')
          .send({
            title: ''
          })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.isObject(res.body, 'response should be an object');
            assert.property(res.body, '_id', 'Book should contain _id');
            assert.property(res.body, 'title', 'Book should contain title');
            // assert.property(res.body, 'commentcount', 'Book should contain commentcount');
            assert.notEqual(res.body._id, '');
            assert.equal(res.body.title, '');
            // assert.equal(res.body.commentcount, 0);
            _id2 = res.body._id;
            
            done();
          });
      });
      
    });


    suite('GET /api/books => array of books', function() {
      
      test('Test GET /api/books', function(done) {
        chai.request(server)
          .get('/api/books')
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body, 'response should be an array');
            assert.property(res.body[0], '_id', 'Books in array should contain _id');
            assert.property(res.body[0], 'title', 'Books in array should contain title');
            assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
            // _id1 = res.body[0]._id;
            
            done();
          });
      });      
      
    });


    suite('GET /api/books/[id] => book object with [id]', function() {
      
      test('Test GET /api/books/[id] with id not in db', function(done) {
        chai.request(server)
          .get('/api/books/5c178a8732a35b28b7783491')
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body, 'no book exists');
            
            done();
          });
      });
      
      test('Test GET /api/books/[id] with valid id in db', function(done) {
        chai.request(server)
          .get('/api/books/' + _id1)
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.isObject(res.body, 'response should be an object');
            assert.property(res.body, '_id', 'Books in array should contain _id');
            assert.property(res.body, 'title', 'Books in array should contain title');
            assert.property(res.body, 'comments', 'Book should contain comments');
            assert.isArray(res.body.comments, 'Comments should be an array');
            
            done();
          });
      });
      
    });


    suite('POST /api/books/[id] => add comment/expect book object with id', function() {
      
      test('Test POST /api/books/[id] with comment', function(done) {
        chai.request(server)
          .post('/api/books/' + _id1)
          .send({
            comment: 'Comment'
          })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.isObject(res.body, 'response should be an object');
            assert.property(res.body, '_id', 'Book should contain _id');
            assert.property(res.body, 'title', 'Book should contain title');
            assert.property(res.body, 'comments', 'Book should contain comments');
            assert.notEqual(res.body._id, '');
            assert.isArray(res.body.comments, 'Comments should be an array');
            assert.equal(res.body.comments[res.body.comments.length-1], 'Comment');
            // assert.include(res.body.comments, 'Comment', 'Comments should include test comment submitted');
            
            done();
          });
      });
      
    });

  });

});
