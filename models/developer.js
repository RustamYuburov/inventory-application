const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DeveloperSchema = new Schema({
  name: { type: String, required: true, minLength: 2, maxLength: 100 },
  description: { type: String, required: true, minLength: 1, maxLength: 2000 },
  studioImage: { type: String },
});

DeveloperSchema.virtual('url').get(function () {
  return '/catalog/developer/' + this._id;
});

module.exports = mongoose.model('Developer', DeveloperSchema);
