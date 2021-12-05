var Developer = require('../models/developer');
var Game = require('../models/game');

var async = require('async');
const { body, validationResult } = require('express-validator');
const upload = require('../public/javascripts/helpers');
const mongoose = require('mongoose');
const fs = require('fs');

// Display list of all Developers.
exports.developer_list = function (req, res) {
  Developer.find().exec(function (err, list_devs) {
    if (err) {
      return next(err);
    }
    res.render('developer_list', { title: 'Developers', dev_list: list_devs });
  });
};

// Display detail page for a specific Developer.
exports.developer_detail = function (req, res) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    let err = new Error('Invalid ObjectID');
    err.status = 404;
    return next(err);
  }

  async.parallel(
    {
      developer: function (callback) {
        Developer.findById(req.params.id).exec(callback);
      },
      developers_games: function (callback) {
        Game.find({ developer: req.params.id }).exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.developer == null) {
        const err = new Error('Developer not found');
        err.status = 404;
        return next(err);
      }

      res.render('developer_detail', {
        title: results.developer.name,
        developer: results.developer,
        developer_games: results.developers_games,
      });
    }
  );
};

// Display Developer create form on GET.
exports.developer_create_get = function (req, res) {
  res.render('developer_form', { title: 'Add New Developer', type: 'create' });
};

// Handle Developer create on POST.
exports.developer_create_post = [
  // Upload image file with Multer
  upload.single('developer_image'),
  // Validate and santize the name field.
  body('name', 'Developer name should be at least 2 characters long.')
    .trim()
    .isLength({ min: 2, max: 100 })
    .escape(),
  body('description', 'Developer description must be specified.')
    .trim()
    .isLength({ min: 2, max: 2000 })
    .escape(),
  (req, res, next) => {
    const errors = validationResult(req);

    var developer = new Developer({
      name: req.body.name,
      description: req.body.description,
    });

    // There are errors. Render the form again with sanitized values/error messages.
    if (!errors.isEmpty()) {
      res.render('developer_form', {
        title: 'Add New Developer',
        developer: developer,
        errors: errors.array(),
        type: 'create',
      });
      return;
    } else if (!req.hasOwnProperty('file')) {
      res.render('developer_form', {
        title: 'Add New Developer',
        developer: developer,
        type: 'create',
        error: 'Image is required to create a developer!',
      });
      return;
    }

    developer.studioImage = req.file.path.substring(6);

    Developer.findOne({ name: req.body.name }).exec(function (err, found_developer) {
      if (err) {
        return next(err);
      }
      if (found_developer) {
        // Developer exists, redirect to its page.
        res.redirect(found_developer.url);
      }
      //  Create Developer and save to database
      else {
        developer.save(function (err) {
          if (err) {
            return next(err);
          }
          res.redirect(developer.url);
        });
      }
    });
  },
];

// Display Developer delete form on GET.
exports.developer_delete_get = function (req, res) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    let err = new Error('Invalid ObjectID');
    err.status = 404;
    return next(err);
  }
  async.parallel(
    {
      developer: function (callback) {
        Developer.findById(req.params.id).exec(callback);
      },
      developers_games: function (callback) {
        Game.find({ developer: req.params.id }).exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.developer == null) {
        // No results.
        res.redirect('/developers');
        return;
      }
      // Successful, so render.
      res.render('developer_delete', {
        title: 'Delete ' + results.developer.name,
        developer: results.developer,
        developer_games: results.developers_games,
      });
    }
  );
};

// Handle Developer delete on POST.
exports.developer_delete_post = function (req, res) {
  async.parallel(
    {
      developer: function (callback) {
        Developer.findById(req.body.developerid).exec(callback);
      },
      developers_games: function (callback) {
        Game.find({ developer: req.body.developerid }).exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      // Success
      if (results.developers_games.length > 0) {
        // Developer has games. Render in same way as for GET route.
        res.render('developer_delete', {
          title: 'Delete ' + results.developer.name,
          developer: results.developer,
          developer_games: results.developers_games,
        });
        return;
      } else if (req.body.password !== 'secretadminpass') {
        res.render('developer_delete', {
          title: 'Delete ' + results.developer.name,
          developer: results.developer,
          developer_games: results.developers_games,
          error: 'The password you entered is incorrect.',
        });
        return;
      }
      // Developer has no games. Delete object and redirect to the list of developers.
      Developer.findByIdAndRemove(req.body.developerid, function deleteDeveloper(err) {
        if (err) {
          return next(err);
        }
        // Success - go to developer list
        res.redirect('/developers');
      });
    }
  );
};

// Display Developer update form on GET.
exports.developer_update_get = function (req, res) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    let err = new Error('Invalid ObjectID');
    err.status = 404;
    return next(err);
  }
  // Get developer for form.
  Developer.findById(req.params.id, function (err, developer) {
    if (err) {
      return next(err);
    }
    if (developer == null) {
      // No resutls
      const err = new Error('Developer not found');
      err.status = 404;
      return next(err);
    }
    // Success.
    res.render('developer_form', {
      title: 'Update ' + developer.name + ' info',
      developer: developer,
      type: 'update',
    });
  });
};

// Handle Developer update on POST.
exports.developer_update_post = [
  // Upload image file with Multer
  upload.single('developer_image'),

  // Validate and santize the name field.
  body('name', 'Developer name should be at least 2 characters long.')
    .trim()
    .isLength({ min: 2, max: 100 })
    .escape(),
  body('description', 'Developer description must be specified.')
    .trim()
    .isLength({ min: 2, max: 2000 })
    .escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Developer object with escaped and trimmed data.
    var developer = new Developer({
      name: req.body.name,
      description: req.body.description,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      res.render('developer_form', {
        title: 'Update ' + developer.name + ' info',
        developer: developer,
        errors: errors.array(),
        type: 'update',
      });
      return;
    } else if (req.body.password != 'secretadminpass') {
      res.render('developer_form', {
        title: 'Update ' + developer.name + ' info',
        developer: developer,
        msg: 'The password you entered is invalid',
        type: 'update',
      });
      return;
    } else if (!req.hasOwnProperty('file')) {
      res.render('developer_form', {
        title: 'Update ' + developer.name + ' info',
        developer: developer,
        error: 'Image is required to update a developer!',
        type: 'update',
      });
      return;
    } else {
      developer.studioImage = req.file.path.substring(6);
      //     // Data from form is valid. Update the record.
      Developer.findByIdAndUpdate(req.params.id, developer, {}, function (err, thedeveloper) {
        if (err) {
          return next(err);
        }
        // Successful - redirect to developer detail page.
        res.redirect(thedeveloper.url);
      });
    }
  },
];
