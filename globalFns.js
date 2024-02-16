/* eslint-disable indent */
import { getVideoThumb } from './components/LessonSection/Preview/utils';

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
                if ((media.by === 'Galactic Polymath') && (media.type === 'video') && ((typeof media.mainLink === 'string') && media.mainLink.includes('youtube'))) {
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