var express = require('express')
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose")
//Needed to edit and update campground
var methodOverride = require("method-override")

//this creates the mongoDB database
mongoose.connect("mongodb://localhost/yelp_camp", {useMongoClient: true});
mongoose.Promise = global.Promise;
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs")
//Needed to edit and update campground
app.use(methodOverride("_method"));

var PORT = process.env.PORT || 5000

app.get("/", function(req, res) {
	res.render("landing.ejs");
});

//Schema Setup (needed for the database)
var campgroundSchema = new mongoose.Schema({
	name: String,
	image: String,
	description: String
});

var Campground = mongoose.model ("Campground", campgroundSchema)

//Creating a new campground to add to the mongo database
// Campground.create(
// 	{
// 		name: "Aldrich",
// 		image: "https://scontent-atl3-1.xx.fbcdn.net/v/t1.0-9/11196314_10101431630208498_1337263848464353873_n.jpg?oh=f7fe3bc717a749e7e7d7d831b9cd69b0&oe=59FC5F88",
// 		description: "Best locker in the world"
// 	}, function(err, campground) {
// 		if(err){
// 			console.log(err);
// 		} else { 
// 			console.log("Newly Created Campground")
// 			console.log(campground)
// 		}
// 	});

//(INDEX) - displays list of all campgrounds (linked to campgrounds.ejs)
//displays all the campgrounds 
app.get("/campgrounds", function(req, res) {
	//Grabs the campground data from mongo database and displays it on campgrounds.ejs
	Campground.find({}, function(err, allcampgrounds){
		if(err) {
			console.log(err);
		} else {
			res.render("campgrounds.ejs", {thecampgrounds: allcampgrounds});
		}
	});
});

//(CREATE) - Adds a new campground
//to delete all campgrouds "db.campgrounds.drop()"
//posts a new campground then redirects to campgrounds.ejs 
app.post("/campgrounds", function(req, res) {
	//this grabs the data from the req.body.name grabs name attribute on new.ejs
	var name = req.body.name
	var image = req.body.image
	var desc = req.body.description
	var newCampground = { 
							name: name, 
							image: image, 
							description: desc
						}

	//Create a new campground and save to the mongoDB
	Campground.create(newCampground, function(err, newlyCreatedCampground){
		if(err) {
			console.log(err);
		} else {
			//redirect back tot he campgrounds page
			res.redirect("/campgrounds");
		}
	});	
});

//(NEW) - Displays form to create a new campground (linked to new.ejs)
app.get("/campgrounds/new", function(req, res) {
	res.render("new.ejs");
});

//(SHOW) - shows info about one campground (linked to show.ejs)
//finds the campground with the provided ID
//req.params.id
app.get("/campgrounds/:id", function(req,res){
	//find the campground with provided ID (this finds all data in Mongo database)
	Campground.findById(req.params.id, function(err, foundCampground){
		if(err){
			} else {
				res.render("show.ejs", {showCampground: foundCampground});
			}
	});	
});

 //(Edit) - Edits a campground (this is linked with edit.ejs)
app.get("/campgrounds/:id/edit", function(req,res){
	//find the campground with provided ID (this finds all data in Mongo database)
	Campground.findById(req.params.id, function(err, foundCampground){
		if(err){
			} else {
				res.render("edit.ejs", {mycampground: foundCampground});
			}
	});	
});

//(Update campground) - Updates the edit campground
app.put("/campgrounds/:id/", function(req,res){
	//grabs name attribute from the form
	var editCampground = {
					name: req.body.name, 
					image: req.body.image,
					desc: req.body.descripition
				}
	//find and update the campground
	Campground.findByIdAndUpdate(req.params.id, editCampground, function(err, updatedCampground){
			if (err) {
				res.redirect("/campgrounds");
			} else {
				//redirect to show.ejs
				res.redirect("/campgrounds/" + updatedCampground._id)
			}
	});

});

app.listen(PORT, function(){
  console.log('Server Running');
});
