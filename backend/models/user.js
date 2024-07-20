import Mongoose from 'mongoose';
const { Schema, models, model } = Mongoose;

let User = models.users;

if (!models.users) {
  const PasswordSchema = new Schema({
    hash: { type: String, required: true },
    salt: { type: String, required: true },
    iterations: { type: Number, required: true },
  });
  const UserSchema = new Schema({
    _id: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: PasswordSchema, required: false },
    // 'google' | 'credentials' 
    provider: String,
    emailVerified: Date,
    roles: { type: [String], required: true },
  });
  User = UserSchema;
  User = model('users', User);
}

export default User;