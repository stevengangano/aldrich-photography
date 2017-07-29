var express = require('express')
var app = express();
var bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

var PORT = process.env.PORT || 5000


app.get("/", function(req, res) {
	res.render("landing.ejs");
});

var campgrounds = [
	{name: "Salmon Creek", image: "https://www.google.com/logos/doodles/2017/100th-anniversary-of-the-silent-parade-4623481009340416.5-l.png"},
	{name: "Granite Hill", image: "https://www.google.com/logos/doodles/2017/100th-anniversary-of-the-silent-parade-4623481009340416.5-l.png"},
	{name: "Goat Creek", image: "https://www.google.com/logos/doodles/2017/100th-anniversary-of-the-silent-parade-4623481009340416.5-l.png"}
]
//displays all the campgrounds
app.get("/campgrounds", function(req, res) {
	//" var campgrounds"is moved above so it doesn't repost again

	//{named anything you want: variable object}
	//res.render(page name, data you want to pass)
	res.render("campgrounds.ejs", {thecampgrounds: campgrounds});
});

//posts the new campground which dispalys all the campgrounds
app.post("/campgrounds", function(req, res) {
	//get data from from form and add to "var = campgrounds" array
	//this grabs the data from the req.body.name grabs name attribute on new.ejs
	var name = req.body.name
	var image = req.body.image
	var newCampground = {name: name, image: image}
	//pushes new campground to the array with format above
	campgrounds.push(newCampground)
	//redirect back to campgrounds page	
	res.redirect("/campgrounds");
	
});

//the form to create a new campground
app.get("/campgrounds/new", function(req, res) {
	res.render("new.ejs");
});



app.listen(PORT, function(){
  console.log('Server Running');
});
