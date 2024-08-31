/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

let mongodb = require('mongodb');
let mongoose = require('mongoose');

module.exports = function (app) {

  mongoose.connect(process.env.MONGO_URI)

  let bookSchema = new mongoose.Schema({
    title: {type: String, require: true},
    comments: [String],
  })

  let book = mongoose.model('Book', bookSchema);

  app.route('/api/books')
    .get(function (req, res){
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]

      let arrayOfBooks = [];

      book.find({})
      .then(results  => {
        results.forEach(result => {
          let data = result.toJSON();
          data['commentcount'] = result.comments.length;
          arrayOfBooks.push(data);
        })
        return res.json(arrayOfBooks);
      })
    })
    
    .post(function (req, res){
      let title = req.body.title;

      if(!title)
        return res.json('missing required field title');
      
      let newBook = new book({
        title: title,
        comments: [],
      })

      newBook.save()
      .then(data => {
        res.json({title: data.title, _id: data.id});
      }) 
      //response will contain new book object including atleast _id and title
    })
    
    .delete(function(req, res){
      //if successful response will be 'complete delete successful'
      book.deleteMany()
      .then(result => {
        return res.json('complete delete successful');
      })
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      let bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}

      book.findById(bookid)
      .then(result => {
        if(!result) {
          return res.json('no book exists');
        }

        return res.json(result);
      })
    })
    
    .post(function(req, res){
      let bookid = req.params.id;
      let comment = req.body.comment;

      if(!comment)
        return res.json('missing required field comment');

      book.findByIdAndUpdate(
        bookid,
        {$push: {comments: comment}},
        {new: true}
      )
      .then(updatedObj => {
        if(!updatedObj) {
          return res.json('no book exists');
        }

        return res.json(updatedObj);
      })
      //json res format same as .get
    })
    
    .delete(function(req, res){
      let bookid = req.params.id;
      //if successful response will be 'delete successful'

      book.findByIdAndDelete(bookid)
      .then(result => {
        if(!result) {
          return res.json('no book exists')
        }

        return res.json('delete successful')
      })
    });
  
};
