const mongoose = require("mongoose")


const blogSchema = mongoose.Schema({
    title : {type : String, required : true},
    category : {type : String},
    author : {type : String},
    content : {type : String},    
    user_id : {type : String, required : true}
})

const blogModel = mongoose.model("blog", blogSchema)

module.exports = {blogModel}