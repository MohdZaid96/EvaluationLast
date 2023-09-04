const express = require("express")
const jwt = require("jsonwebtoken")
const bcrypt = require('bcrypt');
require("dotenv").config()
const cors = require("cors")
const app=express();
const {connection}=require('./config/db');
const {blogModel}=require("./models/Blog.model")
const {UserModel}=require("./models/User.model")
const {authentication}=require("./middlewares/authentication.middleware")

app.use(express.json());
app.use(cors({
    origin:"*"
}))



app.get("/", (req, res) => {
    res.send("base API endpoint")
})

app.post("/signup", async (req, res) => {
    const {email, password, name, city} = req.body;
    const is_user = await UserModel.findOne({email : email})
    if(is_user){
        res.send({msg : "Email already registered, Try signing in?"})
    }
    bcrypt.hash(password, 3, async function(err, hash) {
        const new_user = new UserModel({
            email,
            password : hash,
            name,
            city
        })
        await new_user.save()
        res.send({msg : "Sign up successfull"})
    });
})

app.post("/login", async (req, res) => {
    const {email, password} = req.body;
    const is_user = await UserModel.findOne({email})
    if(is_user){
        const hashed_pwd = is_user.password
        bcrypt.compare(password, hashed_pwd, function(err, result) {
            if(result){
                const token = jwt.sign({userID : is_user._id}, process.env.SECRET_KEY)
                res.send({msg : "Login successfull", token : token})
            }
            else{
                res.send("Login failed")
            }
        });
    }
    else{
        res.send("Sign up first")
    }
})






app.get("/blogs", async (req, res) => {
    try{
        const blogs = await blogModel.find()
        res.send({blogs})
    }
    catch(err){
        console.log(err)
        res.send({msg : "something went wrong, please try again later"})
    }
})

app.use(authentication)

app.post("/blogs/add", async (req, res) => {
    const {title, status, category} = req.body;
    const userID = req.userID
    const new_blog = new blogModel({
        title,
        status,
        category,
        user_id : userID
    })
    try{
        await new_blog.save()
        return res.send({msg : "task successfully added"})
    }
    catch(err){
        console.log(err)
        res.send({msg : "something went wrong"})
    }
})


app.delete("/blogs/:blogID", async (req, res) => {
    const {blogID} = req.params
    try{
        const blogs = await blogModel.findOneAndDelete({_id:blogID, user_id : req.userID})
        if(blogs){
            res.send({msg : "Task deleted successfully"})
        }
        else{
            res.send({msg : "Task not found"})
        }
    }
    catch(err){
        console.log(err)
        res.send({msg : "something went wrong"})
    }
})

app.put("/blogs/:blogID", async (req, res) => {
    const {blogID} = req.params
    const {title,category,author,content,user_id }=req.body;
    try{
        const blogs = await blogModel.updateOne({_id:blogID, user_id : req.userID},{$set:{title,category,author,content,user_id }});
        if(blogs){
            res.send({msg : "Task Updated successfully"})
        }
        else{
            res.send({msg : "Task not found"})
        }
    }
    catch(err){
        console.log(err)
        res.send({msg : "something went wrong"})
    }
})



app.listen(process.env.PORT,async()=>{
    try {
        await connection;
        console.log("Connected to db")
        
    } catch (err) {
        console.log("ERROR occures when try to connect to db")
        console.log(err)
    }
   
})