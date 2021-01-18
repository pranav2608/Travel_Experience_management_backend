const mongoose = require("mongoose");
const uniqueVaidator = require("mongoose-unique-validator");


//Schema for the user collection in same database as that of places.
const userSchema = new mongoose.Schema({
    name:{type:String,required:true},
    email:{type:String,required:true,unique:true},
    password:{type:String,required:true,minlength:6},
    image:{type:String,required:true},
    places:[{type:mongoose.Types.ObjectId,required:true, ref: 'Place'}]
})

userSchema.plugin(uniqueVaidator);
module.exports = mongoose.model("User", userSchema);

