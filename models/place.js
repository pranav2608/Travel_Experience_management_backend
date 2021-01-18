const mongoose = require("mongoose");

//Schema for Places to be stored in mongoDB database
const placeSchema = new mongoose.Schema({
    title:{type:String, required:true},
    description:{type:String, required:true},
    image:{type:String, required:true},
    address:{type:String, required:true},
    date:{type:String,required:true},
    location:{
        lat:{type:Number,required:true},
        lng:{type:Number,required:true},
    },
    creator:{type:mongoose.Types.ObjectId,required:true, ref: 'User'}
})

module.exports = mongoose.model("Place", placeSchema);