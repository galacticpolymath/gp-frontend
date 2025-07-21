import { Schema } from "mongoose";
import {
  IChunk,
  IChunkStep,
  IGoingFurtherVal,
  IItem,
  IItemV2,
  ILink,
  ILsnPrep,
  INewUnitLesson,
  IResource,
  IUnitTeachingMaterials,
  IVocab,
} from "./types/teachingMaterials";
import {
  ICustomProp,
  IRootFieldToRetrieve,
  RootFieldToRetrieve,
} from "./RootFieldsToRetrieve";

const GatheredVocabSchema = new Schema<IVocab>(
  {
    definition: String,
    term: String,
  },
  { _id: false }
);
const LinkSchema = new Schema<ILink>(
  {
    linkText: String,
    url: [String],
  },
  { _id: false }
);
const ItemSchema = new Schema<IItem>(
  {
    itemTitle: String,
    itemDescription: String,
    itemCat: String,
    links: [LinkSchema],
  },
  { _id: false }
);
const ItemSchemaV2 = new Schema<IItemV2>(
  {
    itemTitle: String,
    itemDescription: String,
    itemCat: String,
    mimeType: String,
    gdriveRoot: String,
    isExportable: Boolean,
    links: [LinkSchema],
  },
  { _id: false }
);
const LsngPrepSchema = new Schema<ILsnPrep>(
  {
    title: String,
    dur: Number,
    quickDescription: String,
    details: String,
    variantNotes: String,
    teachingTips: String,
  },
  { _id: false }
);
const ChuckStepSchema = new Schema<IChunkStep>(
  {
    Step: Number,
    StepTitle: String,
    StepQuickDescription: String,
    StepDetails: String,
    Vocab: String,
    VariantNotes: String,
    TeachingTips: String,
  },
  { _id: false }
);
const ChuckSchema = new Schema<IChunk>(
  {
    chunkTitle: String,
    chunkStart: Number,
    chunkDur: Number,
    steps: [ChuckStepSchema],
  },
  { _id: false }
);
const GoingFurtherSchema = new Schema<IGoingFurtherVal>(
  {
    item: Number,
    itemTitle: String,
    itemDescription: String,
    itemLink: String,
  },
  {
    _id: false,
  }
);
const NewUnitLessonSchema = new Schema<INewUnitLesson>(
  {
    title: String,
    lsn: Number,
    status: String,
    updated_date: String,
    new_date: String,
    sort_by_date: String,
    unit_status: String,
    unit_release_date: String,
    tags: [String],
    gradeVarNote: String,
    preface: String,
    tile: String,
    itemList: [ItemSchemaV2],
    lsnDur: Number,
    lsnPreface: String,
    learningObj: [String],
    lsnPrep: LsngPrepSchema,
    chunks: [ChuckSchema],
    goingFurther: [GoingFurtherSchema],
  },
  { _id: false }
);
const ResourcesSchema = new Schema<IResource<INewUnitLesson>>(
  {
    grades: String,
    gradePrefix: String,
    links: LinkSchema,
    lessons: [NewUnitLessonSchema],
  },
  { _id: false }
);
export const TeachingMaterialsSchema = new Schema<
  IUnitTeachingMaterials & {
    rootFieldsToRetrieveForUI: ICustomProp<IRootFieldToRetrieve[]>;
  }
>(
  {
    unitDur: String,
    unitPreface: String,
    gatheredVocab: [GatheredVocabSchema],
    classroom: {
      resources: [ResourcesSchema],
    },
    __component: String,
    InitiallyExpanded: Boolean,
    SectionTitle: String,
    rootFieldsToRetrieveForUI: {
      type: [RootFieldToRetrieve],
      default: () => [
          {
            name: "Title",
            as: "Title",
          },
          {
            name: "GdrivePublicID",
            as: "GdrivePublicID",
          },
        ]
    },
  },
  { _id: false }
);
