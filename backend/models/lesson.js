import Mongoose from 'mongoose';
const { Schema } = Mongoose;

const lessonSchema = new Schema({
    id: Number,
    Title: String,
});

const Lesson = Mongoose.model('lesson', lessonSchema);

export { Lesson }