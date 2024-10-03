const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
    .then(()=>{
        console.log("connected to DB");
    })
    .catch((err) => {
        console.log(err);
    });

async function main(){
    await mongoose.connect(MONGO_URL)
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")))

app.get("/", (req, res) => {
    res.send("Hi, I am root");
});

//Index Route
//this returns all the data and its passed to index.ejs
app.get("/listings", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings});
}));

//New Route : Create
app.get("/listings/new", (req, res)=>{
    res.render("listings/new.ejs")
})

//Show Route : Read
app.get("/listings/:id", wrapAsync(async (req, res)=>{
    let {id} = req.params; // to extract the id
    //now add the app.use urlencoded line above
    const listing = await Listing.findById(id) // we get the data based on id
    res.render("listings/show.ejs", {listing});
}));

//Create Route
app.post(
    "/listings", 
    wrapAsync(async (req, res, next) =>{
        if(!req.body.listing){
            throw new ExpressError(400, "Send Valid data for listing")
        }
        const newListing = Listing(req.body.listing)
        await newListing.save();
        res.redirect("/listings");
    })
);

//Edit Route
app.get("/listings/:id/edit", wrapAsync(async (req, res)=>{
    let {id} = req.params; // to extract the id
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", {listing});
}));

//Update Route
app.put("/listings/:id", wrapAsync(async(req,res)=>{
    if(!req.body.listing){
        throw new ExpressError(400, "Send Valid data for listing")
    }
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing });
    res.redirect(`/listings/${id}`);
}));

//Delete Route
app.delete("/listings/:id", wrapAsync(async(req, res)=>{
    let {id} = req.params;
    let deletedListing = await Listing. findByIdAndDelete(id);
    res.redirect("/listings");
}));

// app.get("/testListing", async (req, res)=>{
//     let sampleListing = new Listing({
//         title: "My new Villa",
//         description: "By the Beach",
//         price: 12000,
//         location: "Calangute, Goa",
//         country: "India",
//     });
//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("successful testing");
// });

app.all("*", (req, res, next) =>{
    next(new ExpressError(404, "Page Not Found"));
});

app.use((err, req, res, next) => {
    let {statusCode = 500, message = "something went wrong!"} = err;
    res.render("error.ejs", {message});
    //res.status(statusCode).send(message);
});

app.listen(PORT, ()=>{
    console.log("server is listening on port 8080");
});
