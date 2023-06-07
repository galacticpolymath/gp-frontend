import Mongoose from 'mongoose';
const { Schema, models } = Mongoose;

let Lessons = models.lessons;

if (!Lessons) {
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

    Lessons = Mongoose.model('lessons', lessonSchema);
}

export { Lessons } 