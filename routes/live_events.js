var express = require("express");
var router = express.Router();
var LE = require("../models/live-events");

//Live Events

//(INDEX) - displays list of all campgrounds (linked to campgrounds.ejs)
//displays all the campgrounds found in the mongo database
router.get("/live-events", function(req, res) {
	//Grabs the campground data from mongo database and displays it on campgrounds.ejs
	LE.find({}, function(err, allcampgrounds){
		if(err) {
			console.log(err);
		} else {
			res.render("live-events.ejs", {thecampgrounds: allcampgrounds});
		}
	});
});


//(NEW) - Displays form to create a new campground (linked to new.ejs)
router.get("/live-events/new", isLoggedIn, function(req, res) {
	res.render("newLiveEvents.ejs");
});


//(CREATE) - Adds a new campground
//to delete all campgrouds "db.campgrounds.drop()"
//posts a new campground then redirects to campgrounds.ejs 
router.post("/live-events", isLoggedIn, function(req, res) {
	//this grabs the data from the req.body.name and grabs name attribute on new.ejs
	var name = req.body.name
	var image = req.body.image
	var desc = req.body.description
	var author = {
		id: req.user._id,
		username: req.user.username
	}

	var newLiveEvent = { 
							name: name, 
							image: image, 
							description: desc,
							author: author
						}

	//Create a new campground and save to the mongoDB
	LE.create(newLiveEvent, function(err, newlyCreatedCampground){
		if(err) {
			console.log(err);
		} else {
			//redirect back tot he campgrounds page
			res.redirect("/live-events");
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
router.get("/live-events/:id", function(req,res){
	//find the campground with provided ID (this finds all data in Mongo database)
	LE.findById(req.params.id, function(err, foundCampground){
		if(err){
			} else {
				res.render("showLiveEvents.ejs", {showCampground: foundCampground});

			}
	});	
});

 //(Edit) - Edits a campground (this is linked with edit.ejs)
router.get("/live-events/:id/edit", checkLiveEventOwnership, function(req,res){
	//find the campground with provided ID (this finds all data in Mongo database)
	LE.findById(req.params.id, function(err, foundCampground){
		if(err){
			} else {
				res.render("editLiveEvents.ejs", {mycampground: foundCampground});
			}
	});	
});

//(Update campground) - Updates the edit campground
router.put("/live-events/:id/", checkLiveEventOwnership, function(req,res){
	//grabs name attribute from the form
	var editLiveEvent = {
					name: req.body.name, 
					image: req.body.image,
					desc: req.body.description
				}
	//find and update the campground
	LE.findByIdAndUpdate(req.params.id, editLiveEvent, function(err, updatedCampground){
			if (err) {
				res.redirect("/live-events");
			} else {
				//redirect to show.ejs
				res.redirect("/live-events/" + updatedCampground._id)

			}
	});
});

//Delete a campground
//to delete all campgrouds "db.campgrounds.drop()"
router.delete("/live-events/:id", checkLiveEventOwnership, function(req, res){
	LE.findByIdAndRemove(req.params.id, function(err){
		if(err) {
			res.redirect("live-events");
		} else {
			res.redirect("/live-events");
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
function checkLiveEventOwnership(req, res, next){
	// is User logged in?
	if (req.isAuthenticated){
				//if yes, then...
				LE.findById(req.params.id, function(err, foundCampground) { // finds all Blogs in database
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