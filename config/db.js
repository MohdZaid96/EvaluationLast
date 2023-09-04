const mongoose = require("mongoose")
require("dotenv").config()

  

const connection = mongoose.connect(`${process.env.MONGO_URL}/blogapp`)
        
    module.exports = {
        connection
    }
