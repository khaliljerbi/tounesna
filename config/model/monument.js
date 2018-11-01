var mongoose= require('mongoose');
var bcrypt = require('bcrypt-nodejs'); 

var monumentSchema= new mongoose.Schema({

   
        nom:String,
        description:String,
        ville: String,
        cla:String,
        clo:String,
        video:String
    
});


module.exports=mongoose.model('Monuments',monumentSchema);