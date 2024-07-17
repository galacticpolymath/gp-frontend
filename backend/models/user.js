import Mongoose from 'mongoose';
const { Schema, models, model } = Mongoose;

let User = models.users;

if (!models.users) {
  const RoleSchema = new Schema({
    role: String,
    db: String,
  });
  User = new Schema({
    _id: { type: String, required: true },
    email: { type: String, required: true}, 
    password: String,
    emailVerified: Date,
    roles: { type: [String], required: true },
  }, { _id: false });
  User = model('users', User);
}

export default User;