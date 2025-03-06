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

export interface ITeachingMaterialsData<TLesson = ILesson> extends IUnitSectionObj {
    lessonPreface: string | null;
    lessonDur: string | null;
    classroom: IClassroom<TLesson> | null;
    gatheredVocab: IGatheredVocab | null;

}
export interface ITeachingMaterialsDataForUI<TLesson = ILesson> extends IUnitSectionObj {
    lessonPreface: string | null;
    lessonDur: string | null;
    classroom: IClassroom<TLesson> | null;
    remote: IClassroom<TLesson> | null;
    gatheredVocab: IGatheredVocab | null;
}

const teachingMaterials: ITeachingMaterialsData = {
    lessonPreface: "This lesson is a placeholder for now. It will be replaced with actual content once it is developed.",
    __component: "components/teachingMaterials",
    sortOrder: 4,
    InitiallyExpanded: true,
    SectionTitle: "Sample Teaching Materials",
    lessonDur: '45 mins',
    gatheredVocab: {
        success: true,
        expr: "test",
        result: [
            {
                term: "test",
                definition: "test"
            }
        ]
    },
    classroom: {
        resources: [
            {
                grades: "K-2",
                gradePrefix: "Elementary School",
                links: {
                    linkText: "Link to Elementary School lessons",
                    url: ["https://www.google.com"]
                },
                lessons: [
                    {
                        title: "Lesson 1: Introduction to reading",
                        tags: ["reading", "intro"],
                        preface: "This lesson is an introduction to reading.",
                        tile: "Reading",
                        itemList: [
                            {
                                itemTitle: "Item 1",
                                itemDescription: "This is an item.",
                                itemCat: "Elementary School",
                                links: {
                                    linkText: "Link to item",
                                    url: ["https://www.google.com"]
                                }
                            }
                        ],
                        status: "draft",
                        updated_date: "2021-01-01",
                        new_date: "2021-01-01",
                        sort_by_date: "2021-01-01",
                        unit_release_date: "2021-01-01",
                        dur: 30,
                        preface: "This lesson is an introduction to reading.",
                        obj: ["reading", "intro"],
                        prep: {
                            prepTitle: "Preparation",
                            prepDur: 10,
                            prepQuickDescription: "Prepare by reading the introduction to the lesson.",
                            prepDetails: "This is a detailed description of the preparation for the lesson.",
                            prepVariantNotes: "This is a variant note for the preparation.",
                            prepTeachingTips: "This is a teaching tip for the preparation."
                        },
                        chunks: [
                            {
                                chunkTitle: "Chunk 1",
                                chunkStart: 0,
                                chunkDur: 10,
                                steps: [
                                    {
                                        Step: 1,
                                        StepTitle: "Step 1",
                                        StepQuickDescription: "This is a quick description of step 1.",
                                        StepDetails: "This is a detailed description of step 1.",
                                        Vocab: "vocabulary",
                                        VariantNotes: "This is a variant note for step 1.",
                                        TeachingTips: "This is a teaching tip for step 1."
                                    }
                                ]
                            }
                        ],
                        lsnExt: [
                            {
                                item: 1,
                                itemTitle: "Extension 1",
                                itemDescription: "This is an extension.",
                                itemLink: "https://www.google.com"
                            }
                        ]
                    }
                ]
            },
            {
                grades: "3-5",
                gradePrefix: "Elementary School",
                links: {
                    linkText: "Link to Elementary School lessons",
                    url: ["https://www.google.com"]
                },
                lessons: [
                    {
                        title: "Lesson 2: Introduction to writing",
                        tags: ["writing", "intro"],
                        preface: "This lesson is an introduction to writing.",
                        tile: "Writing",
                        itemList: [
                            {
                                itemTitle: "Item 2",
                                itemDescription: "This is an item.",
                                itemCat: "Elementary School",
                                links: {
                                    linkText: "Link to item",
                                    url: ["https://www.google.com"]
                                }
                            }
                        ],
                        status: "draft",
                        updated_date: "2021-01-01",
                        new_date: "2021-01-01",
                        sort_by_date: "2021-01-01",
                        unit_release_date: "2021-01-01",
                        dur: 30,
                        preface: "This lesson is an introduction to writing.",
                        obj: ["writing", "intro"],
                        prep: {
                            prepTitle: "Preparation",
                            prepDur: 10,
                            prepQuickDescription: "Prepare by reading the introduction to the lesson.",
                            prepDetails: "This is a detailed description of the preparation for the lesson.",
                            prepVariantNotes: "This is a variant note for the preparation.",
                            prepTeachingTips: "This is a teaching tip for the preparation."
                        },
                        chunks: [
                            {
                                chunkTitle: "Chunk 2",
                                chunkStart: 0,
                                chunkDur: 10,
                                steps: [
                                    {
                                        Step: 2,
                                        StepTitle: "Step 2",
                                        StepQuickDescription: "This is a quick description of step 2.",
                                        StepDetails: "This is a detailed description of step 2.",
                                        Vocab: "vocabulary",
                                        VariantNotes: "This is a variant note for step 2.",
                                        TeachingTips: "This is a teaching tip for step 2."
                                    }
                                ]
                            }
                        ],
                        lsnExt: [
                            {
                                item: 2,
                                itemTitle: "Extension 2",
                                itemDescription: "This is an extension.",
                                itemLink: "https://www.google.com"
                            }
                        ]
                    }
                ]
            }
        ]
    } 
}

export interface ITeachingMaterialsDataOld<TLesson = ILesson> {
    lessonPreface: string | null;
    lessonDur: string | null;
    classroom: IClassroom<TLesson> | null;
    gatheredVocab: IGatheredVocab | null;
    lesson: ILessonDetail[]
}



