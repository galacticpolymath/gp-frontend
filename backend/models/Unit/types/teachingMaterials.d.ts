import { ILessonForUI } from "../../../../types/global";
import { IUnitSectionObj } from "../Section";

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

export interface ILesson {
    _id: string | null;
    title: string | null
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

export interface IGradeVariantNote {
    lsn: string | null;
    lsnGradeVarNotes: string | null;
}

export interface IResource<TLesson = ILesson> {
    grades: string | null;
    gradePrefix: string | null;
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

export interface ITeachingMaterialsData<TLesson = ILesson> extends IUnitSectionObj {
    unitPreface: string | null;
    unitDur: string | null;
    classroom: IClassroom<TLesson> | null;
    gatheredVocab: IGatheredVocab | null;

}
export interface ITeachingMaterialsDataForUI<TLesson = ILesson> extends IUnitSectionObj {
    lessonPreface: string | null;   
    lessonDur: string | null;
    classroom: IClassroom<TLesson> | null;
    remote: IClassroom<TLesson> | null;
    gatheredVocab: IGatheredVocab | null;
    lesson: ILessonDetail[]
}
