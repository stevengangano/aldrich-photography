var express = require('express')
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose")
//Needed to edit and update campground
var methodOverride = require("method-override")
//User Authentication
var passport = require("passport")
var LocalStrategy = require("passport-local")
var passportLocalMongoose = require ('passport-local-mongoose');

//Models
var User = require("./models/user")

//Refactored routes
var indexRoutes = require("./routes/index")
var peopleRoutes = require("./routes/people")
var specialOccassionRoutes = require("./routes/special_occassions")
var liveEventRoutes = require("./routes/live_events")
var personalRoutes = require("./routes/personal")

//this creates the mongoDB database
mongoose.connect("steven:gangano@ds129183.mlab.com:29183/photography");
// mongoose.connect("mongodb://localhost/yelp_camp", {useMongoClient: true});


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

//Refactored Routes
app.use(indexRoutes);
app.use(peopleRoutes);
app.use(specialOccassionRoutes);
app.use(liveEventRoutes);
app.use(personalRoutes);

//Creating a new campground to add to the mongo database
// LE.create(
// 	{
// 		name: "Aldrich",
// 		image: "http://budfactory.in/webresources/images/Bboying-in-India1.jpg",
// 		description: "Best locker in the world"
// 	}, function(err, campground) {
// 		if(err){
// 			console.log(err);
// 		} else { 
// 			console.log("Newly Created Campground")
// 			console.log(campground)
// 		}
// 	});

//Portfolio Page
app.get("/portfolio", function(req, res) {
	res.render("portfolio.ejs");
});

//Contact Page
app.get("/contact", function(req, res) {
	res.render("contact.ejs");
});

var About = require("./models/about");

//(INDEX) - displays list of all campgrounds (linked to campgrounds.ejs)
//displays all the campgrounds found in the mongo database
app.get("/about", function(req, res) {
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
app.get("/about/new", isLoggedIn, function(req, res) {
	res.render("newAbout.ejs");
});

//(CREATE) - Adds a new campground
//to delete all campgrouds "db.campgrounds.drop()"
//posts a new campground then redirects to campgrounds.ejs 
app.post("/about", isLoggedIn, function(req, res) {
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
app.get("/about/:id", function(req,res){
	//find the campground with provided ID (this finds all data in Mongo database)
	About.findById(req.params.id, function(err, foundCampground){
		if(err){
			} else {
				res.render("showAbout.ejs", {showCampground: foundCampground});

			}
	});	
});

 //(Edit) - Edits a campground (this is linked with edit.ejs)
app.get("/about/:id/edit", checkAboutOwnership, function(req,res){
	//find the campground with provided ID (this finds all data in Mongo database)
	About.findById(req.params.id, function(err, foundCampground){
		if(err){
			} else {
				res.render("editAbout.ejs", {mycampground: foundCampground});
			}
	});	
});

//(Update campground) - Updates the edit campground
app.put("/about/:id/", checkAboutOwnership, function(req,res){
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
app.delete("/about/:id", checkAboutOwnership, function(req, res){
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


//Runs on PORT localhost:5000
var PORT = process.env.PORT || 5000

app.listen(PORT, function(){
  console.log('Server Running');
});
