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
var People = require("./models/people")
var SO = require("./models/special-occassions")
var LE = require("./models/live-events")
var Personal = require("./models/personal")

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

//Runs on PORT localhost:5000
var PORT = process.env.PORT || 5000

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

//Landing Page
app.get("/", function(req, res) {
	res.render("landing.ejs");
});

//Portfolio Page
app.get("/portfolio", function(req, res) {
	res.render("portfolio.ejs");
});

//Contact Page
app.get("/contact", function(req, res) {
	res.render("contact.ejs");
});

// ***********About Page**************
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



// *********People************

//(INDEX) - displays list of all campgrounds (linked to campgrounds.ejs)
//displays all the campgrounds found in the mongo database
app.get("/campgrounds", function(req, res) {
	//Grabs the campground data from mongo database and displays it on campgrounds.ejs
	People.find({}, function(err, allcampgrounds){
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
	var author = {
		id: req.user._id,
		username: req.user.username
	}

	var newPeople = { 
							name: name, 
							image: image, 
							description: desc,
							author: author
						}
	//Create a new campground and save to the mongoDB
	People.create(newPeople, function(err, newlyCreatedCampground){
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
	People.findById(req.params.id, function(err, foundCampground){
		if(err){
			} else {
				res.render("show.ejs", {showCampground: foundCampground});

			}
	});	
});

 //(Edit) - Edits a campground (this is linked with edit.ejs)
app.get("/campgrounds/:id/edit", checkPeopleOwnership, function(req,res){
	//find the campground with provided ID (this finds all data in Mongo database)
	People.findById(req.params.id, function(err, foundCampground){
		if(err){
			} else {
				res.render("edit.ejs", {mycampground: foundCampground});
			}
	});	
});


//(Update campground) - Updates the edit campground
app.put("/campgrounds/:id/", checkPeopleOwnership, function(req,res){
	//grabs name attribute from the form
	var editCampground = {
					name: req.body.name, 
					image: req.body.image,
					desc: req.body.description
				}
	//find and update the campground
	People.findByIdAndUpdate(req.params.id, editCampground, function(err, updatedCampground){
			if (err) {
				res.redirect("/campgrounds");
			} else {
				//redirect to show.ejs
				res.redirect("/campgrounds/" + updatedCampground._id)

			}
	});
});

//Delete a campground
//to delete all campgrouds "db.campgrounds.drop()"
app.delete("/campgrounds/:id", checkPeopleOwnership, function(req, res){
	People.findByIdAndRemove(req.params.id, function(err){
		if(err) {
			res.redirect("/campgrounds");
		} else {
			res.redirect("/campgrounds");
		}
	});
}); 



//***************************************************

// Special Occassions Page

//(INDEX) - displays list of all campgrounds (linked to campgrounds.ejs)
//displays all the campgrounds found in the mongo database
app.get("/special-occassions", function(req, res) {
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
app.get("/special-occassions/new", isLoggedIn, function(req, res) {
	res.render("newspecialoccassion.ejs");
});

//(CREATE) - Adds a new campground
//to delete all campgrouds "db.campgrounds.drop()"
//posts a new campground then redirects to campgrounds.ejs 
app.post("/special-occassions", isLoggedIn, function(req, res) {
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
app.get("/special-occassions/:id", function(req,res){
	//find the campground with provided ID (this finds all data in Mongo database)
	SO.findById(req.params.id, function(err, foundCampground){
		if(err){
			} else {
				res.render("showspecialoccassion.ejs", {showCampground: foundCampground});

			}
	});	
});

 //(Edit) - Edits a campground (this is linked with edit.ejs)
app.get("/special-occassions/:id/edit", checkSpecialOccassionOwnership, function(req,res){
	//find the campground with provided ID (this finds all data in Mongo database)
	SO.findById(req.params.id, function(err, foundCampground){
		if(err){
			} else {
				res.render("editspecialoccassions.ejs", {mycampground: foundCampground});
			}
	});	
});

//(Update campground) - Updates the edit campground
app.put("/special-occassions/:id/", checkSpecialOccassionOwnership, function(req,res){
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
app.delete("/special-occassions/:id", checkSpecialOccassionOwnership, function(req, res){
	SO.findByIdAndRemove(req.params.id, function(err){
		if(err) {
			res.redirect("special-occassions");
		} else {
			res.redirect("/special-occassions");
		}
	});
}); 


//***************************************************

//Live Events

//(INDEX) - displays list of all campgrounds (linked to campgrounds.ejs)
//displays all the campgrounds found in the mongo database
app.get("/live-events", function(req, res) {
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
app.get("/live-events/new", isLoggedIn, function(req, res) {
	res.render("newLiveEvents.ejs");
});


//(CREATE) - Adds a new campground
//to delete all campgrouds "db.campgrounds.drop()"
//posts a new campground then redirects to campgrounds.ejs 
app.post("/live-events", isLoggedIn, function(req, res) {
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
app.get("/live-events/:id", function(req,res){
	//find the campground with provided ID (this finds all data in Mongo database)
	LE.findById(req.params.id, function(err, foundCampground){
		if(err){
			} else {
				res.render("showLiveEvents.ejs", {showCampground: foundCampground});

			}
	});	
});

 //(Edit) - Edits a campground (this is linked with edit.ejs)
app.get("/live-events/:id/edit", checkLiveEventOwnership, function(req,res){
	//find the campground with provided ID (this finds all data in Mongo database)
	LE.findById(req.params.id, function(err, foundCampground){
		if(err){
			} else {
				res.render("editLiveEvents.ejs", {mycampground: foundCampground});
			}
	});	
});

//(Update campground) - Updates the edit campground
app.put("/live-events/:id/", checkLiveEventOwnership, function(req,res){
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
app.delete("/live-events/:id", checkLiveEventOwnership, function(req, res){
	LE.findByIdAndRemove(req.params.id, function(err){
		if(err) {
			res.redirect("live-events");
		} else {
			res.redirect("/live-events");
		}
	});
}); 

//***************************************************

//Personal

//(INDEX) - displays list of all campgrounds (linked to campgrounds.ejs)
//displays all the campgrounds found in the mongo database
app.get("/personal", function(req, res) {
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
app.get("/personal/new", isLoggedIn, function(req, res) {
	res.render("newPersonal.ejs");
});

//(CREATE) - Adds a new campground
//to delete all campgrouds "db.campgrounds.drop()"
//posts a new campground then redirects to campgrounds.ejs 
app.post("/personal", isLoggedIn, function(req, res) {
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
app.get("/personal/:id", function(req,res){
	//find the campground with provided ID (this finds all data in Mongo database)
	Personal.findById(req.params.id, function(err, foundCampground){
		if(err){
			} else {
				res.render("showPersonal.ejs", {showCampground: foundCampground});

			}
	});	
});

 //(Edit) - Edits a campground (this is linked with edit.ejs)
app.get("/personal/:id/edit", checkPersonalOwnership, function(req,res){
	//find the campground with provided ID (this finds all data in Mongo database)
	Personal.findById(req.params.id, function(err, foundCampground){
		if(err){
			} else {
				res.render("editPersonal.ejs", {mycampground: foundCampground});
			}
	});	
});

//(Update campground) - Updates the edit campground
app.put("/personal/:id/", checkPersonalOwnership, function(req,res){
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
app.delete("/personal/:id", checkPersonalOwnership, function(req, res){
	Personal.findByIdAndRemove(req.params.id, function(err){
		if(err) {
			res.redirect("personal");
		} else {
			res.redirect("/personal");
		}
	});
}); 

// to delete "db.peoples.drop()"

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
		successRedirect: "/portfolio",
		failureRedirect: "/unauthenticated"
	}), function(req,res) {
});

// ***Logout***
// Displays logout page
app.get('/logout', isLoggedIn, function(req, res) {
	req.logout();
	res.redirect("/login");
});

//If not logged in, go to this page
app.get("/unauthenticated", function(req, res) {
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



app.listen(PORT, function(){
  console.log('Server Running');
});
