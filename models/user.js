var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
	username: String,
	password: String
});

//Adds methods to the UserSchema
UserSchema.plugin(passportLocalMongoose);

//from app.js
module.exports = mongoose.model("User", UserSchema)

