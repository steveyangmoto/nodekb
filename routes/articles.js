const express = require('express');
const router = express.Router();
const {body, validationResult} = require('express-validator');

//bring in Article models
let Article = require('../models/article');
// User model
let User = require('../models/user')
//Add route
router.get('/add',ensureAuthenticated,(req,res)=>{
    res.render('add_article',{
        title:'Add Article'
    });
});

//Add submit POST route
router.post('/add',
    body('title',"Title is required").notEmpty(),
    body('body',"Body is required").isLength({min:5}),
    (req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        console.log(errors);
        res.render('add_article',{
            title: 'Add Article',
            errors:errors.array()
        });
    }else{
        let article = new Article();
        article.title = req.body.title;
        article.author = req.user._id;
        article.body = req.body.body;
    
        article.save((err)=>{
            if(err){
                console.log(`error occurred: ${err}`);
                return;
            }else{
                req.flash('success','Article Added');
                res.redirect('/');
            }
        });
    }
    
});

//load edit form
router.get('/edit/:id',ensureAuthenticated,(req,res)=>{
    Article.findById(req.params.id,(err,article)=>{
        if(article.author != req.user._id){
            req.flash('danger','Not Authorized');
            res.redirect('/');
        }
        res.render('edit_article',{
            title:'Edit Article',
            article:article
        });
    });
});
//update submit
router.post('/edit/:id',(req,res)=>{
    let article = {};
    article.title = req.body.title;
    article.author = req.body.author;
    article.body = req.body.body;

    let query = {_id:req.params.id}
    Article.update(query,article,(err)=>{
        if(err){
            console.log(err);
            return;
        }else{
            req.flash('success','Article updated');
            res.redirect('/');
        }
    });
});
//delete article
router.delete('/:id',(req,res)=>{
    if(!req.user._id){
        res.status(500).send();
    }
    let query = {_id:req.params.id}

    Article.findById(req.params.id,(err,article)=>{
        if(article.author != req.user._id){
            res.status(500).send();
        }else{
            Article.deleteOne(query,function(err){
                if(err){
                    console.log(err);
                    return;
                }
                res.send('Success');
            });
        }
    });
});

//get single article
router.get('/:id',(req,res)=>{
    Article.findById(req.params.id,(err,article)=>{
        User.findById(article.author,(err,user)=>{
            res.render('article',{
                article:article,
                author:user.name
            });
        });
    });
});

// Access Control
function ensureAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }else{
        req.flash('danger','Please login');
        res.redirect('/users/login');
    }
}
module.exports = router;