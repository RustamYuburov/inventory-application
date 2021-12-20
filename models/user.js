const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { DateTime } = require('luxon');

const UserSchema = new Schema({
  username: { type: String, required: true, minlength: 1, maxlength: 100},
  password: { type: String, required: true},
  join_date: { type: Date, default: Date.now }
})

UserSchema.virtual('join_date_formatted').get(function () {
  return DateTime.fromJSDate(this.join_date).toFormat("yyyy-MM-dd, HH:mm");
})

module.exports = mongoose.model('User', UserSchema);