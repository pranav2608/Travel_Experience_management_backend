const fs =  require("fs");
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const placesRoutes = require("./routes/places-routes");
const usersRoutes = require("./routes/user-routes");
const HttpError  = require("./models/http-error");

const app = express();
app.use(bodyParser.json());

app.use('/uploads/images',express.static(path.join("uploads","images")))

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');

  next();
});

//main middleware function imported from places-router.js
app.use("/api/places",placesRoutes);

//main middleware function for user-router.js
app.use("/api/users", usersRoutes);

//if user writes wrong url, then also throw error
/*app.use((req,res,next)=>{
  const error = new HttpError("Could not find this route.", 404);
  throw error;
})*/

//for error handling purpose only!
app.use((error, req, res, next) => {
    if(req.file){
      fs.unlink(req.file.path,(err)=>{
        console.log(err);
      })
    }
    if (res.headerSent) {
      return next(error);
    }
    res.status(error.code || 500)
    res.json({message: error.message || 'An unknown error occurred!'});
  });


//connection of my node server to mongoDB cloud Database

mongoose.connect("mongodb+srv://pranav:abpa567y@cluster0.1r9qq.mongodb.net/projectDB?retryWrites=true&w=majority",{useNewUrlParser:true,useUnifiedTopology:true})
.then(()=>{
  app.listen(5000,()=>{
    console.log("Server Started At Port 5000");
  });
})
.catch(err =>{
  console.log(err);
})

