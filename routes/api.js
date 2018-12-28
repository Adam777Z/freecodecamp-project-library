/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;

module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res) {
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      
      MongoClient.connect(process.env.DATABASE, { useNewUrlParser: true }, function(err, db) {
        if (err) {
          // console.log('Database error: ' + err);
          return res.json({ error: 'error' });
        } else {
          db.db().collection('books').find({}).toArray(function(err, docs) {
            for (let i = 0; i < docs.length; i++) {
              docs[i]['commentcount'] = docs[i]['comments'].length;
              delete docs[i]['comments'];
            }
            
            return res.json(docs);
          });
        }
      });
    })
    .post(function (req, res) {
      var title = req.body.title;
      //response will contain new book object including at least _id and title
      
      if (title === undefined || title === '') {
        return res.json({ error: 'Book Title is required' });
      }
      
      MongoClient.connect(process.env.DATABASE, { useNewUrlParser: true }, function(err, db) {
        if (err) {
          // console.log('Database error: ' + err);
          return res.json({ error: 'error' });
        } else {
          db.db().collection('books').insertOne(
            {
              title: title,
              comments: []
            }, function(err, doc) {
              delete doc['ops'][0]['comments'];
              return res.json(doc['ops'][0]);
            }
          );
        }
      });
    })
    .delete(function(req, res) {
      //if successful response will be 'complete delete successful'
      MongoClient.connect(process.env.DATABASE, { useNewUrlParser: true }, function(err, db) {
        if (err) {
          // console.log('Database error: ' + err);
          return res.json({ error: 'error' });
        } else {
          db.db().collection('books').deleteMany({}, function(error, result) {
              if (result.result.ok === 1 && result.result.n > 0) {
                return res.json('complete delete successful');
              } else {
                return res.json('complete delete unsuccessful');
              }
            }
          );
        }
      });
    });

  app.route('/api/books/:id')
    .get(function (req, res) {
      var bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      
      if (bookid === undefined || bookid === '') {
        return res.json({ error: 'Book ID is required' });
      }
      
      if (!ObjectId.isValid(bookid)) {
        return res.json({ error: 'valid id is required' });
      }
      
      MongoClient.connect(process.env.DATABASE, { useNewUrlParser: true }, function(err, db) {
        if (err) {
          // console.log('Database error: ' + err);
          return res.json({ error: 'error' });
        } else {
          db.db().collection('books').findOne({ _id: new ObjectId(bookid) }, function(error, result) {
            if (result === null) {
              return res.json('no book exists');
            } else {
              return res.json(result);
            }
          });
        }
      });
    })
    .post(function(req, res) {
      var bookid = req.params.id;
      var comment = req.body.comment;
      //json res format same as .get
      
      if (bookid === undefined || bookid === '') {
        return res.json({ error: 'Book ID is required' });
      }
      
      if (comment === undefined || comment === '') {
        return res.json({ error: 'Comment is required' });
      }
      
      MongoClient.connect(process.env.DATABASE, { useNewUrlParser: true }, function(err, db) {
        if (err) {
          // console.log('Database error: ' + err);
          return res.json({ error: 'error' });
        } else {
          db.db().collection('books').findOneAndUpdate(
            {
              _id: new ObjectId(bookid)
            },
            { $push: {
                comments: comment
              }
            },
            { returnOriginal: false }, // Return updated object after modify
            function(error, result) {
              return res.json(result.value);
            }
          );
        }
      });
    })
    .delete(function(req, res) {
      var bookid = req.params.id;
      //if successful response will be 'delete successful'
      
      if (bookid === undefined || bookid === '') {
        return res.json({ error: 'id is required' });
      }
      
      MongoClient.connect(process.env.DATABASE, { useNewUrlParser: true }, function(err, db) {
        if (err) {
          // console.log('Database error: ' + err);
          return res.json({ error: 'error' });
        } else {
          db.db().collection('books').findOneAndDelete(
            {
              _id: new ObjectId(bookid)
            },
            function(error, result) {
              if (result.ok === 1 && result.value !== null) {
                return res.json('delete successful');
              } else {
                return res.json('delete unsuccessful');
              }
            }
          );
        }
      });
    });
  
};
