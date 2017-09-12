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
var aboutRoutes = require("./routes/about")
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
app.use(aboutRoutes);
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

//Runs on PORT localhost:5000
var PORT = process.env.PORT || 7000

app.listen(PORT, function(){
  console.log('Server Running');
});
