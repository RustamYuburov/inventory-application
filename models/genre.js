const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GenreSchema = new Schema({
  name: { type: String, required: true, minLength: 1, maxLength: 100 },
  genreImage: { type: String },
});

// Virtual for genre's URL
GenreSchema.virtual('url').get(function () {
  return '/genre/' + this._id;
});

module.exports = mongoose.model('Genre', GenreSchema);
