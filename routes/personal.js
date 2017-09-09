var express = require("express");
var router = express.Router();
var Personal = require("../models/personal");

//Personal

//(INDEX) - displays list of all campgrounds (linked to campgrounds.ejs)
//displays all the campgrounds found in the mongo database
router.get("/personal", function(req, res) {
	//Grabs the campground data from mongo database and displays it on campgrounds.ejs
	Personal.find({}, function(err, allcampgrounds){
		if(err) {
			console.log(err);
		} else {
			res.render("personal.ejs", {thecampgrounds: allcampgrounds});
		}
	});
});

//(NEW) - Displays form to create a new campground (linked to new.ejs)
router.get("/personal/new", isLoggedIn, function(req, res) {
	res.render("newPersonal.ejs");
});

//(CREATE) - Adds a new campground
//to delete all campgrouds "db.campgrounds.drop()"
//posts a new campground then redirects to campgrounds.ejs 
router.post("/personal", isLoggedIn, function(req, res) {
	//this grabs the data from the req.body.name and grabs name attribute on new.ejs
	var name = req.body.name
	var image = req.body.image
	var desc = req.body.description
	var author = {
		id: req.user._id,
		username: req.user.username
	}

	var newPersonal = { 
							name: name, 
							image: image, 
							description: desc,
							author: author
						}

	//Create a new campground and save to the mongoDB
	Personal.create(newPersonal, function(err, newlyCreatedCampground){
		if(err) {
			console.log(err);
		} else {
			//redirect back tot he campgrounds page
			res.redirect("/personal");
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
router.get("/personal/:id", function(req,res){
	//find the campground with provided ID (this finds all data in Mongo database)
	Personal.findById(req.params.id, function(err, foundCampground){
		if(err){
			} else {
				res.render("showPersonal.ejs", {showCampground: foundCampground});

			}
	});	
});

 //(Edit) - Edits a campground (this is linked with edit.ejs)
router.get("/personal/:id/edit", checkPersonalOwnership, function(req,res){
	//find the campground with provided ID (this finds all data in Mongo database)
	Personal.findById(req.params.id, function(err, foundCampground){
		if(err){
			} else {
				res.render("editPersonal.ejs", {mycampground: foundCampground});
			}
	});	
});

//(Update campground) - Updates the edit campground
router.put("/personal/:id/", checkPersonalOwnership, function(req,res){
	//grabs name attribute from the form
	var editPersonal = {
					name: req.body.name, 
					image: req.body.image,
					desc: req.body.description
				}
	//find and update the campground
	Personal.findByIdAndUpdate(req.params.id, editPersonal, function(err, updatedCampground){
			if (err) {
				res.redirect("/personal");
			} else {
				//redirect to show.ejs
				res.redirect("/personal/" + updatedCampground._id)

			}
	});
});

//Delete a campground
//to delete all campgrouds "db.campgrounds.drop()"
router.delete("/personal/:id", checkPersonalOwnership, function(req, res){
	Personal.findByIdAndRemove(req.params.id, function(err){
		if(err) {
			res.redirect("personal");
		} else {
			res.redirect("/personal");
		}
	});
}); 

// to delete "db.peoples.drop()"

//middleware to check if user is logged in
//add to any route you need user to be logged in
function isLoggedIn(req, res, next) {
		if(req.isAuthenticated()) { // if user is logged in, then run next() which
		return next(); // refers to everything after isLoggedIn function
	}
	res.redirect('/unauthenticated'); // else redirect to login page if not logged in 
}


//middleware to check edit/update and destroy ownership
function checkPersonalOwnership(req, res, next){
	// is User logged in?
	if (req.isAuthenticated){
				//if yes, then...
				Personal.findById(req.params.id, function(err, foundCampground) { // finds all Blogs in database
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
