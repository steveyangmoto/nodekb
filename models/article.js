let mongoose1 = require('mongoose');

//Article Schema
let articleSchema = mongoose1.Schema({
    title:{
        type:String,
        required:true
    },
    author:{
        type:String,
        required:true
    },
    body:{
        type:String,
        required:true
    }
});

let Article = module.exports = mongoose1.model('Article',articleSchema);