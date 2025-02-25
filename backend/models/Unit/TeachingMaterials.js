import { unitSectionObj } from "./Section";

// Sub-schemas
const LinkSchema = new Schema({
    linkText: String,
    url: [String]
});

const ItemSchema = new Schema({
    itemTitle: String,
    itemDescription: String,
    itemCat: String,
    links: [LinkSchema]
});

const LessonSchema = new Schema({
    lsn: String,
    title: String,
    tags: [[String]],
    preface: String,
    tile: String,
    itemList: [ItemSchema]
});

const GradeVariantNoteSchema = new Schema({
    lsn: String,
    lsnGradeVarNotes: String
});

const ResourceSchema = new Schema({
    grades: String,
    gradePrefix: String,
    links: LinkSchema,
    lessons: [LessonSchema]
});

const ClassroomSchema = new Schema({
    gradeVariantNotes: [GradeVariantNoteSchema],
    resources: [ResourceSchema]
});

const StepSchema = new Schema({
    Step: Number,
    StepTitle: String,
    StepQuickDescription: String,
    StepDetails: String,
    Vocab: String,
    VariantNotes: String,
    TeachingTips: String
});

const ChunkSchema = new Schema({
    chunkTitle: String,
    chunkStart: Number,
    chunkDur: Number,
    steps: [StepSchema]
});

const LsnPrepSchema = new Schema({
    prepTitle: String,
    prepDur: Number,
    prepQuickDescription: String,
    prepDetails: String,
    prepVariantNotes: String,
    prepTeachingTips: String
});

const LsnExtSchema = new Schema({
    item: Number,
    itemTitle: String,
    itemDescription: String,
    itemLink: String
});

const LessonDetailSchema = new Schema({
    lsnNum: Number,
    lsnTitle: String,
    lsnDur: Number,
    lsnPreface: String,
    learningObj: [String],
    lsnPrep: LsnPrepSchema,
    chunks: [ChunkSchema],
    lsnExt: [LsnExtSchema]
});

const VocabSchema = new Schema({
    term: String,
    definition: String
});

const GatheredVocabSchema = new Schema({
    success: Boolean,
    expr: String,
    result: [VocabSchema]
});

const TeachingMaterialsData = new Schema({
    lessonPreface: String,
    lessonDur: String,
    classroom: ClassroomSchema,
    lesson: [LessonDetailSchema],
    gatheredVocab: GatheredVocabSchema
});

export const TeachingMaterialsSchema = new Schema({
    ...unitSectionObj,
    Data: TeachingMaterialsData
})