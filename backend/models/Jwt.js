import Mongoose from 'mongoose';

const { Schema, models, model } = Mongoose;
let JwtModel = models?.jwt;

if (!JwtModel) {
  JwtModel = new Schema({
    _id: String,
    refresh: String,
    access: { type: String, required: true },
    expireAt: {
      type: Date,
      default: Date.now(),
    },
  }, { _id: false });
  // TODO: have the expiration time be a dynamic value
  JwtModel.index({ expireAt: 1 }, { expireAfterSeconds: 30 });
  JwtModel = model('jwt', JwtModel);
}

export default JwtModel;