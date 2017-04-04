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
// real deal important to use this. otherwise we can't use 'req.body', and so can't put anything in the database.
// also, defaul success status code is 200. this can be changed to be more expressive of what took place.

// ## APP STATIC ## //

// app.use('/files', express.static('public'));
app.use('/files', express.static(__dirname + '/public/static'));

// app.use('/files', express.static(path.join(__dirname, 'public/static')));

// app.use(express.static('public'));
// app.use(express.static(path.join(__dirname, 'public')));
// app.use(express.static(__dirname + 'public'));

app.use(session({
	secret: 'my express secret',
	// resave: false,
	// saveUninitialized: false
	views: 0,
}));

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
	// if (req.id.match(/\D/g)) res.sendStatus(500);
	Book.findById(req.bookId)
		.then(foundBook => {
			if (!foundBook) res.sendStatus(404);
			else res.json(foundBook);
		})
		.catch(next);
});

// notice that the first updated instance actually comes as an array, i.e., the return is an array whose second element is itself an array. can verfify in the tests

//.update() returns an array: the number of affected rows and the effected rows
// to update, pass two arguments: first, the content to add; second, a where condition specifying the rows to add
app.put('/api/books/:bookId', (req, res, next) => {
	// if (req.id.match(/\D/g)) res.sendStatus(500);
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

// ALWAYS MIND THE DASH. THE DASH SHOULDN'T BE SILENT BUT IT DO
// destroy returns the number of destroyed rows
app.delete('/api/books/:bookId', (req, res, next) => {
	// if (req.id.match(/\D/g)) res.sendStatus(500);
	Book.destroy({ where: {id: req.bookId}	})
		.then(numDestroyed => {
			if (numDestroyed === 0) res.sendStatus(404);
			else res.sendStatus(204);
		})
		.catch(next);
});

// get all the chapters of a given book
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

app.get('/api/numVisits', (req, res, next) => {
	console.log(req.session);
	const views = req.session.views;
	console.log(views);
	const strViews = views + '';
	console.log(strViews);
	res.send(strViews);
	// res.sendStatus(500)
	// console.log(req.session);
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