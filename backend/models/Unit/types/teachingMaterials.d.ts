import { ILessonForUI } from '../../../../types/global';
import { IUnitSectionObj } from '../Section';
import { IOverview, IUnitOverview, TUnitOverviewPropsForUI } from './overview';

export interface ILink {
  linkText: string | null;
  url: string[] | null;
}
export interface IItem {
  itemTitle: string | null;
  itemDescription: string | null;
  itemCat: string | null;
  links: ILink[] | null;
}

export interface IItemV2Props {
  mimeType: string;
  gdriveRoot: string;
  isExportable: boolean;
  externalUrl: string;
  itemType: string;
}

export interface IItemV2 extends IItemV2Props {
  itemTitle: string | null;
  itemDescription: string | null;
  itemCat: string | null;
  links: ILink[] | null;
  gpGDriveItemId?: string
}

export interface IGoingFurtherVal extends Omit<IItem, 'links' | 'itemCat'> {
  item: number
  itemLink: string
}

export interface IItemForUI extends IItem {
  filePreviewImg?: string
  userCopiedGoogleDriveVersionId?: string,
  gpGoogleDriveVerionsId?: string
}

// contains the props of the old database schema
export interface ILesson<TItem extends IItem = IItem> {
  _id: string | null;
  lsn: string | null;
  title: string | null;
  lsnTags: string[] | null;
  /** @deprecated use `lsnTags` */
  tags: string[] | null;
  preface: string | null;
  tile: string | null;
  itemList: IItem[] | null;
  status: string | null;
  updated_date: string | null;
  new_date: string | null;
  sort_by_date: string | null;
  unit_release_date: string | null;
  dur: number | null;
  preface: string | null;
  obj: string[] | null;
  prep: ILsnPrep | null;
  chunks: IChunk[] | null;
  ext: ILsnExt[] | null;
}

export interface IOldLesson {
  lsn: string | null;
  title: string | null;
  tags: string[][] | null;
  preface: string | null;
  tile: string | null;
  itemList: IItem[] | null;
  status: string | null;
}

export interface IGradeVariantNote {
  lsn: string | null;
  lsnGradeVarNotes: string | null;
}

export interface IResource<TLesson extends object = ILesson> {
  grades: string | null;
  gradePrefix: string | null;
  sharedGDriveLessonsFolderId: string | null;
  links: ILink | null;
  lessons: TLesson[] | null;
}

export interface IClassroom<TLesson = ILesson> {
  resources: IResource<TLesson>[] | null;
}
export interface IClassroomOld<TLesson = ILesson> {
  gradeVariantNotes: IGradeVariantNote[] | null;
  resources: IResource<TLesson>[] | null;
}

export interface IStep {
  Step: number | null;
  StepTitle: string | null;
  StepQuickDescription: string | null;
  StepDetails: string | null;
  Vocab: string | null;
  VariantNotes: string | null;
  TeachingTips: string | null;
}

export interface IChunk {
  chunkTitle: string | null;
  chunkStart: number | null;
  chunkDur: number | null;
  steps: IStep[] | null;
}

export interface ILsnPrep {
  title: string | null;
  dur: number | null;
  quickDescription: string | null;
  details: string | null;
  variantNotes: string | null;
  teachingTips: string | null;
}

export interface ILsnExt {
  item: number | null;
  itemTitle: string | null;
  itemDescription: string | null;
  itemLink: string | null;
}

export interface ILessonDetail {
  lsnNum: number | null;
  lsnTitle: string | null;
  lsnDur: number | null;
  lsnPreface: string | null;
  learningObj: string[] | null;
  lsnPrep: ILsnPrep | null;
  chunks: IChunk[] | null;
  lsnExt: ILsnExt[] | null;
}

export interface IVocab {
  term: string | null;
  definition: string | null;
}

export interface IGatheredVocab {
  success: boolean | null;
  expr: string | null;
  result: IVocab[] | null;
}

export interface ITeachingMaterialsData<TLesson = ILesson>
  extends IUnitSectionObj {
  unitPreface: string | null;
  unitDur: string | null;
  classroom: IClassroom<TLesson> | null;
  gatheredVocab: IGatheredVocab | null;
}
export interface ITeachingMaterialsDataForUI<TLesson = ILesson>
  extends IUnitSectionObj {
  lessonPreface: string | null;
  lessonDur: string | null;
  classroom: IClassroom<TLesson> | null;
  remote: IClassroom<TLesson> | null;
  gatheredVocab: IGatheredVocab | null;
  lesson: ILessonDetail[];
}

interface ILsnPrep {
  prepTitle: string;
  prepDur: number | null;
  prepQuickDescription: string;
  prepDetails: string | null;
  prepVariantNotes: null;
  prepTeachingTips: null;
}

interface IChunkStep {
  Step: number | null;
  StepTitle: string | null;
  StepQuickDescription: string | null;
  StepDetails: string | null;
  Vocab: string | null;
  VariantNotes: string | null;
  TeachingTips: string | null;

}

export interface IGDriveItem {
  id: string;
  name: string
}

export interface ISharedGDriveLessonFolder {
  id: string,
  name: string,
  parentFolder: {
    id: string;
    name: string
  }
}

interface ILessonItemInGpDrive extends Pick<IItemV2, "itemTitle"> {
  gdriveId: string
}

interface INewUnitLesson<TItem extends IItem = IItemV2> {
  userGDriveLessonFolderId?: string;
  sharedGDriveLessonFolders?: ISharedGDriveLessonFolder[]
  allUnitLessons?: { id: string, sharedGDriveId: string, lessonItemsInGpDrive?: ILessonItemInGpDrive[] }[]
  lessonsFolder?: Partial<{
    name: string;
    sharedGDriveId: string;
  }>;
  title: string | null;
  lsnTags: string[] | null;
  lsn: number | null;
  status: string | null;
  updated_date: string | null;
  new_date: string | null;
  sort_by_date: string | null;
  unit_status: string | null;
  unit_release_date: string | null;
  /** @deprecated use `lsnTags` */
  tags: string[] | null;
  gradeVarNote: string | null;
  preface: string | null;
  tile: string | null;
  itemList: TItem[] | null;
  lsnDur: number | null;
  lsnPreface: string | null;
  learningObj: string[] | null;
  lsnPrep: ILsnPrep | null;
  chunks: {
    chunkTitle: string | null;
    chunkStart: number | null;
    chunkDur: number | null;
    steps: IChunkStep[] | null;
  }[] | null;
  goingFurther: IGoingFurtherVal[] | null;
}

export interface IVocab {
  term: string;
  definition: string;
}

interface ITeachingMaterialsPreviewInfo {
  unitDur: string;
  unitPreface: string;
  gatheredVocab: IVocab[];
}

interface IResourceObj<TLesson extends INewUnitLesson = INewUnitLesson> {
  resources: IResource<INewUnitLesson>[]
}

export interface IUnitTeachingMaterials extends IUnitSectionObj, ITeachingMaterialsPreviewInfo {
  classroom: IResourceObj | null;
  remote?: IResourceObj;
}

export interface IUnitTeachingMaterialsForUI extends IUnitSectionObj, ITeachingMaterialsPreviewInfo, Partial<Pick<TUnitOverviewPropsForUI, 'unitTitle'>> {
  classroom: {
    resources: IResource<INewUnitLesson<IItemForUI>>[];
  };
  itemsOfLessons?: { lessonId: string, items: { itemTitle: string, gpGDriveItemId: string }[] }[]
}
