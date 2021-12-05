var Game = require('../models/game');
var Developer = require('../models/developer');
var Genre = require('../models/genre');

var async = require('async');
const { body, validationResult } = require('express-validator');
const upload = require('../public/javascripts/helpers');
const mongoose = require('mongoose');

// Display list of all Games.
exports.game_list = function (req, res) {
  Game.find()
    .sort({ title: 1 })
    .exec(function (err, list_games) {
      if (err) {
        return next(err);
      }

      res.render('game_list', { title: 'Games', game_list: list_games });
    });
};

// Display detail page for a specific Game.
exports.game_detail = function (req, res) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    let err = new Error('Invalid ObjectID');
    err.status = 404;
    return next(err);
  }
  Game.findById(req.params.id)
    .populate('developer')
    .populate('genre')
    .exec(function (err, game) {
      if (err) {
        return next(err);
      }
      if (game == null) {
        const err = new Error('Game not found');
        err.status = 404;
        return next(err);
      }

      res.render('game_detail', { title: game.title, game: game });
    });
};

// Display Game create form on GET.
exports.game_create_get = function (req, res) {
  async.parallel(
    {
      developers: function (callback) {
        Developer.find(callback);
      },
      genres: function (callback) {
        Genre.find(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      res.render('game_form', {
        title: 'Add New Game',
        developers: results.developers,
        genres: results.genres,
        type: 'create',
      });
    }
  );
};

// Handle Game create on POST.
exports.game_create_post = [
  // Upload image file with Multer
  upload.single('game_image'),

  (req, res, next) => {
    if (!(req.body.genre instanceof Array)) {
      if (typeof req.body.genre === 'undefined') req.body.genre = [];
      else req.body.genre = new Array(req.body.genre);
    }
    next();
  },

  // Validate and sanitise fields.
  body('title', 'Game title must be at least 2 characters in length')
    .trim()
    .isLength({ min: 2, max: 200 })
    .escape(),
  body('developer', 'Game developer must be specified.').trim().isLength({ min: 1 }).escape(),
  body('summary', 'Game summary must be specified.')
    .trim()
    .isLength({ min: 2, max: 2000 })
    .escape(),
  body('genre.*').escape(),
  body('price', 'Price must be between $0 and $99999.').isFloat({
    min: 0,
    max: 99999,
  }),
  body('stock', 'Stock cannot be lower than 0.').isInt({ min: 0, max: 9999 }),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Game object with escaped and trimmed data.
    var game = new Game({
      title: req.body.title,
      developer: req.body.developer,
      summary: req.body.summary,
      price: req.body.price,
      inStock: req.body.stock,
      genre: req.body.genre,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all devs and genres for form.
      async.parallel(
        {
          developers: function (callback) {
            Developer.find(callback);
          },
          genres: function (callback) {
            Genre.find(callback);
          },
        },
        function (err, results) {
          if (err) {
            return next(err);
          }

          res.render('game_form', {
            title: 'Add New Game',
            developers: results.developers,
            genres: results.genres,
            game: game,
            errors: errors.array(),
            type: 'create',
          });
        }
      );
      return;
    } else if (!req.hasOwnProperty('file')) {
      async.parallel(
        {
          developers: function (callback) {
            Developer.find(callback);
          },
          genres: function (callback) {
            Genre.find(callback);
          },
        },
        function (err, results) {
          if (err) {
            return next(err);
          }

          res.render('game_form', {
            title: 'Add New Game',
            developers: results.developers,
            genres: results.genres,
            game: game,
            error: 'Image is required to create a new game!',
            type: 'create',
          });
        }
      );
      return;
    } else {
      game.productImage = req.file.path.substring(6);
      // Data from form is valid. Save game.
      game.save(function (err) {
        if (err) {
          return next(err);
        }
        //successful - redirect to new game page.
        res.redirect(game.url);
      });
    }
  },
];

// Display Game delete form on GET.
exports.game_delete_get = function (req, res) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    let err = new Error('Invalid ObjectID');
    err.status = 404;
    return next(err);
  }
  Game.findById(req.params.id)
    .populate('developer')
    .populate('genre')
    .exec(function (err, game) {
      if (err) {
        return next(err);
      }
      if (game == null) {
        const err = new Error('Game not found');
        err.status = 404;
        return next(err);
      }

      res.render('game_delete', { title: 'Delete ' + game.title, game: game });
    });
};

// Handle Game delete on POST.
exports.game_delete_post = function (req, res) {
  Game.findById(req.body.gameid, function (err, game) {
    if (err) {
      return next(err);
    }
    if (req.body.password !== 'secretadminpass') {
      res.render('game_delete', {
        title: 'Delete ' + game.title,
        game: game,
        error: 'The password you entered is incorrect.',
      });
      return;
    } else {
      // Success
      Game.findByIdAndRemove(req.params.id, function deleteGame(err) {
        if (err) {
          return next(err);
        }
        // Success - go to game list
        res.redirect('/games');
      });
    }
  });
};

// Display Game update form on GET.
exports.game_update_get = function (req, res) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    let err = new Error('Invalid ObjectID');
    err.status = 404;
    return next(err);
  }
  // Get game, developers and genres for form.
  async.parallel(
    {
      game: function (callback) {
        Game.findById(req.params.id).populate('developer').populate('genre').exec(callback);
      },
      developers: function (callback) {
        Developer.find(callback);
      },
      genres: function (callback) {
        Genre.find(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.game == null) {
        // No results.
        var err = new Error('Game not found');
        err.status = 404;
        return next(err);
      }
      // Success.
      res.render('game_form', {
        title: 'Update ' + results.game.title + ' info',
        developers: results.developers,
        genres: results.genres,
        game: results.game,
        type: 'update',
      });
    }
  );
};

// Handle Game update on POST.
exports.game_update_post = [
  // Upload image file with Multer
  upload.single('game_image'),

  // Convert the genre to an array
  (req, res, next) => {
    if (!(req.body.genre instanceof Array)) {
      if (typeof req.body.genre === 'undefined') req.body.genre = [];
      else req.body.genre = new Array(req.body.genre);
    }
    next();
  },

  // Validate and sanitise fields.
  body('title', 'Game title must be at least 2 characters in length')
    .trim()
    .isLength({ min: 2, max: 200 })
    .escape(),
  body('developer', 'Game developer must be specified.').trim().isLength({ min: 1 }).escape(),
  body('summary', 'Game summary must be specified.')
    .trim()
    .isLength({ min: 2, max: 2000 })
    .escape(),
  body('genre.*').escape(),
  body('price', 'Price must be between $0 and $99999.').isFloat({
    min: 0,
    max: 99999,
  }),
  body('stock', 'Stock cannot be lower than 0.').isInt({ min: 0, max: 9999 }),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Game object with escaped and trimmed data.
    var game = new Game({
      title: req.body.title,
      developer: req.body.developer,
      summary: req.body.summary,
      price: req.body.price,
      inStock: req.body.stock,
      genre: req.body.genre,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      async.parallel(
        {
          developers: function (callback) {
            Developer.find(callback);
          },
          genres: function (callback) {
            Genre.find(callback);
          },
        },
        function (err, results) {
          if (err) {
            console.log(req.body);
            return next(err);
          }
          res.render('game_form', {
            title: 'Update ' + game.title + ' info',
            developers: results.developers,
            genres: results.genres,
            game: game,
            errors: errors.array(),
          });
        }
      );
      return;
    } else if (req.body.password != 'secretadminpass') {
      async.parallel(
        {
          developers: function (callback) {
            Developer.find(callback);
          },
          genres: function (callback) {
            Genre.find(callback);
          },
        },
        function (err, results) {
          if (err) {
            return next(err);
          }
          res.render('game_form', {
            title: 'Update ' + game.title + ' info',
            developers: results.developers,
            genres: results.genres,
            game: game,
            msg: 'The password you entered is invalid',
            type: 'update',
          });
        }
      );
      return;
    } else if (!req.hasOwnProperty('file')) {
      async.parallel(
        {
          developers: function (callback) {
            Developer.find(callback);
          },
          genres: function (callback) {
            Genre.find(callback);
          },
        },
        function (err, results) {
          if (err) {
            return next(err);
          }

          res.render('game_form', {
            title: 'Update ' + game.title + ' info',
            developers: results.developers,
            genres: results.genres,
            game: game,
            error: 'Image is required to update a game!',
            type: 'update',
          });
        }
      );
      return;
    } else {
      game.productImage = req.file.path.substring(6);
      //     // Data from form is valid. Update the record.
      Game.findByIdAndUpdate(req.params.id, game, {}, function (err, thegame) {
        if (err) {
          return next(err);
        }
        // Successful - redirect to book detail page.
        res.redirect(thegame.url);
      });
    }
  },
];
