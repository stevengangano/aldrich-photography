var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");

//Landing Page
router.get("/", function(req, res) {
	res.render("landing.ejs");
});

// Authentication Routes

//***Registering a new user***
//Show register form
router.get("/register", function(req,res){
	res.render("register.ejs")
});

//Registers a new user
router.post("/register", function(req,res){
	//Not including the "req.body.password" inside newUser({}) hides the password
	var newUser = new User({username: req.body.username});
	User.register(newUser, req.body.password, function(err, suer){
		//if unnable to register, redirect to register.ejs
		if(err) {
			console.log(err);
			return res.render("register.ejs")
		} 
		//else you have logged in, redirect campgrounds page
		passport.authenticate("local")(req, res, function(){
			res.redirect("/campgrounds");
		});
	});
});

//***Logging in with your already registered username
//Show login form
router.get("/login", function(req,res){
	res.render("login.ejs")
});
//Logging in with registered username
//passport.authenticate is middleware to check if you 
//already registered a username
//app.post("/login",middleware, callback)
router.post("/login", passport.authenticate("local", 
	{
		successRedirect: "/portfolio",
		failureRedirect: "/unauthenticated"
	}), function(req,res) {
});

// ***Logout***
// Displays logout page
router.get('/logout', isLoggedIn, function(req, res) {
	req.logout();
	res.redirect("/portfolio");
});

//If not logged in, go to this page
router.get("/unauthenticated", function(req, res) {
	res.render("unauthenticated.ejs");
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
function checkPeopleOwnership(req, res, next){
	// is User logged in?
	if (req.isAuthenticated){
				//if yes, then...
				People.findById(req.params.id, function(err, foundCampground) { // finds all Blogs in database
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