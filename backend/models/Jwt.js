import Mongoose from 'mongoose';

const { Schema, models, model } = Mongoose;
let JwtModel = models?.jwt;

if (!JwtModel) {
  JwtModel = new Schema({
    _id: String,
    refresh: String,
    access: String,
    expireAt: {
      type: Date,
      default: Date.now(),
    },
  }, { _id: false });
  JwtModel.index({ expireAt: 1 }, { expireAfterSeconds: 30 });
  JwtModel = model('jwt', JwtModel);
}

export default JwtModel;