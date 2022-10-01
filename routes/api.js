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
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": number_of_comments },...]

      MongoClient.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true }, function(err, db) {
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
        return res.send('missing required field title');
      }

      MongoClient.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true }, function(err, db) {
        if (err) {
          // console.log('Database error: ' + err);
          return res.json({ error: 'error' });
        } else {
          let obj = {
            title: title,
            comments: []
          };

          db.db().collection('books').insertOne(
            obj,
            function(err, doc) {
              delete obj['comments'];
              return res.json(obj);
            }
          );
        }
      });
    })
    .delete(function(req, res) {
      //if successful response will be 'complete delete successful'
      MongoClient.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true }, function(err, db) {
        if (err) {
          // console.log('Database error: ' + err);
          return res.json({ error: 'error' });
        } else {
          db.db().collection('books').deleteMany(
            {},
            function(error, result) {
              if (result.acknowledged && result.deletedCount > 0) {
                return res.send('complete delete successful');
              } else {
                return res.send('complete delete unsuccessful');
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
        return res.send('missing required field bookid');
      }

      if (!ObjectId.isValid(bookid)) {
        return res.send('invalid bookid');
      }

      MongoClient.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true }, function(err, db) {
        if (err) {
          // console.log('Database error: ' + err);
          return res.json({ error: 'error' });
        } else {
          db.db().collection('books').findOne(
            {
              _id: new ObjectId(bookid)
            },
            function(error, result) {
              if (result === null) {
                return res.send('no book exists');
              } else {
                return res.json(result);
              }
            }
          );
        }
      });
    })
    .post(function(req, res) {
      var bookid = req.params.id;
      var comment = req.body.comment;
      //json res format same as .get

      if (bookid === undefined || bookid === '') {
        return res.send('missing required field bookid');
      }

      if (comment === undefined || comment === '') {
        return res.send('missing required field comment');
      }

      MongoClient.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true }, function(err, db) {
        if (err) {
          // console.log('Database error: ' + err);
          return res.json({ error: 'error' });
        } else {
          db.db().collection('books').findOneAndUpdate(
            {
              _id: new ObjectId(bookid)
            },
            {
              $push: {
                comments: comment
              }
            },
            { returnDocument: 'after' }, // Return the updated document
            function(error, result) {
              if (result.value === null) {
                return res.send('no book exists');
              } else {
                return res.json(result.value);
              }
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

      MongoClient.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true }, function(err, db) {
        if (err) {
          // console.log('Database error: ' + err);
          return res.json({ error: 'error' });
        } else {
          db.db().collection('books').findOneAndDelete(
            {
              _id: new ObjectId(bookid)
            },
            function(error, result) {
              if (result.value === null) {
                return res.send('no book exists');
              } else {
                if (result.ok === 1) {
                  return res.send('delete successful');
                } else {
                  return res.send('delete unsuccessful');
                }
              }
            }
          );
        }
      });
    });

};
