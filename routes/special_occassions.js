var express = require("express");
var router = express.Router();
var SO = require("../models/special-occassions");

// Special Occassions Page

//(INDEX) - displays list of all campgrounds (linked to campgrounds.ejs)
//displays all the campgrounds found in the mongo database
router.get("/special-occassions", function(req, res) {
	//Grabs the campground data from mongo database and displays it on campgrounds.ejs
	SO.find({}, function(err, allcampgrounds){
		if(err) {
			console.log(err);
		} else {
			res.render("special-occassions.ejs", {thecampgrounds: allcampgrounds});
		}
	});
});

//(NEW) - Displays form to create a new campground (linked to new.ejs)
router.get("/special-occassions/new", isLoggedIn, function(req, res) {
	res.render("newspecialoccassion.ejs");
});

//(CREATE) - Adds a new campground
//to delete all campgrouds "db.campgrounds.drop()"
//posts a new campground then redirects to campgrounds.ejs 
router.post("/special-occassions", isLoggedIn, function(req, res) {
	//this grabs the data from the req.body.name and grabs name attribute on new.ejs
	var name = req.body.name
	var image = req.body.image
	var desc = req.body.description
	var author = {
		id: req.user._id,
		username: req.user.username
	}

	var newspecialoccassion = { 
							name: name, 
							image: image, 
							description: desc,
							author: author
						}

	//Create a new campground and save to the mongoDB
	SO.create(newspecialoccassion, function(err, newlyCreatedCampground){
		if(err) {
			console.log(err);
		} else {
			//redirect back tot he campgrounds page
			res.redirect("/special-occassions");
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
router.get("/special-occassions/:id", function(req,res){
	//find the campground with provided ID (this finds all data in Mongo database)
	SO.findById(req.params.id, function(err, foundCampground){
		if(err){
			} else {
				res.render("showspecialoccassion.ejs", {showCampground: foundCampground});

			}
	});	
});

 //(Edit) - Edits a campground (this is linked with edit.ejs)
router.get("/special-occassions/:id/edit", checkSpecialOccassionOwnership, function(req,res){
	//find the campground with provided ID (this finds all data in Mongo database)
	SO.findById(req.params.id, function(err, foundCampground){
		if(err){
			} else {
				res.render("editspecialoccassions.ejs", {mycampground: foundCampground});
			}
	});	
});

//(Update campground) - Updates the edit campground
router.put("/special-occassions/:id/", checkSpecialOccassionOwnership, function(req,res){
	//grabs name attribute from the form
	var editSpecialOccassion = {
					name: req.body.name, 
					image: req.body.image,
					desc: req.body.description
				}
	//find and update the campground
	SO.findByIdAndUpdate(req.params.id, editSpecialOccassion, function(err, updatedCampground){
			if (err) {
				res.redirect("/special-occassions");
			} else {
				//redirect to show.ejs
				res.redirect("/special-occassions/" + updatedCampground._id)

			}
	});
});


//Delete a campground
//to delete all campgrouds "db.campgrounds.drop()"
router.delete("/special-occassions/:id", checkSpecialOccassionOwnership, function(req, res){
	SO.findByIdAndRemove(req.params.id, function(err){
		if(err) {
			res.redirect("special-occassions");
		} else {
			res.redirect("/special-occassions");
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
function checkSpecialOccassionOwnership(req, res, next){
	// is User logged in?
	if (req.isAuthenticated){
				//if yes, then...
				SO.findById(req.params.id, function(err, foundCampground) { // finds all Blogs in database
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
