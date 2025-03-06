import { IUnitSectionObj, unitSectionObj } from "./Section";
import { Schema } from "mongoose";
import { 
    IChunk, 
    IClassroom, 
    IClassroomOld, 
    IGatheredVocab, 
    IGradeVariantNote, 
    IItem, 
    ILesson, 
    ILessonDetail, 
    ILink, 
    ILsnExt, 
    ILsnPrep, 
    IResource, 
    IStep, 
    ITeachingMaterialsData, 
    IVocab 
} from "./types/teachingMaterials";

// Schemas
const LinkSchema = new Schema<ILink>({
    linkText: String,
    url: [String]
}, { _id: false });

const ItemSchema = new Schema<IItem>({
    itemTitle: String,
    itemDescription: String,
    itemCat: String,
    links: [LinkSchema]
}, { _id: false });

const LessonSchema = new Schema<ILesson>({
    lsn: String,
    title: String,
    tags: [[String]],
    preface: String,
    tile: String,
    itemList: [ItemSchema]
}, { _id: false });

const GradeVariantNoteSchema = new Schema<IGradeVariantNote>({
    lsn: String,
    lsnGradeVarNotes: String
}, { _id: false });

const ResourceSchema = new Schema<IResource>({
    grades: String,
    gradePrefix: String,
    links: LinkSchema,
    lessons: [LessonSchema]
}, { _id: false });

const ClassroomSchemaOld = new Schema<IClassroomOld>({
    gradeVariantNotes: [GradeVariantNoteSchema],
    resources: [ResourceSchema]
}, { _id: false });
const ClassroomSchema = new Schema<IClassroom>({
    resources: [ResourceSchema]
}, { _id: false });

const StepSchema = new Schema<IStep>({
    Step: Number,
    StepTitle: String,
    StepQuickDescription: String,
    StepDetails: String,
    Vocab: String,
    VariantNotes: String,
    TeachingTips: String
}, { _id: false });

const ChunkSchema = new Schema<IChunk>({
    chunkTitle: String,
    chunkStart: Number,
    chunkDur: Number,
    steps: [StepSchema]
}, { _id: false });

const LsnPrepSchema = new Schema<ILsnPrep>({
    prepTitle: String,
    prepDur: Number,
    prepQuickDescription: String,
    prepDetails: String,
    prepVariantNotes: String,
    prepTeachingTips: String
}, { _id: false });

const LsnExtSchema = new Schema<ILsnExt>({
    item: Number,
    itemTitle: String,
    itemDescription: String,
    itemLink: String
}, { _id: false });

const LessonDetailSchema = new Schema<ILessonDetail>({
    lsnNum: Number,
    lsnTitle: String,
    lsnDur: Number,
    lsnPreface: String,
    learningObj: [String],
    lsnPrep: LsnPrepSchema,
    chunks: [ChunkSchema],
    lsnExt: [LsnExtSchema]
}, { _id: false });

const VocabSchema = new Schema<IVocab>({
    term: String,
    definition: String
}, { _id: false });
const GatheredVocabSchema = new Schema<IGatheredVocab>({
    success: Boolean,
    expr: String,
    result: [VocabSchema]
}, { _id: false });

const TeachingMaterialsData = new Schema<ITeachingMaterialsData>({
    lessonPreface: String,
    lessonDur: String,
    classroom: ClassroomSchema,
    gatheredVocab: GatheredVocabSchema
}, { _id: false });

export interface ITeachingMaterials extends IUnitSectionObj  {
    Data: ITeachingMaterialsData;
}

const teachingMaterials: ITeachingMaterials = {
    __component: "teaching-materials.teaching-materials",
    SectionTitle: "Teaching Materials",
    Data: {
        lessonPreface: null,
        lessonDur: null,
        classroom: null,
        gatheredVocab: null
    }
};


export const TeachingMaterialsSchema = new Schema<ITeachingMaterials>({
    ...unitSectionObj,
    Data: TeachingMaterialsData
}, { _id: false });

