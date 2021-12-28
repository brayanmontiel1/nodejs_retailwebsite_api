const router = require("express").Router();
const User = require("../models/User")
const CryptoJS = require("crypto-js");       //encryption using AES ciphers
const jwt = require("jsonwebtoken")
//AUTHENTICATION PAGE 

//REGISTER new user
router.post("/register", async (req,res)=>{         //syncs the new user to DB
    //can later use if statement to specify errors with new user(email, password, etc)
    const newUser = new User({
        username: req.body.username,
        email: req.body.email,
        password: CryptoJS.AES.encrypt(req.body.password, process.env.PASS_KEY).toString(),
    });

    try{            //awaits the new user being saved into DB
        const savedUser = await newUser.save();
        res.status(201).json(savedUser);     //201 means added new response
    }catch(err){    //error otherwise
        res.status(500).json(err);          
    }
    
});

//LOGIN function
router.post("/login", async (req,res)=>{
    try{            //awaits the new user pass retrieved from DB
        const user = await User.findOne({username: req.body.username});
        !user && res.status(401).json("Username not found.");
        //decrypt password
        const hashedPass = CryptoJS.AES.decrypt(user.password, process.env.PASS_KEY);
        const hashedPassword = hashedPass.toString(CryptoJS.enc.Utf8);
        //if password doesn't match, send error
        hashedPassword !== req.body.password && res.status(401).json("Incorrect password.");
        //create access token - verify users with json webtoken
        const accessToken = jwt.sign({
            id:user._id, 
            isAdmin: user.isAdmin,
        }, process.env.JWT_KEY,
        {expiresIn:"3d"}
        );
        //hide password, even from DB 
        const {password, ...others} = user._doc;
        //return success code otherwise
        res.status(200).json({...others, accessToken});
    }catch(err){    //error otherwise
        res.status(500).json(err);          
    }
});

module.exports = router