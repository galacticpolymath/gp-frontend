import React, { useEffect } from 'react';
import { nanoid } from 'nanoid';
import { INewUnitSchema } from '../../backend/models/Unit/types/unit';
import {
  filterInShowableUnits,
  getGpMultiMedia,
  getGpWebApps,
  getUnitLessons,
  retrieveUnits,
} from '../../backend/services/unitServices';
import { ICurrentUnits } from '../../types/global';
import UnitsPg from '../../components/LessonsPg';
import { createDbProjections } from '../../shared/fns';

interface IProps {
  oldUnits: any;
  currentUnits: ICurrentUnits | null;
}

const LessonsPage = ({ currentUnits }: IProps) => {
  useEffect(() => {
    console.log('currentUnits?.webApps: ', currentUnits?.webApps);
  });

  return (
    <UnitsPg
      units={currentUnits?.units ?? null}
      gpVideos={currentUnits?.gpVideos ?? null}
      lessons={currentUnits?.lessons ?? null}
      webApps={currentUnits?.webApps ?? null}
    />
  );
};

const PROJECTED_UNITS_FIELDS: Partial<keyof INewUnitSchema>[] = [
  'UnitBanner',
  'Subtitle',
  'Title',
  'Sections',
  'ReleaseDate',
  'locale',
  '_id',
  'numID',
  'PublicationStatus',
  'TargetSubject',
  'ForGrades',
  'GradesOrYears',
  'FeaturedMultimedia',
];
const DATA_PER_PG = 6;

export async function getStaticProps() {
  try {
    const { data: retrievedUnits } = await retrieveUnits(
      {},
      createDbProjections(PROJECTED_UNITS_FIELDS),
      0,
      { ReleaseDate: -1 }
    );

    if (retrievedUnits?.length) {
      const lessons = getUnitLessons(retrievedUnits);
      const webApps = await getGpWebApps(retrievedUnits);
      const gpMultiMedia = getGpMultiMedia(retrievedUnits);
      let gpVideosFirstPg = gpMultiMedia?.length
        ? gpMultiMedia
          .filter((mediaItem) => typeof mediaItem.ReleaseDate === 'string')
          .sort(
            (multiMediaItemA, multiMediaItemB) =>
              JSON.parse(multiMediaItemB.ReleaseDate as string) -
                JSON.parse(multiMediaItemA.ReleaseDate as string)
          )
          .slice(0, DATA_PER_PG)
        : [];
      gpVideosFirstPg = gpVideosFirstPg?.length
        ? gpVideosFirstPg.map((vid) => ({ ...vid, id: nanoid() }))
        : gpVideosFirstPg;

      gpVideosFirstPg = gpMultiMedia.slice(0, DATA_PER_PG);

      const unitsForUI = filterInShowableUnits(retrievedUnits, Date.now());
      const lessonsFor1stPg = lessons
        .filter((lesson) => typeof lesson.sortByDate === 'string')
        .sort(
          (
            { sortByDate: sortByDateLessonA },
            { sortByDate: sortByDateLessonB }
          ) => {
            let _sortByDateLessonA = new Date(sortByDateLessonA as string);
            let _sortByDateLessonB = new Date(sortByDateLessonB as string);

            if (_sortByDateLessonA > _sortByDateLessonB) {
              return -1;
            }

            if (_sortByDateLessonA < _sortByDateLessonB) {
              return 1;
            }

            return 0;
          }
        )
        .slice(0, DATA_PER_PG);

      return {
        props: {
          oldUnits: null,
          currentUnits: {
            units: {
              isLast: unitsForUI.length <= DATA_PER_PG,
              data: JSON.parse(JSON.stringify(unitsForUI)),
              totalItemsNum: unitsForUI.length,
            },
            lessons: {
              isLast: lessons.length <= DATA_PER_PG,
              data: JSON.parse(JSON.stringify(lessonsFor1stPg)),
              totalItemsNum: lessons.length,
            },
            webApps: {
              isLast: webApps.length <= DATA_PER_PG,
              data: JSON.parse(JSON.stringify(webApps)),
              totalItemsNum: webApps.length,
            },
            gpVideos: {
              isLast: gpMultiMedia.length <= DATA_PER_PG,
              data: JSON.parse(JSON.stringify(gpVideosFirstPg)),
              totalItemsNum: gpMultiMedia.length,
            },
            revalidate: 30,
          },
        },
      };
    }

    throw new Error('Failed to fetch for units.');
  } catch (error) {
    console.error(
      'An error has occurred while fetching for units. Error message: ',
      error
    );

    return {
      props: {
        oldUnits: {
          units: null,
          lessonsObj: null,
          gpVideosObj: null,
          webAppsObj: null,
        },
      },
      revalidate: 30,
    };
  }
}
export default LessonsPage;
