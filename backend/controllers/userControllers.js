import asyncHandler from "express-async-handler";
import User from "../model/userModel.js";
import generateToken from "../config/generateToken.js";

const registerUser= asyncHandler(async(req,res)=>{
    const {name, email,password, pic}=req.body;
    if(!name || !email || !password)
    {
        res.status(400);
        throw new Error("Please Enter The all Feilds");
    }
    const userExists=await User.findOne({email});
    if(userExists)
    {
        res.status(400);
        throw new Error("User already exists");
    }
    const user=await User.create({
        name,
        email,
        password,
        pic,
    });
    if(user)
    {
        res.status(201).json({
            _id:user._id,
            name:user.name,
            email:user.email,
            pic:user.pic,
            token:generateToken(user._id),
        })
    }
    else{
        res.status(400);
        throw new Error("Faild to Create the User");
    }
});

const authUser= asyncHandler(async(req,res)=>{
 const {email,password}=req.body;
 const user=await User.findOne({email});
 if(user && (await user.matchPassword(password)))
 {
   res.json({
       _id:user._id,
            name:user.name,
            email:user.email,
            pic:user.pic,
            token:generateToken(user._id),
   })
 }
 else{
    res.status(401);
        throw new Error("Invalid Email or Password");
 }
});

//api/user?search=piyush
const allUsers = asyncHandler(async (req, res) => {
    const keyword = req.query.search 
    ? {
      $or: [
        {name: {$regex: req.query.search, $options: "i"}},
        {email: {$regex: req.query.search, $options: "i"}},
      ]
    }:{}
    const users= await User.find(keyword).find({_id: {$ne:req.user._id}});
    res.send(users);
});



export { registerUser, authUser, allUsers };
