import Mongoose from 'mongoose';
const validator = require('validator');
const { Schema, models, model } = Mongoose;

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