const fs = require("fs");
const HttpError = require("../models/http-error");
const mongoose = require("mongoose");
const { v4: uuidv4 } = require('uuid');
const {validationResult} = require('express-validator');
const Place = require("../models/place");
const User =  require('../models/user');
const  getCoordsForAddress = require("../util/location");

//middleware to get place by placeID
const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;
  let place;
  try{
    place = await Place.findById(placeId); //query the database
  }catch(err){
    const error = new HttpError("Could not Find Place At this ID", 500);
    return next(error);
  }
  if (!place) {
    const error = new HttpError("Could not find the place provided at id", 404);
    return next(error);
  }
  res.json({ place: place.toObject({getters:true})});
};

//middleware to get places by userId(all the places of tht specific user)
const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;
  let places;
  try{
    places = await Place.find({creator: userId})
  }catch(err){
    const error = new HttpError("Could not Find Places At this userID", 500);
    return next(error);
  } 
  if (!places || places.length===0) {
    return next(
      new HttpError("Could not find the place provided at user ID", 404)
    );
  }
  res.json({ places: places.map(place=>place.toObject({getters:true}))});
};

//middleware to create a new place with specic userid and placeid
const createPlace = async (req,res,next)=>{
  const errors  = validationResult(req);
  if(!errors.isEmpty()){
    const error=new HttpError("Invalid Input passed, please check your data",422);
    return next(error);
  }
  const {title,description,address,date} = req.body;
  
  let coordinates;
  try{
    coordinates = await getCoordsForAddress(address);
  }
  catch(error){
    return next(error);
  }

  const createdPlace = new Place({
    title:title,
    description:description,
    address:address,
    date:date,
    location:coordinates,
    image:req.file.path,
    creator:req.userData.userId
  })
  //to get the user by its Id
  let user;
  try{
    user = await User.findById(req.userData.userId);
  }catch(err){
    const error = new HttpError("Creating Place failed, please try again later", 500)
    return next(error);
  }
  if(!user){
    const error = new HttpError("Could not find the user for provided id", 404);
    return next(error);
  }
  //a place created contains the user id to which it is linked to, so when a place is created, it gets linked to particular user
  //and a user conatins array of places which are created with its id
  try{
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdPlace.save({session:sess});
    user.places.push(createdPlace);
    await user.save({session:sess});
    await sess.commitTransaction();
  }catch(err){
    const error = new HttpError("Creating Place failed, please try again later", 500)
    return next(error);
  }
  res.status(201).json({place:createdPlace});
}

//middleware to update the place using patch route
const updatePlace = async(req, res, next) => {
  const errors  = validationResult(req);
  if(!errors.isEmpty()){
    return next(new HttpError("Invalid Input passed, please check your data",422))
  }
  const { title, description,date } = req.body;
  const placeId = req.params.pid;

  let place;
  try{
    place = await Place.findById(placeId);
  }catch(err){
    const error = new HttpError("Could not Update The Place", 500)
    return next(error);
  }

  if(place.creator.toString() !== req.userData.userId){
    const error = new HttpError("You are not allowed to edit this place", 401);
    return next(error);
  }

  place.title = title; //updation
  place.description = description;
  place.date = date;

  try{
    await place.save()
  }catch(err){
    const error = new HttpError("Could not Update The Place not found", 500)
    return next(error);
  }

  res.status(200).json({place: place.toObject({getters:true})});
};

//middleware to delete places in database by specific place id
const deletePlace = async (req,res,next)=>{
  const placeId = req.params.pid;

  let place;
  try{
    place = await Place.findById(placeId).populate("creator");//populate method is to get access to the user collcetion from places collection and make the changes req there
  }catch(err){
    const error = new HttpError("Could not Delete The Place", 500)
    return next(error);
  }
  if(!place){
    const error = new HttpError("Could not find the place", 404);
    return next(error);
  }

  if(place.creator.id !== req.userData.userId){
    const error = new HttpError("You are not allowed to edit this place", 401);
    return next(error);
  }


  const imagePath = place.image;

  try{
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await place.remove({session:sess});
    place.creator.places.pull(place);
    await place.creator.save({session:sess});
    await sess.commitTransaction();

  }catch(err){
    const error = new HttpError("Could not Update The Place as the place was not found", 500)
    return next(error);
  }

  fs.unlink(imagePath,err=>{
    console.log(err)
  })

  res.status(200).json({message:"Place deleted!"})

}

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
