var express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const Book = require('./models/index').Book;
const Chapter = require('./models/index').Chapter;
const Author = require('./models/index').Author;
const _ = require('lodash');
const Promise = require ('bluebird');
const session = require('express-session');

var app = express();

module.exports = app;

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());


// you were routing express.static correctly ... but you were routing to public/static when you had no static folder in public. I created this static folder and moved index.html into it. I believe the checkpoint should have come with this file structure? did you change this?
app.use('/files', express.static(path.join(__dirname, 'public/static')));


app.use(session({
	secret: 'my express secret',
	// resave: false,
	// saveUninitialized: false
	views: 0,
}));

// WHY ARE THESE SUBROUTES NOT IN A SEPARATE FILE ?
// something like this app.use('/api', apiRouter); with apiRouter encompassing all of these routes
// I (think) that if you have this all routed to a separate file like above, and include that route above your express.static, that your express.static will work. refactor this.


// let's go over the use of app/router.param. You should be able to use this to do your Sequelize lookup of your book by bookID, then attach that book as req.book to your subsequent routes that use this param for some really DRY and short routes.
// take a look at this:

// router.param('id', (req, res, next, id) => {
//   Book.findById(id)
//   .then(book => {
//     if (!book) {
//       const err = new Error('Book not found');
//       err.status = 404;
//       throw err;
//     }
//     req.book = book;
//     next();
//     return null;
//   })
//   .catch(next);
// });

// router.get('/:id', (req, res, next) => {
//   res.send(req.book);
// });



app.param('bookId', (req, res, next, bookId) => {
	req.bookId = bookId;
	if (req.bookId.match(/\D/g)) res.sendStatus(500);
	else next();
});

app.param('chapId', (req, res, next, chapId) => {
	req.chapId = chapId;
	if (req.chapId.match(/\D/g)) res.sendStatus(500);
	else next();
});

// nice use of lodash, but overcomplicating things here. Try to use native methods before you start going to libraries.
//   if (Object.keys(req.query).length > 0)
app.get('/api/books', (req, res, next) => {
	let query = req.query;
	if (_.isEmpty(query)) {
		Book.findAll({})
			.then(foundBooks => res.json(foundBooks))
			.catch(next);
	} else {
		// 	Book.findOne({
		// 	where: {
		// 		title: query.title
		// 	}
		// })
		Book.findAll({
			where: {
				title: query.title
			}
		})
			.then(foundBook => {
				res.json(foundBook);
			})
			.catch(next);
	}
});

app.post('/api/books', (req, res, next) => {
	Book.create(req.body)
		.then(createdBook => res.status(201).json(createdBook))
		.catch(next);
});

app.get('/api/books/:bookId', (req, res, next) => {
	Book.findById(req.bookId)
		.then(foundBook => {
			if (!foundBook) res.sendStatus(404);
			else res.json(foundBook);
		})
		.catch(next);
});


app.put('/api/books/:bookId', (req, res, next) => {
	Book.update(req.body, {
		where: {id: req.bookId},
		returning: true
	})
		.then(([affectedCount, [affectedRow]]) => {
			if (!affectedRow) res.sendStatus(404);
			res.json(affectedRow);
		})
		.catch(next);
});


app.delete('/api/books/:bookId', (req, res, next) => {
	Book.destroy({ where: {id: req.bookId}	})
		.then(numDestroyed => {
			if (numDestroyed === 0) res.sendStatus(404);
			else res.sendStatus(204);
		})
		.catch(next);
});


// look at how long these strings are. this can be shortened by using router.use('api', apiRouter) router.use('/books', bookRouter). You shouldn't be chaining huge routes like this.
app.get('/api/books/:bookId/chapters', (req, res, next) => {
	Chapter.findAll({
		where: {
			bookId: req.bookId
		}
	})
		.then(foundChapters => res.json(foundChapters))
		.catch(next);
});

app.post('/api/books/:bookId/chapters', (req,res, next) => {
	const bookPromise = Book.findById(req.bookId);
	const chapterPromise = Chapter.create(req.body);

	Promise.all([bookPromise, chapterPromise])
		.then(([foundBook, createdChapter]) => {
			return createdChapter.setBook(foundBook);
		})
		.then(newChapter => res.status(201).json(newChapter))
		.catch(next);
});

app.get('/api/books/:bookId/chapters/:chapId', (req, res, next) => {
	Chapter.findById(req.chapId)
		.then(foundChapter => {
			if (!foundChapter) res.sendStatus(404);
			else res.json(foundChapter);
		})
		.catch(next);
});

app.put('/api/books/:bookId/chapters/:chapId', (req, res, next) => {
	Chapter.update(req.body, {
		where: {
			id: req.chapId
		},
		returning: true
	})
		.then(([affectedCount, [affectedRow]]) => {
			if (!affectedRow) res.sendStatus(404);
			else res.json(affectedRow);
		})
		.catch(next);
});

// when deleting a chapter, we also have to remove the association from the book that has the chapter. then we can delete the chapter: to remove a created association, you can just call the set method without a specific id.

// this route is also unnecessarily complex. take a look at this (doesn't handle if chapter doesn't exist)
// app.delete('/api/books/:books/chapters/:chapId', (req, res, next) => {
// 	Chapter.findOne({
// 		where: {
// 			id: req.chapId
// 		}
// 	})
// 	.then(foundChapter => {
//   	return foundChapter.destroy()
// 	})
//   .then(() => {
//     res.sendStatus(204);
//   })
//   .catch(next);
// });

app.delete('/api/books/:books/chapters/:chapId', (req, res, next) => {
	Chapter.findOne({
		where: {
			id: req.chapId
		}
	})
		// .then(foundChapter => {
		// 	if (!foundChapter) res.sendStatus(404);
		// 	else {
		// 		foundChapter.setBook();
		// 		return foundChapter.destroy();
		// 	}
		// })
		// .catch(next);
		.then(foundChapter => {
			if (!foundChapter) res.sendStatus(404);
			else foundChapter.setBook();
		})
		.then( () => {
			Chapter.destroy({
				where: {
					id: req.chapId
				}
			})
			.then(numDestroyed => {console.log(numDestroyed)});
		})
		.then(()=>{res.sendStatus(204)})
		.catch(next);

});

// let's take a look at sessions together
app.get('/api/numVisits', (req, res, next) => {
	console.log(req.session);
	const views = req.session.views;
	console.log(views);
	const strViews = views + '';
	console.log(strViews);
	res.send(strViews);
});

app.use('/forbidden', (req, res, next) => {
	res.sendStatus(403);
});

app.use('/*', (req, res, next) => {
	req.session.views ? req.session.views++ : req.session.views = 1;
	res.sendStatus(500);
});

app.use((err, req, res, next) => {
	console.log(err.stack);
	res.state(500).send(err.message);
})


// // "Error: secret option required for sessions:"
// app.use('/*', (req, res, next) => {
// 	req.session.views++;
// 	res.sendStatus(500);
// });
// adding that object
