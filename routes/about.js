var express = require("express");
var router = express.Router();
var About = require("../models/about");

//(INDEX) - displays list of all campgrounds (linked to campgrounds.ejs)
//displays all the campgrounds found in the mongo database
router.get("/about", function(req, res) {
	//Grabs the campground data from mongo database and displays it on campgrounds.ejs
	About.find({}, function(err, allcampgrounds){
		if(err) {
			console.log(err);
		} else {
			res.render("about.ejs", {thecampgrounds: allcampgrounds});
		}
	});
});

//(NEW) - Displays form to create a new campground (linked to new.ejs)
router.get("/about/new", isLoggedIn, function(req, res) {
	res.render("newAbout.ejs");
});

//(CREATE) - Adds a new campground
//to delete all campgrouds "db.campgrounds.drop()"
//posts a new campground then redirects to campgrounds.ejs 
router.post("/about", isLoggedIn, function(req, res) {
	//this grabs the data from the req.body.name and grabs name attribute on new.ejs
	var name = req.body.name
	var image = req.body.image
	var description = req.body.description
	var author = {
		id: req.user._id,
		username: req.user.username
	}

	var newAbout = { 
							name: name, 
							image: image, 
							description: description,
							author: author
						}
						
	//Create a new campground and save to the mongoDB
	About.create(newAbout, function(err, newlyCreatedCampground){
		if(err) {
			console.log(err);
		} else {
			//redirect back tot he campgrounds page
			res.redirect("/about");
			// newlyCreatedCampground.author.id = req.user._id;
			// newlyCreatedCampground.author.username = req.user.username;
				console.log(newlyCreatedCampground.author.id)
				console.log(req.user._id)
		}
	});	
});

//(SHOW) - shows info about one campground (linked to show.ejs)
//finds the campground with the provided ID
//req.params.id
router.get("/about/:id", function(req,res){
	//find the campground with provided ID (this finds all data in Mongo database)
	About.findById(req.params.id, function(err, foundCampground){
		if(err){
			} else {
				res.render("showAbout.ejs", {showCampground: foundCampground});

			}
	});	
});

 //(Edit) - Edits a campground (this is linked with edit.ejs)
router.get("/about/:id/edit", checkAboutOwnership, function(req,res){
	//find the campground with provided ID (this finds all data in Mongo database)
	About.findById(req.params.id, function(err, foundCampground){
		if(err){
			} else {
				res.render("editAbout.ejs", {mycampground: foundCampground});
			}
	});	
});

//(Update campground) - Updates the edit campground
router.put("/about/:id/", checkAboutOwnership, function(req,res){
	//grabs name attribute from the form
	var editAbout = {
					name: req.body.name, 
					image: req.body.image,
					description: req.body.description
				}
	//find and update the campground
	About.findByIdAndUpdate(req.params.id, editAbout, function(err, updatedCampground){
			if (err) {
				res.redirect("/about");
			} else {
				//redirect to show.ejs
				res.redirect("/about/" + updatedCampground._id)

			}
	});
});

//Delete a campground
//to delete all campgrouds "db.campgrounds.drop()"
router.delete("/about/:id", checkAboutOwnership, function(req, res){
	About.findByIdAndRemove(req.params.id, function(err){
		if(err) {
			res.redirect("about");
		} else {
			res.redirect("/about");
		}
	});
}); 

//middleware to check if user is logged in
//add to any route you need user to be logged in
function isLoggedIn(req, res, next) {
		if(req.isAuthenticated()) { // if user is logged in, then run next() which
		return next(); // refers to everything after isLoggedIn function
	}
	res.redirect('/unauthenticated'); // else redirect to login page if not logged in 
}


//middleware to check edit/update and destroy ownership
function checkAboutOwnership (req, res, next){
	// is User logged in?
	if (req.isAuthenticated){
				//if yes, then...
				About.findById(req.params.id, function(err, foundCampground) { // finds all Blogs in database
					if(err){
						res.direct('back');
					} else {
						// does the user own the blog? If yes....
						if (foundCampground.author.id.equals(req.user._id)) {
						next();
					} else {
						// If no....
						res.send('You do not have permission to do that')
					}

					}
			});
		}
}

module.exports = router;