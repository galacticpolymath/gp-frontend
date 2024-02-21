/* eslint-disable no-console */
/* eslint-disable indent */
import moment from 'moment';
import { getVideoThumb } from './components/LessonSection/Preview/utils';
import { SHOWABLE_LESSONS_STATUSES } from './globalVars';

export const createPaginationArr = arr => {
    let pgsArr = [];
    let pgOfDataArr = [];

    arr.forEach((val, index) => {
        pgOfDataArr.push(val);

        if ((pgOfDataArr.length === 6) || (index === (arr.length - 1))) {
            pgsArr.push(structuredClone(pgOfDataArr));
            pgOfDataArr = [];
        }
    });

    return pgsArr;
};

export const getGpVids = lessons => {
    let gpVideos = [];

    for (const lesson of lessons) {
        let lessonMultiMediaArr = [];
        const { Section, Title, numID, ReleaseDate } = lesson;

        if (Section?.preview?.Multimedia?.length) {
            for (const media of Section.preview.Multimedia) {
                const isTargetGpVidPresent = gpVideos.length ? gpVideos.some(({ mainLink: gpVidMainLink }) => gpVidMainLink === media.mainLink) : false;

                if (!isTargetGpVidPresent && (media.by === 'Galactic Polymath') && (media.type === 'video') && ((typeof media.mainLink === 'string') && media.mainLink.includes('youtube'))) {
                    lessonMultiMediaArr.push({
                        ReleaseDate: ReleaseDate,
                        lessonUnitTitle: Title,
                        videoTitle: media.title,
                        mainLink: media.mainLink,
                        description: media.description,
                        thumbnail: getVideoThumb(media.mainLink),
                        lessonUnitNumId: numID,
                        lessonNum: (media.forLsn && Number.isInteger(+media.forLsn)) ? parseInt(media.forLsn) : null,
                    });
                }
            }
        }

        if (lessonMultiMediaArr.length) {
            gpVideos.push(...lessonMultiMediaArr);
        }
    }

    return gpVideos.sort((videoA, videoB) => videoB.ReleaseDate - videoA.ReleaseDate);
};

export const getGpLessons = lessons => {
    let lessonPartsForUI = [];
    const todaysDate = new Date();

    for (let lesson of lessons) {
        if (!lesson?.LsnStatuses?.length || !SHOWABLE_LESSONS_STATUSES.includes(lesson.PublicationStatus)) {
            continue;
        }

        let lessonParts = lesson?.Section?.['teaching-materials']?.Data?.lesson;
        let lessonPartsFromClassRoomObj = lesson?.Section?.['teaching-materials']?.Data?.classroom?.resources?.[0]?.lessons;

        if (lessonParts?.length) {
            for (let lsnStatus of lesson.LsnStatuses) {

                if (!SHOWABLE_LESSONS_STATUSES.includes(lsnStatus.status)) {
                    continue;
                }

                const lessonPart = lessonParts.find(({ lsnNum }) => lsnNum === lsnStatus.lsn);
                const wasLessonReleased = moment(todaysDate).format('YYYY-MM-DD') > moment(lsnStatus.unit_release_date).format('YYYY-MM-DD');

                if (lessonPart && wasLessonReleased) {
                    const lessonPartFromClassroomObj = lessonPartsFromClassRoomObj.find(({ lsn }) => lsn == lsnStatus.lsn);
                    let tags = Array.isArray(lessonPartFromClassroomObj?.tags?.[0]) ? lessonPartFromClassroomObj?.tags.flat() : lessonPartFromClassroomObj?.tags;
                    tags = tags?.length ? tags.filter(tag => tag) : tags;
                    const lessonPartForUI = {
                        tags: tags ?? null,
                        lessonPartPath: `/lessons/${lesson.locale}/${lesson.numID}#lesson_part_${lessonPart.lsnNum}`,
                        tile: lessonPartFromClassroomObj?.tile ?? 'https://storage.googleapis.com/gp-cloud/icons/Missing_Lesson_Tile_Icon.png',
                        lessonPartTitle: lessonPart.lsnTitle,
                        dur: lessonPart.lsnDur,
                        preface: lessonPart.lsnPreface,
                        lessonPartNum: lessonPart.lsnNum,
                        lessonTitle: lesson.Title,
                        subject: lesson.TargetSubject,
                        grades: lesson.ForGrades,
                        gradesOrYears: lesson.GradesOrYears,
                        status: lsnStatus.status,
                    };

                    lessonPartsForUI.push(lessonPartForUI);
                }
            }
        }
    }

    let lessonParts = structuredClone(lessonPartsForUI);

    if (lessonParts?.length) {
        lessonParts = lessonParts.sort(({ sort_by_date: sortByDateLessonA }, { sort_by_date: sortByDateLessonB }) => {
            let _sortByDateLessonA = new Date(sortByDateLessonA);
            let _sortByDateLessonB = new Date(sortByDateLessonB);

            if (_sortByDateLessonA > _sortByDateLessonB) {
                return -1;
            }

            if (_sortByDateLessonA < _sortByDateLessonB) {
                return 1;
            }

            return 0;
        });
    }

    return lessonParts;
};

const STATUSES_OF_SHOWABLE_LESSONS = ['Live', 'Beta', 'Coming Soon'];

export const getShowableUnits = units => {
    let uniqueUnits = [];
    const todaysDate = new Date();

    for (const unit of units) {
        if (STATUSES_OF_SHOWABLE_LESSONS.includes(unit.PublicationStatus) && !uniqueUnits.some(uniqueUnit => unit.numID === uniqueUnit.numID) && (moment(unit.ReleaseDate).format('YYYY-MM-DD') < moment(todaysDate).format('YYYY-MM-DD'))) {
            uniqueUnits.push(unit);
        }
    }

    return uniqueUnits;
};