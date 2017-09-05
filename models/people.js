var	mongoose = require('mongoose');

//Schema Setup (needed for the database)
var PeopleSchema = new mongoose.Schema({
	name: String,
	image: String,
	description: String,
	author: {
		id: {
			type: mongoose.Schema.Types.ObjectId, //stores comment ID, not actual comment
			ref: "User" //name of Model
		},
		username: String
	}
});

//Campground model
module.exports = mongoose.model ("People", PeopleSchema)