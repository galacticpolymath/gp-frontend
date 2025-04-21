/* eslint-disable no-console */

import { DeleteResult } from "mongoose";
import { INewUnitSchema, IUnit } from "../models/Unit/types/unit";
import Unit from "../models/Unit";
import { ILiveUnit, IMultiMediaItemForUI, IUnitLesson, IWebAppLink } from "../../types/global";
import { getVideoThumb } from "../../components/LessonSection/Preview/utils";
import { STATUSES_OF_SHOWABLE_LESSONS, WEB_APP_PATHS } from "../../globalVars";
import { getLinkPreviewObj, getShowableUnits } from "../../globalFns";
import moment from "moment";
import { getLiveUnits } from "../../constants/functions";

const insertUnit = async (unit: INewUnitSchema) => {
  try {
    if (!Unit) {
      throw new Error(
        "Failed to connect to the database. `Units` collections does not exist."
      );
    }

    const newUnit = new Unit(unit);
    const saveResult = await newUnit.save();

    saveResult.validateSync();

    const { Title, _id } = unit;

    return {
      status: 200,
      msg: `Unit '${Title}' (${_id}) was successfully saved into the database!`,
    };
  } catch (error) {
    const errMsg = `Failed to save lesson into the database. Error message: ${error}`;

    console.error(errMsg);

    return { status: 500, msg: errMsg };
  }
};

const deleteUnit = async (_id?: string, queryPair?: [string, unknown]) => {
  try {
    console.log(
      `Attempting to delete unit with id ${_id} and queryPair ${JSON.stringify(
        queryPair
      )}`
    );

    if (!Unit) {
      throw new Error(
        "Failed to connect to the database. `Units` collections does not exist."
      );
    }

    if (!_id && !queryPair) {
      return {
        status: 500,
        msg: "Both `unitId` and `queryPair` are falsy. At least one of them must have a value.",
      };
    }

    let deletionResult: DeleteResult;

    if (queryPair && queryPair.length > 0) {
      const [key, val] = queryPair;
      deletionResult = await Unit.deleteOne({ [key]: val });
    } else {
      deletionResult = await Unit.deleteOne({ _id });
    }

    if (deletionResult.deletedCount === 0) {
      return {
        status: 500,
        msg: `Failed to delete unit`,
      };
    }

    console.log("deletionResult: ", deletionResult);

    return {
      status: 200,
      msg: `Unit was successfully deleted from the database!`,
    };
  } catch (error) {
    console.error("`deleteUnit` error: ", error);

    return {
      status: 500,
      msg: `Failed to delete lesson from the database. Error message: "${error}"`,
    };
  }
};

const createDbFilter = (filterObjKeyAndValPairs: [string, unknown[]][]) => {
  try {
    const areFilterValuesValid = filterObjKeyAndValPairs.every(
      ([, filterVal]) => Array.isArray(filterVal)
    );

    if (!areFilterValuesValid) {
      throw new Error(
        "The value for the querying must be an array. Example: { numID: [1,2,3,4] }"
      );
    }

    return {
      filterObj: filterObjKeyAndValPairs.reduce((filterObj, keyAndVal) => {
        try {
          const [key, val] = keyAndVal;
          filterObj[key] = {
            $in:
              key === "numID"
                ? val
                    .map((lessonNumIdStr) =>
                      typeof lessonNumIdStr === "string"
                        ? parseInt(lessonNumIdStr)
                        : null
                    )
                    .filter(Boolean)
                : val,
          };

          return filterObj;
        } catch (error: unknown) {
          const errMsgStr = `Failed to create the filter object. Error message: ${error}.`;

          return {
            errMsg:
              error && typeof error === "object" && "message" in error
                ? (error.message as string)
                : errMsgStr,
          };
        }
      }, {} as Record<string, unknown>),
    };
  } catch (error: unknown) {
    const errMsgStr = `Failed to create the filter object. Error message: ${error}.`;

    return {
      errMsg:
        error && typeof error === "object" && "message" in error
          ? error.message
          : errMsgStr,
    };
  }
};

type TSort = Partial<{
  [key in keyof IUnit]: "asc" | "desc" | "ascending" | "descending" | 1 | -1;
}>;
export type TProjections = { [key in keyof IUnit | "__v"]: 0 | 1 };

const retrieveUnits = async (
  filterObj: Partial<{ [key in keyof IUnit]: unknown }>,
  projectionObj: Partial<TProjections>,
  limit: number = 0,
  sort?: TSort
) => {
  try {
    if (!Unit) {
      throw new Error(
        "Failed to connect to the database. `Units` collections does not exist."
      );
    }

    const units = await Unit.find(filterObj, projectionObj)
      .sort(sort ?? {})
      .limit(limit)
      .lean();

    return { wasSuccessful: true, data: units as INewUnitSchema[] };
  } catch (error) {
    const errMsg = `Failed to get the lesson from the database. Error message: ${error}.`;

    console.error("errMsg in the `retrieveUnits` function: ", errMsg);

    return { wasSuccessful: false, errMsg: errMsg };
  }
};

const updateUnit = async (
  filterObj: Partial<{ [key in keyof INewUnitSchema]: unknown }>,
  updatedProps: Partial<INewUnitSchema>
) => {
  try {
    // an example of lesson being updated:
    // section.participants[0].name = "John Doe"
    if (!Unit) {
      throw new Error(
        "Failed to connect to the database. `Units` collections does not exist."
      );
    }

    const { modifiedCount } = await Unit.updateMany(filterObj, {
      $set: updatedProps,
    }).lean();

    return { wasSuccessful: modifiedCount === 1 };
  } catch (error) {
    const errMsg = `Failed to update the target lesson. Error message: ${error}.`;

    console.error(errMsg);

    return { errMsg: errMsg };
  }
};

const getGpMultiMedia = (units: INewUnitSchema[]) => {
  const gpVideos: IMultiMediaItemForUI[] = [];

  for (const unit of units) {
    if (!unit.FeaturedMultimedia) {
      continue;
    }

    const { Title, ReleaseDate, numID } = unit;

    for (const mediaItem of unit.FeaturedMultimedia) {
      const isTargetGpVidPresent = gpVideos?.length
        ? gpVideos.some(
            ({ mainLink: gpVidMainLink }) =>
              gpVidMainLink === mediaItem.mainLink
          )
        : false;

      if (
        !isTargetGpVidPresent &&
        mediaItem.by === "Galactic Polymath" &&
        mediaItem.type === "video" &&
        typeof mediaItem.mainLink === "string" &&
        mediaItem.mainLink.includes("youtube")
      ) {
        gpVideos.push({
          ReleaseDate: ReleaseDate,
          lessonUnitTitle: Title,
          videoTitle: mediaItem.title,
          mainLink: mediaItem.mainLink,
          description: mediaItem.description ?? mediaItem.lessonRelevance,
          thumbnail: getVideoThumb(mediaItem.mainLink),
          unitNumId: numID,
          lessonNumId:
            mediaItem.forLsn && Number.isInteger(+mediaItem.forLsn)
              ? parseInt(mediaItem.forLsn)
              : null,
        });
      }
    }
  }

  return gpVideos;
};

const getGpWebApps = async (units: INewUnitSchema[]) => {
  const webApps: IWebAppLink[] = [];

  for (const unit of units) {
    if (!unit.FeaturedMultimedia) {
      continue;
    }

    for (const multiMediaItem of unit.FeaturedMultimedia) {
      const isPresentInWebApps = webApps.find(
        (webApp) => webApp.webAppLink === multiMediaItem.mainLink
      );

      if (isPresentInWebApps || !multiMediaItem.mainLink || multiMediaItem.type !== "web-app") {
        continue;
      }

      const linkPreviewObj = await getLinkPreviewObj(multiMediaItem.mainLink);

      if (
        "errMsg" in linkPreviewObj &&
        linkPreviewObj.errMsg &&
        "images" in linkPreviewObj &&
        Array.isArray(linkPreviewObj.images) &&
        linkPreviewObj.images.length
      ) {
        console.error(
          "Failed to get the image preview of web app. Error message: ",
          linkPreviewObj.errMsg
        );
        continue;
      }

      const images =
        "images" in linkPreviewObj && Array.isArray(linkPreviewObj.images)
          ? linkPreviewObj.images
          : [];
      const errMsg = "errMsg" in linkPreviewObj ? linkPreviewObj.errMsg : "";
      const title = "title" in linkPreviewObj ? linkPreviewObj.title : "";
      let pathToFile = null;

      if (typeof multiMediaItem?.title === "string") {
        pathToFile =
          WEB_APP_PATHS.find(({ name }) =>
            (multiMediaItem.title as string).toLowerCase().includes(name)
          )?.path ?? (images?.length ? images[0] : null);
      }

      const webApp = {
        lessonIdStr: multiMediaItem.forLsn,
        unitNumID: unit.numID,
        webAppLink: multiMediaItem.mainLink,
        title: multiMediaItem.title,
        unitTitle: unit.Title,
        description: multiMediaItem.lessonRelevance,
        webAppPreviewImg: errMsg || !images?.length ? null : images[0],
        webAppImgAlt:
          errMsg || !images?.length ? null : `${title}'s preview image`,
        pathToFile,
      };

      webApps.push(webApp);
    }
  }

  return webApps;
};

const getUnitLessons = (retrievedUnits: INewUnitSchema[]) => {
  const todaysDate = new Date();
  const unitLessons: IUnitLesson[] = [];

  for (const unit of retrievedUnits) {
    const wasUnitReleased =
      moment(todaysDate).format("YYYY-MM-DD") >
      moment(unit.ReleaseDate).format("YYYY-MM-DD");

    if (!wasUnitReleased) {
      continue;
    }

    const resources = unit?.Sections?.teachingMaterials?.classroom?.resources;

    if (!resources) {
      continue;
    }

    for (const resource of resources) {
      if (!resource.lessons) {
        continue;
      }

      for (const lesson of resource.lessons) {
        const unitLesson = {
          tags: lesson.tags ?? null,
          lessonPartPath: `/lessons/${unit.locale}/${unit.numID}#lesson_part_${lesson.lsn}`,
          tile:
            lesson?.tile ??
            "https://storage.googleapis.com/gp-cloud/icons/Missing_Lesson_Tile_Icon.png",
          lessonPartTitle: lesson.title,
          dur: lesson.lsnDur,
          preface: lesson.lsnPreface,
          lessonPartNum: lesson.lsn,
          unitTitle: unit.Title,
          subject: unit.TargetSubject,
          grades: unit.ForGrades,
          gradesOrYears: unit.GradesOrYears,
          status: lesson.status,
          sortByDate: lesson.sort_by_date
        };

        unitLessons.push(unitLesson);
      }
    }
  } 

  return unitLessons;
};

const getIsUnitNew = (releaseDate: Date, now: number) => {
  const releaseDateMilliseconds = new Date(releaseDate).getTime();
  const endDateOfNewReleaseMs = releaseDateMilliseconds + 1_000 * 60 * 60 * 24 * 37; // 37 days
  const isNew = now > releaseDateMilliseconds && now < endDateOfNewReleaseMs;

  return isNew;
}

const filterInShowableUnits = (units: INewUnitSchema[], nowMs: number) => {
  const liveUnits = getLiveUnits(units).filter((unit) => unit?.ReleaseDate);

  return liveUnits.map((unit) => {
        const individualLessonsNum = unit?.Sections?.teachingMaterials?.classroom?.resources?.reduce((totalLiveLessons, resource) => {
          if(!resource.lessons?.length){
            return totalLiveLessons;
          }
          const liveLessonsNum = resource.lessons.filter((lesson) => lesson?.status ? STATUSES_OF_SHOWABLE_LESSONS.includes(lesson?.status) : false).length;

          return totalLiveLessons + liveLessonsNum;
        }, 0) ?? 0;
        const lessonObj = {
          ...unit,
          individualLessonsNum,
          ReleaseDate: moment(unit.ReleaseDate).format("YYYY-MM-DD"),
          isNew: getIsUnitNew(new Date(unit.ReleaseDate as string), nowMs),
        };
    
        return lessonObj as ILiveUnit;
      });
}

export {
  insertUnit,
  deleteUnit,
  filterInShowableUnits,
  retrieveUnits,
  updateUnit,
  createDbFilter,
  getGpMultiMedia,
  getGpWebApps,
  getUnitLessons
};
