const express = require('express');
const path = require('path');
const mongoose2 = require('mongoose');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const config = require('./config/database');

mongoose2.connect(config.database);
let db = mongoose2.connection;
//check connection
db.once('open',()=>{
    console.log("connected to mongoDB");
});
//check for db errors
db.on('error',(error)=>{
    console.log(error);
});
//init app
const app = express();

//bring in models
let Article = require('./models/article');

//load view engine
app.set('views',path.join(__dirname,'views'));
app.set('view engine','pug');

//body parser middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

//validator
app.use(express.json());

//set public folder
app.use(express.static(path.join(__dirname,'public')));

//express session middleware
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
}))

//express messages middleware
app.use(require('connect-flash')());
app.use(function(req,res,next){
    res.locals.messages = require('express-messages')(req,res);
    next();
});
// Passport config
require('./config/passport')(passport);
// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*',(req,res,next)=>{
    res.locals.user = req.user || null;
    next();
});
//home route
app.get('/',(req,res)=>{
   Article.find({},(err,articles)=>{
       if(err){
           console.log(err);
       }else{
        res.render('index',{
            title:'Articles',
            articles:articles,
        });
       }
   });
});

let articles = require('./routes/articles');
let users = require('./routes/users');

app.use('/articles',articles);
app.use('/users',users);

//start server
app.listen(3000,()=>{
    console.log("server started on port 3000...");
})