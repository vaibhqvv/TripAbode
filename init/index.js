const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

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

const initDB = async () => {
    //this is to clean the database ie if there is already some random data in there will be deleted
    await Listing.deleteMany({})
    //insering the data
    await Listing.insertMany(initData.data);
    console.log("data was initialized");
}

initDB();