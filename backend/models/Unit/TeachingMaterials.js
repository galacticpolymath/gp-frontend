import { unitSectionObj } from "./Section";

// Sub-schemas
const LinkSchema = new Schema({
    linkText: String,
    url: [String]
}, { _id: false });

const ItemSchema = new Schema({
    itemTitle: String,
    itemDescription: String,
    itemCat: String,
    links: [LinkSchema]
}, { _id: false });

const LessonSchema = new Schema({
    lsn: String,
    title: String,
    tags: [[String]],
    preface: String,
    tile: String,
    itemList: [ItemSchema]
}, { _id: false });

const GradeVariantNoteSchema = new Schema({
    lsn: String,
    lsnGradeVarNotes: String
}, { _id: false });

const ResourceSchema = new Schema({
    grades: String,
    gradePrefix: String,
    links: LinkSchema,
    lessons: [LessonSchema]
}, { _id: false });

const ClassroomSchema = new Schema({
    gradeVariantNotes: [GradeVariantNoteSchema],
    resources: [ResourceSchema]
}, { _id: false });

const StepSchema = new Schema({
    Step: Number,
    StepTitle: String,
    StepQuickDescription: String,
    StepDetails: String,
    Vocab: String,
    VariantNotes: String,
    TeachingTips: String
}, { _id: false });

const ChunkSchema = new Schema({
    chunkTitle: String,
    chunkStart: Number,
    chunkDur: Number,
    steps: [StepSchema]
}, { _id: false });

const LsnPrepSchema = new Schema({
    prepTitle: String,
    prepDur: Number,
    prepQuickDescription: String,
    prepDetails: String,
    prepVariantNotes: String,
    prepTeachingTips: String
}, { _id: false });

const LsnExtSchema = new Schema({
    item: Number,
    itemTitle: String,
    itemDescription: String,
    itemLink: String
}, { _id: false });

const LessonDetailSchema = new Schema({
    lsnNum: Number,
    lsnTitle: String,
    lsnDur: Number,
    lsnPreface: String,
    learningObj: [String],
    lsnPrep: LsnPrepSchema,
    chunks: [ChunkSchema],
    lsnExt: [LsnExtSchema]
}, { _id: false });

const VocabSchema = new Schema({
    term: String,
    definition: String
}, { _id: false });

const GatheredVocabSchema = new Schema({
    success: Boolean,
    expr: String,
    result: [VocabSchema]
}, { _id: false });

const TeachingMaterialsData = new Schema({
    lessonPreface: String,
    lessonDur: String,
    classroom: ClassroomSchema,
    lesson: [LessonDetailSchema],
    gatheredVocab: GatheredVocabSchema
}, { _id: false });

export const TeachingMaterialsSchema = new Schema({
    ...unitSectionObj,
    Data: TeachingMaterialsData
}, { _id: false })
