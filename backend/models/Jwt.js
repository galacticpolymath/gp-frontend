// _id: the id of the user
// jwt: the jwt
// set the expiration to 30 seconds
import Mongoose from 'mongoose';

const { Schema, models, model } = Mongoose;
let JwtModel = models?.jwt;

if (!JwtModel) {
  JwtModel = new Schema({
    _id: String,
    jwt: String,
    expireAt: {
      type: Date,
      default: Date.now(),
    },
  }, { _id: false });
  JwtModel.index({ expireAt: 1 }, { expireAfterSeconds: 30 });
  JwtModel = model('jwt', JwtModel);
}

export default JwtModel;