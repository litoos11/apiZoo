'use strict'

const mongoose = require('mongoose'),
			Schema = mongoose.Schema;

const UserSchema = new Schema({
	name: String,
	surname: String,
	email: String,
	password: String,
	image: String,
	role: String
});

module.exports = mongoose.model('User', UserSchema)