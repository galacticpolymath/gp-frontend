/* eslint-disable no-console */

import { DeleteResult, ProjectionType } from "mongoose";
import { INewUnitSchema, IUnit } from "../models/Unit/types/unit";
import Unit from "../models/Unit";
import {
  ILiveUnit,
  IMultiMediaItemForUI,
  IUnitLesson,
} from "../../types/global";
import { getVideoThumb } from "../../components/LessonSection/Preview/utils";
import { STATUSES_OF_SHOWABLE_LESSONS, WEB_APP_PATHS } from "../../globalVars";
import { getLinkPreviewObj } from "../../globalFns";
import moment from "moment";
import { nanoid } from "nanoid";
import { getLiveUnits } from "../../shared/fns";
import { UNITS_URL_PATH } from "../../shared/constants";
import { TWebAppForUI } from "../models/WebApp";
import dbWebApps from "../models/WebApp";

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

const deleteUnit = async (_id?: unknown, queryPair?: [string, unknown]) => {
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

    if(_id && (typeof _id !== 'string')){
      throw new Error(
        "`_id` must be a string."
      );
    }

    let deletionResult: DeleteResult;

    if (queryPair && queryPair.length > 0) {
      const [key, val] = queryPair;
      deletionResult = await Unit.deleteOne({ [key]: val });
    } else {
      deletionResult = await Unit.deleteOne({ _id: { $eq: _id } });
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
  projectionObj: ProjectionType<Partial<TProjections>>,
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

export type TCustomUpdate = Record<
  string,
  { [key in keyof INewUnitSchema]: unknown }
>;

const updateUnit = async (
  filterObj: Partial<{ [key in keyof INewUnitSchema]: unknown }>,
  updatedProps: Partial<INewUnitSchema>,
  customUpdate?: TCustomUpdate
) => {
  try {
    if (!Unit) {
      throw new Error(
        "Failed to connect to the database. `Units` collections does not exist."
      );
    }

    if (customUpdate) {
      console.log("Making a custom update.");

      const result = await Unit.updateMany(filterObj, customUpdate);

      if (result.matchedCount === 0) {
        return { errMsg: "No matching units were found in the database." };
      }

      console.log("result: ", result);

      return { wasSuccessful: result.modifiedCount >= 1 };
    }

    const { modifiedCount, matchedCount } = await Unit.updateMany(filterObj, {
      $set: updatedProps,
    });

    if (matchedCount === 0) {
      return { errMsg: "No matching units were found in the database." };
    }

    return { wasSuccessful: modifiedCount >= 1 };
  } catch (error) {
    const errMsg = `Failed to update the target lesson. Error message: ${error}.`;

    console.error(errMsg);

    return { errMsg: errMsg };
  }
};

const getGpMultiMedia = (units: INewUnitSchema[]) => {
  const gpVideos: IMultiMediaItemForUI[] = [];

  for (const unit of units) {
    if (!unit.FeaturedMultimedia || !unit) {
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
          id: nanoid(),
          ReleaseDate: ReleaseDate,
          lessonUnitTitle: Title,
          videoTitle: mediaItem.title,
          mainLink: mediaItem.mainLink,
          description: mediaItem.description ?? mediaItem.lessonRelevance,
          thumbnail: getVideoThumb(mediaItem.mainLink),
          unitNumId: numID,
          lessonNumId:
            mediaItem?.forLsn && Number.isInteger(+mediaItem?.forLsn)
              ? parseInt(mediaItem.forLsn)
              : null,
        });
      }
    }
  }

  const testUnits = units.filter(({ Title }) => Title === "TEST");

  console.log(`Length of testUnits: ${testUnits.length}`);

  return gpVideos;
};

type TWebAppImg = {
  webAppPreviewImg: string | null
  webAppImgAlt: string | null
}

const handleGetLinkPreviewObj = async (link: string): Promise<Partial<TWebAppImg>>  => {
  const linkPreviewObj = await getLinkPreviewObj(link);

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
    return {};
  }

  const images =
    "images" in linkPreviewObj && Array.isArray(linkPreviewObj.images)
      ? linkPreviewObj.images
      : [];
  const errMsg = "errMsg" in linkPreviewObj ? linkPreviewObj.errMsg : "";
  const title = "title" in linkPreviewObj ? linkPreviewObj.title : "";

  const webApp = {
    webAppPreviewImg: errMsg || !images?.length ? null : images[0],
    webAppImgAlt: errMsg || !images?.length ? null : `${title}'s preview image`,
  };

  return webApp;
};

const getGpWebApps = async (units: INewUnitSchema[]) => {
  const webApps: TWebAppForUI[] = [];

  for (const unit of units) {
    if (!unit.FeaturedMultimedia) {
      continue;
    }

    for (const multiMediaItem of unit.FeaturedMultimedia) {
      const isPresentInWebApps = webApps.find(
        (webApp) => webApp.webAppLink === multiMediaItem.mainLink
      );

      if (
        isPresentInWebApps ||
        !multiMediaItem.mainLink ||
        multiMediaItem.type !== "web-app"
      ) {
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

      const webApp: TWebAppForUI = {
        lessonIdStr: multiMediaItem?.forLsn,
        unitNumID: unit.numID,
        webAppLink: multiMediaItem.mainLink,
        title: multiMediaItem.title,
        unitTitle: unit.Title,
        description: multiMediaItem.lessonRelevance,
        webAppPreviewImg: errMsg || !images?.length ? null : images[0],
        webAppImgAlt:
          errMsg || !images?.length ? null : `${title}'s preview image`,        
        aboutWebAppLink: null,
        aboutWebAppLinkType: "unit",
        pathToFile
      };

      webApps.push(webApp);
    }
  }

  const allDbWebApps = await dbWebApps.find({}, { _id: 0, __v: 0 }).lean();
  const unitNumIds = allDbWebApps
    .map((webApp) => webApp.unitNumID)
    .filter(Boolean);
  let dbUnits: INewUnitSchema[] | undefined = undefined;

  if (unitNumIds.length) {
    dbUnits = (await retrieveUnits({ numID: { $in: unitNumIds } }, {})).data;
  }

  for (const dbWebApp of allDbWebApps) {
    let webApp: TWebAppForUI = {
      lessonIdStr: dbWebApp?.lessonIdStr,
      unitNumID: dbWebApp.unitNumID,
      webAppLink: dbWebApp.webAppLink,
      title: dbWebApp.title,
      description: dbWebApp.description,
      pathToFile: dbWebApp.pathToFile,
      unitTitle: null,
      webAppPreviewImg: null,
      webAppImgAlt: null,
      aboutWebAppLinkType: dbWebApp.aboutWebAppLinkType,
      aboutWebAppLink: dbWebApp.aboutWebAppLink
    };

    if (dbUnits?.length) {
      webApp = {
        ...webApp,
        unitTitle:
          dbUnits.find((unit) => unit.numID === dbWebApp.unitNumID)?.Title ??
          null,
      };
    }

    const webAppImg = await handleGetLinkPreviewObj(dbWebApp.webAppLink);

    webApp = {
      ...webApp,
      ...webAppImg
    }

    if(dbWebApp.aboutWebAppLinkType === "blog" && dbWebApp.aboutWebAppLink){
      const resBody = await getLinkPreviewObj(dbWebApp.aboutWebAppLink)
      webApp = {
        ...webApp,
        blogPostTitle: "title" in resBody ? resBody.title : null 
      }
    }

    webApps.push(webApp as TWebAppForUI);
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
        // check if the lesson part is a the assessments
        if (lesson.lsn === 100) {
          continue;
        }

        if (lesson?.status?.toLowerCase() === "upcoming") {
          console.log("The lesson is upcoming. Skipping...");
          continue;
        }

        const wasLessonFounded = !!unitLessons.find(
          (unitLesson) => unitLesson.lessonPartTitle === lesson.title
        );

        if (wasLessonFounded) {
          continue;
        }

        const unitLesson = {
          tags: lesson.tags ?? null,
          lessonPartPath: `/${UNITS_URL_PATH}/${unit.locale}/${unit.numID}#lesson_part_${lesson.lsn}`,
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
          sortByDate: lesson.sort_by_date,
        };

        unitLessons.push(unitLesson);
      }
    }
  }

  return unitLessons;
};

const getIsUnitNew = (releaseDate: Date, now: number) => {
  const releaseDateMilliseconds = new Date(releaseDate).getTime();
  const endDateOfNewReleaseMs =
    releaseDateMilliseconds + 1_000 * 60 * 60 * 24 * 37; // 37 days
  const isNew = now > releaseDateMilliseconds && now < endDateOfNewReleaseMs;

  return isNew;
};

const filterInShowableUnits = (units: INewUnitSchema[], nowMs: number, willGetUnitMetaData = true) => {
  const liveUnits = getLiveUnits(units).filter((unit) => unit?.ReleaseDate);

  if(!willGetUnitMetaData){
    return liveUnits as ILiveUnit[];
  }

  return liveUnits.map((unit) => {
    const individualLessonsNum =
      unit?.Sections?.teachingMaterials?.classroom?.resources?.reduce(
        (totalLiveLessons, resource) => {
          if (!resource.lessons?.length) {
            return totalLiveLessons;
          }
          const liveLessonsNum = resource.lessons.filter((lesson) =>
            lesson?.status
              ? STATUSES_OF_SHOWABLE_LESSONS.includes(lesson?.status)
              : false
          ).length;

          return totalLiveLessons + liveLessonsNum;
        },
        0
      ) ?? 0;
    const lessonObj = {
      ...unit,
      individualLessonsNum,
      ReleaseDate: moment(unit.ReleaseDate).format("YYYY-MM-DD"),
      isNew: getIsUnitNew(new Date(unit.ReleaseDate as string), nowMs),
    };

    return lessonObj as ILiveUnit;
  });
};

export {
  insertUnit,
  deleteUnit,
  filterInShowableUnits,
  retrieveUnits,
  updateUnit,
  createDbFilter,
  getGpMultiMedia,
  getGpWebApps,
  getUnitLessons,
};
