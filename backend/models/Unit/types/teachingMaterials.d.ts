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
    lsn: string | null;
    title: string | null;
    tags: string[] | null;
    preface: string | null;
    tile: string | null;
    itemList: IItem[] | null;
}

export interface IGradeVariantNote {
    lsn: string | null;
    lsnGradeVarNotes: string | null;
}

export interface IResource {
    grades: string | null;
    gradePrefix: string | null;
    links: ILink | null;
    lessons: ILesson[] | null;
    parts?: ILesson[] | null;
}

export interface IClassroom {
    gradeVariantNotes: IGradeVariantNote[] | null;
    resources: IResource[] | null;
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
    prepTitle: string | null;
    prepDur: number | null;
    prepQuickDescription: string | null;
    prepDetails: string | null;
    prepVariantNotes: string | null;
    prepTeachingTips: string | null;
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

export interface ITeachingMaterialsData {
    lessonPreface: string | null;
    lessonDur: string | null;
    classroom: IClassroom | null;
    remote: IClassroom | null;
    lesson: ILessonDetail[] | null;
    gatheredVocab: IGatheredVocab | null;
}



