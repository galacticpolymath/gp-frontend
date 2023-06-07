import Mongoose from 'mongoose';

const { Schema } = Mongoose;
const requiredNumberVal = {
    type: Number,
    required: true,
};
const requiredStringVal = {
    type: String,
    required: true,
};
const lessonSchema = new Schema({
    _id: requiredNumberVal,
    Title: requiredStringVal
});
const Lessons = Mongoose.model('lessons', lessonSchema);

export { Lessons }