var Genre = require('../models/genre');
var Game = require('../models/game');

var async = require('async');
const { body, validationResult } = require('express-validator');
const upload = require('../public/javascripts/helpers');
const mongoose = require('mongoose');
const fs = require('fs');

// Display list of all Genre.
exports.genre_list = function (req, res) {
  Genre.find().exec(function (err, list_genres) {
    if (err) {
      return next(err);
    }
    res.render('genre_list', { title: 'Genres', genre_list: list_genres });
  });
};

// Display detail page for a specific Genre.
exports.genre_detail = function (req, res) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    let err = new Error('Invalid ObjectID');
    err.status = 404;
    return next(err);
  }

  async.parallel(
    {
      genre: function (callback) {
        Genre.findById(req.params.id).exec(callback);
      },
      genre_games: function (callback) {
        Game.find({ genre: req.params.id }).exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.genre == null) {
        const err = new Error('Genre not found');
        err.status = 404;
        return next(err);
      }

      res.render('genre_detail', {
        title: results.genre.name + ' Games',
        genre: results.genre,
        genre_games: results.genre_games,
      });
    }
  );
};

// Display Genre create form on GET.
exports.genre_create_get = function (req, res) {
  res.render('genre_form', { title: 'Add New Genre', type: 'create' });
};

// Handle Genre create on POST.
exports.genre_create_post = [
  // Upload image file with Multer
  upload.single('genre_image'),
  // Validate and santize the name field.
  body('name', 'Genre name should be at least 2 characters long.')
    .trim()
    .isLength({ min: 2, max: 100 })
    .escape(),
  (req, res, next) => {
    const errors = validationResult(req);

    var genre = new Genre({
      name: req.body.name,
    });

    // There are errors. Render the form again with sanitized values/error messages.
    if (!errors.isEmpty()) {
      res.render('genre_form', {
        title: 'Add New Genre',
        genre: genre,
        errors: errors.array(),
        type: 'create',
      });
      return;
    } else if (!req.hasOwnProperty('file')) {
      res.render('genre_form', {
        title: 'Add New Genre',
        genre: genre,
        type: 'create',
        error: 'Image is required to create a genre!',
      });
      return;
    }

    genre.genreImage = req.file.path.substring(6);

    Genre.findOne({ name: req.body.name }).exec(function (err, found_genre) {
      if (err) {
        return next(err);
      }
      if (found_genre) {
        // Genre exists, redirect to its page.
        res.redirect(found_genre.url);
      }
      //  Create Genre and save to database
      else {
        genre.save(function (err) {
          if (err) {
            return next(err);
          }
          res.redirect(genre.url);
        });
      }
    });
  },
];

// Display Genre delete form on GET.
exports.genre_delete_get = function (req, res) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    let err = new Error('Invalid ObjectID');
    err.status = 404;
    return next(err);
  }

  async.parallel(
    {
      genre: function (callback) {
        Genre.findById(req.params.id).exec(callback);
      },
      genre_games: function (callback) {
        Game.find({ genre: req.params.id }).exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.genre == null) {
        // No results.
        res.redirect('/genres');
        return;
      }
      // Successful, so render.
      res.render('genre_delete', {
        title: 'Delete ' + results.genre.name + ' genre',
        genre: results.genre,
        genre_games: results.genre_games,
      });
    }
  );
};

// Handle Genre delete on POST.
exports.genre_delete_post = function (req, res) {
  async.parallel(
    {
      genre: function (callback) {
        Genre.findById(req.body.genreid).exec(callback);
      },
      genre_games: function (callback) {
        Game.find({ genre: req.body.genreid }).exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      // Success
      if (results.genre_games.length > 0) {
        // Genre has games. Render in same way as for GET route.
        res.render('genre_delete', {
          title: 'Delete ' + results.genre.name + ' genre',
          genre: results.genre,
          genre_games: results.genre_games,
        });
        return;
      } else if (req.body.password !== 'secretadminpass') {
        res.render('genre_delete', {
          title: 'Delete ' + results.genre.name + ' genre',
          genre: results.genre,
          genre_games: results.genre_games,
          error: 'The password you entered is incorrect.',
        });
        return;
      }
      // Genre has no games. Delete object and redirect to the list of genres.
      Genre.findByIdAndRemove(req.body.genreid, function deletegenre(err) {
        if (err) {
          return next(err);
        }
        // Success - go to genre list
        res.redirect('/genres');
      });
    }
  );
};

// Display Genre update form on GET.
exports.genre_update_get = function (req, res) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    let err = new Error('Invalid ObjectID');
    err.status = 404;
    return next(err);
  }
  // Get genre for form.
  Genre.findById(req.params.id, function (err, genre) {
    if (err) {
      return next(err);
    }
    if (genre == null) {
      // No resutls
      const err = new Error('Genre not found');
      err.status = 404;
      return next(err);
    }
    // Success.
    res.render('genre_form', {
      title: 'Update ' + genre.name,
      genre: genre,
      type: 'update',
    });
  });
};

// Handle Genre update on POST.
exports.genre_update_post = [
  // Upload image file with Multer
  upload.single('genre_image'),

  // Validate and santize the name field.
  body('name', 'Genre name should be at least 2 characters long.')
    .trim()
    .isLength({ min: 2, max: 100 })
    .escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Genre object with escaped and trimmed data.
    var genre = new Genre({
      name: req.body.name,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      res.render('genre_form', {
        title: 'Update ' + genre.name + ' info',
        genre: genre,
        errors: errors.array(),
        type: 'update',
      });
      return;
    } else if (req.body.password != 'secretadminpass') {
      res.render('genre_form', {
        title: 'Update ' + genre.name + ' info',
        genre: genre,
        msg: 'The password you entered is invalid',
        type: 'update',
      });
      return;
    } else if (!req.hasOwnProperty('file')) {
      res.render('genre_form', {
        title: 'Update ' + genre.name + ' info',
        genre: genre,
        error: 'Image is required to update a genre!',
        type: 'update',
      });
      return;
    } else {
      genre.genreImage = req.file.path.substring(6);
      //     // Data from form is valid. Update the record.
      Genre.findByIdAndUpdate(req.params.id, genre, {}, function (err, thegenre) {
        if (err) {
          return next(err);
        }
        // Successful - redirect to genre detail page.
        res.redirect(thegenre.url);
      });
    }
  },
];
