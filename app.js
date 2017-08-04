var express = require('express')
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose")
//Needed to edit and update campground
var methodOverride = require("method-override")
//User Authentication
var passport = require("passport")
var LocalStrategy = require("passport-local")
//Models
var User = require("./models/user")
var Campground = require("./models/campground")

//this creates the mongoDB database
mongoose.connect("mongodb://localhost/yelp_camp", {useMongoClient: true});
mongoose.Promise = global.Promise;
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs")
//needed for app.css
app.use(express.static('public'));
//Needed to edit and update campground
app.use(methodOverride("_method"));

//PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "Once again Rusty wins cutest dog!",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//ADDING middleware “{currentUser: req.user}” to all routes, so it can be used in the navbar
app.use(function(req, res, next) { // this makes this available on every route
	res.locals.currentUser = req.user; // whatever is connected to “res.locals” is available in our template
	next();
});

//Runs on PORT localhost:5000
var PORT = process.env.PORT || 5000

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

//Landing Page
app.get("/", function(req, res) {
	res.render("landing.ejs");
});

//(INDEX) - displays list of all campgrounds (linked to campgrounds.ejs)
//displays all the campgrounds found in the mongo database
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

//(NEW) - Displays form to create a new campground (linked to new.ejs)
app.get("/campgrounds/new", isLoggedIn, function(req, res) {
	res.render("new.ejs");
});
//(CREATE) - Adds a new campground
//to delete all campgrouds "db.campgrounds.drop()"
//posts a new campground then redirects to campgrounds.ejs 
app.post("/campgrounds", isLoggedIn, function(req, res) {
	//this grabs the data from the req.body.name and grabs name attribute on new.ejs
	var name = req.body.name
	var image = req.body.image
	var desc = req.body.description
	var newCampground = { 
							name: name, 
							image: image, 
							description: desc
						}
	var author = {
		id: req.user._id,
		username: req.user.username
	}
	var newCampground = { 
							name: name, 
							image: image, 
							description: desc,
							author: author
						}
	//Create a new campground and save to the mongoDB
	Campground.create(newCampground, function(err, newlyCreatedCampground){
		if(err) {
			console.log(err);
		} else {
			//redirect back tot he campgrounds page
			res.redirect("/campgrounds");
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
app.get("/campgrounds/:id/edit", checkCampgroundOwnership, function(req,res){
	//find the campground with provided ID (this finds all data in Mongo database)
	Campground.findById(req.params.id, function(err, foundCampground){
		if(err){
			} else {
				res.render("edit.ejs", {mycampground: foundCampground});
			}
	});	
});


//(Update campground) - Updates the edit campground
app.put("/campgrounds/:id/", checkCampgroundOwnership, function(req,res){
	//grabs name attribute from the form
	var editCampground = {
					name: req.body.name, 
					image: req.body.image,
					desc: req.body.description
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

//Delete a campground
app.delete("/campgrounds/:id", checkCampgroundOwnership, function(req, res){
	Campground.findByIdAndRemove(req.params.id, function(err){
		if(err) {
			res.redirect("/campgrounds");
		} else {
			res.redirect("/campgrounds");
		}
	});
}); 

// Authentication Routes

//***Registering a new user***
//Show register form
app.get("/register", function(req,res){
	res.render("register.ejs")
});
//Registers a new user
app.post("/register", function(req,res){
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
app.get("/login", function(req,res){
	res.render("login.ejs")
});
//Logging in with registered username
//passport.authenticate is middleware to check if you 
//already registered a username
//app.post("/login",middleware, callback)
app.post("/login", passport.authenticate("local", 
	{
		successRedirect: "/campgrounds",
		failureRedirect: "/login"
	}), function(req,res) {
});


//***Logout***
//Displays logout page
// app.get("/logout", function(req, res) {
// 	res.render("logout.ejs");
// });

// app.get('/logout', function(req,res) {
// 	req.logout();
// 	res.redirect("/logout");
// });

// //If not logged in, go to this page
// app.get("/unauthenticated", function(req, res) {
// 	res.render("unauthenticated.ejs");
// });

//Logout
app.get('/logout', isLoggedIn,  function(req,res) {
	res.render('logout.ejs')
});

//Logout route
app.get("/logout", isLoggedIn,  function(req, res) {
	req.logout(); // destroys all data from sessions
	res.redirect('/logout');
});

//Logout redirect page
app.get('/unauthenticated', function(req,res) {
	res.render('unauthenticated.ejs')
})


//middleware to check if user is logged in
//add to any route you need user to be logged in
function isLoggedIn(req, res, next) {
		if(req.isAuthenticated()) { // if user is logged in, then run next() which
		return next(); // refers to everything after isLoggedIn function
	}
	res.redirect('/unauthenticated'); // else redirect to login page if not logged in 
}

//middleware to check edit/update and destroy ownership
function checkCampgroundOwnership(req, res, next){
	// is User logged in?
	if (req.isAuthenticated){
				//if yes, then...
				Campground.findById(req.params.id, function(err, foundCampground) { // finds all Blogs in database
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


app.listen(PORT, function(){
  console.log('Server Running');
});
