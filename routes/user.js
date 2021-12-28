const User = require("../models/User")
const { verifyToken, verifyTokenandAuthorization, verifyTokenandAdmin } = require("./verifyToken");
const router = require("express").Router();

//verify if user making req is the same verified user, then can update user 
router.put("/:id", verifyTokenandAuthorization, async (req,res)=>{
    if(req.body.password){
        req.body.password = CryptoJS.AES.encrypt(req.body.password, process.env.PASS_KEY).toString();
    }
    try{
        const updatedUser = await User.findByIdAndUpdate(req.params.id, 
            {
                $set: req.body
            },
            {new:true}
        );
        res.status(200).json(updatedUser);
    }catch(err) {
        res.status(500).json(err);
    }
});

//Delete
router.delete("/:id", verifyTokenandAuthorization, async (req,res)=>{
    try{
        await User.findByIdAndDelete(req.params.id);
        res.status(200).json("User has been deleted.");
    }catch(err){
        res.status(500).json(err);
    }
});

//Get user
router.get("/find/:id", verifyTokenandAdmin, async (req,res)=>{
    try{
        const user = await User.findById(req.params.id);
        //avoid showing password
        const {password, ...others} = user._doc;
        res.status(200).json(others);
    }catch(err){
        res.status(500).json(err);
    }
});

//Get all users
router.get("/", verifyTokenandAdmin, async (req,res)=>{
    //query for new users
    const query = req.query.new;
    try{
        //if a query for new users, return 10, otherwise return all
        const users = query 
          ? await User.find().sort({_id: -1}).limit(10) 
          : await User.find();
        res.status(200).json(users);
    }catch(err){
        res.status(500).json(err);
    }
});

//GET USER STATS
router.get("/stats", verifyTokenandAdmin, async (req,res)=>{
    const date = new Date();
    const lastYear = new Date(date.setFullYear(date.getFullYear() -1));

    try{
        const data = await User.aggregate([
            {$match: {createdAt: {$gte: lastYear}}},
            {
                $project:{
                    month: {$month: "$createdAt"},
                },
            },
            {
                $group: {
                    _id: "$month",
                    total:{$sum: 1},
                },
            },
        ]);
        res.status(200).json(data);
    }catch(Err){
        res.status(500).json(err);
    }
});

module.exports = router
