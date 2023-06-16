import Mongoose from 'mongoose';
const validator = require('validator');
const { Schema, models, model } = Mongoose;

// if the users model exist, then store it into the User variable 
// if the user model does not exist, then create the user variable that will hold the schema 

// BRAIN DUMP:
// each user will have a role, the user that has a read write role will be able to write to the database 


let User = models.users;

if (!models.users) {
    const RoleSchema = new Schema({
        role: String,
        db: String
    })
    User = new Schema({
        // the _id will be the user's email address
        _id: String,
        password: String,
        roles: [RoleSchema]
    }, { _id: false })
    User = model('users', User);
}

export default User;