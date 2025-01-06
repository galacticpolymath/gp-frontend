import Mongoose from 'mongoose';

const { Schema, models, model } = Mongoose;
let MailingListConfirmation = models.mailingListConfirmation;

if (!MailingListConfirmation) {
    MailingListConfirmation = new Schema({
        _id: String,
        email: String,
        expireAt: {
            type: Date,
            default: Date.now(),
        },
    }, { _id: false });
    MailingListConfirmation.index({ expireAt: 1 }, { expireAfterSeconds: 60 * 60 * 60 * 24 });

    MailingListConfirmation = model('mailingListConfirmations', MailingListConfirmation);
};

export default MailingListConfirmation;