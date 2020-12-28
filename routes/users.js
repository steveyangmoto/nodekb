const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
//express validator
const {body, validationResult} = require('express-validator');
// Bring in User model
let User = require('../models/user');

// Register Form
router.get('/register',(req,res)=>{
    res.render('register');
});
//Register Process
router.post('/register',
        body('name','Name is required').notEmpty(),
        body('email','Email is required').notEmpty(),
        body('email','Email is not valid').isEmail(),
        body('username','Username is required').notEmpty(),
        body('password','Password is required').notEmpty(),
        body('password2','Passwords do not match').custom((value,{req})=>value==req.body.password),
        (req,res)=>{
    const name = req.body.name;
    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;
    const password2 = req.body.password2;

    const errors = validationResult(req);
    if(!errors.isEmpty()){
        res.render('register',{
            errors:errors.array()
        });
    }else{
        let newUser = new User({
            name:name,
            email:email,
            username:username,
            password:password,
        });
        bcrypt.genSalt(10,(_,salt)=>{
            bcrypt.hash(newUser.password,salt,(error,hash)=>{
                if(error) {
                    console.log(error);
                    return;
                }
                newUser.password = hash;
                newUser.save((err)=>{
                    if(err){
                        console.log(err);
                        return;
                    }else{
                        req.flash('success','You are now registered and can log in');
                        res.redirect('/users/login');
                    }
                });
            });
        });
    }
});
//Login Form
router.get('/login',(req,res)=>{
    res.render('login');
});

//Login Process
router.post('/login',(req,res,next)=>{
    passport.authenticate('local',{
        successRedirect : '/',
        failureRedirect : '/users/login',
        failureFlash: true
    })(req,res,next);
});

// Logout
router.get('/logout',(req,res)=>{
    req.logout();
    req.flash('success','You are logged out');
    res.redirect('/users/login');
});
module.exports = router;