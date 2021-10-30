const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GameSchema = new Schema({
  title: { type: String, required: true, minLength: 1, maxLength: 100 },
  summary: { type: String, required: true, minLength: 1, maxLength: 2000 },
  price: { type: Number, required: true, min: 0, max: 99999 },
  inStock: { type: Number, required: true, min: 0, max: 9999 },
  developer: { type: Schema.Types.ObjectId, ref: 'Developer', required: true },
  genre: { type: Schema.Types.ObjectId, ref: 'Genre', required: true },
  productImage: { type: String },
});

GameSchema.virtual('url').get(function () {
  return '/catalog/game/' + this._id;
});

module.exports = mongoose.model('Game', GameSchema);
