import Mongoose from 'mongoose';

const { Schema, models, model } = Mongoose;
let MailingListConfirmationModel = models.mailingListConfirmation;

if (!MailingListConfirmationModel) {
    MailingListConfirmationModel = new Schema({
        _id: String,
        email: String,
        expireAt: {
            type: Date,
            default: Date.now(),
        },
    }, { _id: false });
    MailingListConfirmationModel.index({ expireAt: 1 }, { expireAfterSeconds: 60 * 60 * 60 * 24 });
    JwtModel = model('jwt', JwtModel);
};

export default MailingListConfirmationModel;