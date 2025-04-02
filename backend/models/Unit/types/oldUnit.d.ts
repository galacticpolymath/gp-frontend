export interface IOldUnit {
    _id: string;
    numID: number;
    ShortTitle: string;
    PublicationStatus: string;
    Language: string;
    Country: string;
    DefaultLanguage: string;
    DefaultCountry: string;
    LastUpdated: string;
    FirstPublicationDate: string | null;
    MediumTitle: string;
    lang: string;
    lng: string;
    locale: string;
    TemplateVer: string;
    TargetStandardsCodes: object[]; // Could be more specific if we know the structure
    galacticPubsVer: string;
    isTestRepo: boolean;
    DefaultLocale: string;
    URL: string;
    GdriveHome: string;
    GdriveDirName: string;
    GdriveTeachMatPath: string;
    GdriveTeachMatID: string;
    GdrivePublicID: string | null;
    GdriveDirID: string;
    GdriveMetaID: string;
    GdriveTeachItID: string;
    GdriveStandardsID: string;
    GdrivePublishedID: string;
    GdriveDirURL: string;
    RebuildAllMaterials: boolean;
    ReleaseDate: string;
    Title: string;
    Subtitle: string;
    SponsorName: string[];
    SponsoredBy: string;
    SponsorLogo: string[];
    LessonBanner: string;
    UnitCard: string;
    TargetSubject: string;
    LessonEnvir: string;
    ForGrades: string;
    GradesOrYears: string;
    SponsorImage: {
        url: string[];
    };
    Section: {
        overview: {
            __component?: string;
            LearningSummary: string;
            EstLessonTime: string;
            GradesOrYears: string;
            ForGrades: string;
            TargetSubject: string;
            Text: string;
            Tags: {
                Value: string;
            }[];
            SteamEpaulette: string;
            SteamEpaulette_vert: string;
            Accessibility: {
                Type: string | null;
                Description: string | null;
                Abbrev_Descr: string | null;
                Link: string | null;
            }[];
            SponsoredBy: string;
            Subtitle: string;
            numID: number;
            locale: string;
            sponsorLogoImgUrl: string;
            lessonBannerUrl: string;
            availLocs: string[];
            lessonTitle: string;
            versions: {
                major_release: string;
                sub_releases: {
                    version: string;
                    date: string;
                    summary: string;
                    notes: string | null;
                    acknowledgments: string | null;
                }[];
            }[];
        };
        preview: {
            __component?: string;
            SectionTitle: string;
            QuickPrep: string;
            Multimedia: {
                order: string;
                type: string;
                forLsn: string;
                title: string;
                description: string | null;
                lessonRelevance: string;
                by: string;
                byLink: string;
                mainLink: string;
                otherLink: string | null;
            }[];
            InitiallyExpanded: boolean;
        };
        "teaching-materials": {
            __component?: string;
            SectionTitle: string;
            Data: {
                lessonPreface: string;
                lessonDur: string;
                classroom: {
                    gradeVariantNotes: {
                        lsn: string;
                        lsnGradeVarNotes: string | null;
                    }[];
                    resources: {
                        grades: string;
                        gradePrefix: string;
                        links: {
                            linkText: string;
                            url: string;
                        };
                        lessons: {
                            lsn: string;
                            title: string;
                            tags: string[][] | null;
                            preface: string;
                            tile: string;
                            itemList: {
                                itemTitle: string;
                                itemDescription: string | null;
                                itemCat: string;
                                links: {
                                    linkText: string;
                                    url: string | null;
                                }[];
                                filePreviewImg: string;
                            }[];
                            status: string;
                        }[];
                    }[];
                };
                lesson: {
                    lsnNum: number;
                    lsnTitle: string;
                    lsnDur: number;
                    lsnPreface: string;
                    learningObj: string[];
                    lsnPrep: {
                        prepTitle: string;
                        prepDur: number;
                        prepQuickDescription: string;
                        prepDetails: string | null;
                        prepVariantNotes: string | null;
                        prepTeachingTips: string | null;
                    };
                    chunks: {
                        chunkTitle: string;
                        chunkStart: number | null;
                        chunkDur: number;
                        steps: {
                            Step: number;
                            StepTitle: string;
                            StepQuickDescription: string;
                            StepDetails: string | null;
                            Vocab: string | null;
                            VariantNotes: string | null;
                            TeachingTips: string | null;
                        }[];
                    }[];
                    lsnExt: {
                        item: number;
                        itemTitle: string;
                        itemDescription: string;
                        itemLink: string;
                    }[] | null;
                }[];
                gatheredVocab: {
                    success: boolean;
                    expr: string;
                    result: {
                        term: string;
                        definition: string;
                    }[];
                };
            };
        };
        background: {
            __component?: string;
            SectionTitle: string;
            Content: string;
            InitiallyExpanded: boolean;
        };
        "standards-header": {
            __component?: string;
            SectionTitle: string;
        };
        "learning-chart": {
            __component?: string;
            Title: string;
            Description: string;
            Footnote: string;
            Badge: string;
        };
        standards: {
            __component?: string;
            Data: {
                subject: string;
                target: boolean;
                sets: {
                    slug: string;
                    name: string;
                    dimensions: {
                        slug: string;
                        name: string;
                        standardsGroup: {
                            lessons: string[];
                            codes: string;
                            grades: string | string[];
                            statements: string;
                            alignmentNotes: string;
                            subcat: string | null;
                        }[];
                    }[];
                }[];
            }[];
        };
        feedback: {
            __component?: string;
            SectionTitle: string;
            Content: string;
            InitiallyExpanded: boolean;
        };
        credits: {
            __component?: string;
            SectionTitle: string;
            Content: string;
            InitiallyExpanded: boolean;
        };
        acknowledgments: {
            __component?: string;
            SectionTitle: string;
            Data: {
                role: string;
                def: string;
                records: {
                    name: string | null;
                    url: string | null;
                    title: string | null;
                    affiliation: string | null;
                    location: string | null;
                }[];
            }[];
        };
        versions: {
            __component?: string;
            SectionTitle: string;
            Data: {
                major_release: string;
                sub_releases: {
                    version: string;
                    date: string;
                    summary: string;
                    notes: string | null;
                    acknowledgments: string | null;
                }[];
            }[];
        };
    };
    LsnStatuses: {
        lsn: number;
        status: string;
        updated_date: string | null;
        new_date: string;
        sort_by_date: string;
        unit_release_date: string;
        _id: string;
    }[];
    ShortURL: string;
    featuring: IFeaturing[]; // Could be more specific if we know the structure
    headLinks: string[][];
}