/* eslint-disable semi */
/* eslint-disable quotes */
/* eslint-disable no-console */
/* eslint-disable indent */
import {
  createPaginationArr,
} from "../../globalFns";
import { getUnits } from "../helperFns/lessonsFns";
import { CustomError } from "../utils/errors";
import cache from "../utils/cache";
import { getGpMultiMedia, getUnitLessons, retrieveUnits } from "./unitServices";
import { getLiveUnits, getTotalUnitLessons } from "../../constants/functions";
import NodeCache from "node-cache";
import { IMultiMediaItemForUI, IUnitLesson } from "../../types/global";
import { TGpUnitDataType } from "../../customHooks/useGetGpDataStates";

const GP_DATA_EXPIRATION_TIME_MS = 3_600_000 * 12;

export const cacheGpUnitData = async () => {
  try {
    let { data: units } = await retrieveUnits({}, {});

    if (!units?.length) {
      throw new CustomError("Failed to get gp units from the db.", 500);
    }

    const unitsWithTotalLessons = units.map(getTotalUnitLessons);
    const lessons = createPaginationArr(getUnitLessons(unitsWithTotalLessons));
    const videos = createPaginationArr(getGpMultiMedia(unitsWithTotalLessons));
    const wasSuccessful = cache.mset([
      {
        key: "lessons",
        val: lessons,
        ttl: GP_DATA_EXPIRATION_TIME_MS,
      },
      {
        key: "videos",
        val: videos,
        ttl: GP_DATA_EXPIRATION_TIME_MS,
      },
    ]);

    if (!wasSuccessful) {
      throw new CustomError("Failed to cache gp data", 500);
    }

    return { wasSuccessful: true };
  } catch (error: any) {
    const { message, code } = error ?? {};
    const errMsg = message
      ? `An error has occurred: ${message}`
      : "Failed to cache gp data.";
    console.error(errMsg);

    return { wasSuccessful: false, errMsg, errorStatusCode: code ?? 500 };
  }
};

const GP_UNITS_DATA_RETRIEVAL_FNS = [
  {
    name: "videos",
    fn: getGpMultiMedia,
  },
  {
    name: "lessons",
    fn: getUnitLessons,
  },
] as const;

const getGpDataGetterFn = (targetFnNameStr: Exclude<TGpUnitDataType, "units">) =>
  GP_UNITS_DATA_RETRIEVAL_FNS.find((fnObj) => fnObj.name === targetFnNameStr);

export const getCachedGpUnitData = async <TGpUnitsData extends IUnitLesson | IMultiMediaItemForUI,>(
  { type, pageNum }: { type: "videos" | "lessons"; pageNum: number },
  cache: NodeCache
) => {
  try {
    const getGpData = getGpDataGetterFn(type)?.fn;

    if (!getGpData) {
      throw new CustomError("The value for `type` is invalid.", 400);
    }

    let gpDataArr = cache.get(type) as [TGpUnitsData][];
    let totalItemsNum = gpDataArr?.length ? gpDataArr?.flat()?.length : null;

    if (!gpDataArr?.length) {
      let { data: units, errMsg  } = await retrieveUnits({}, {}, 0, { ReleaseDate: -1 });

      if (!units?.length) {
        console.error("Failed to get the units from the database. Reason: ", errMsg);

        throw new CustomError(
          "Failed to get the units from the database.",
          500
        );
      }

      const liveUnits = getLiveUnits(units);
      const targetGpDataArr = getGpData(liveUnits);
      totalItemsNum = targetGpDataArr.length
      gpDataArr = createPaginationArr(targetGpDataArr);
      cache.set(type, gpDataArr, GP_DATA_EXPIRATION_TIME_MS);
    }
    console.log(`getCachedGpUnitData: pageNum: ${pageNum}, its type: (${typeof pageNum})`);
    const pageQueriedByClient = gpDataArr[+pageNum];

    if (!pageQueriedByClient) {
      throw new CustomError(
        "Failed to get the next page of lessons. `pageNum` index is out of range of the array that contains the videos",
        400
      );
    }

    return {
      data: pageQueriedByClient,
      isLast: gpDataArr.length - 1 === +pageNum,
      totalItemsNum: totalItemsNum,
    };
  } catch (error: any) {
    const { message, code } = error;
    console.log("ERROR STATUS CODE: ", code);
    console.error("Failed to get cached data. Reason: ", message);

    return {
      errMsg: message ?? "Failed to get cached gp data.",
      errorStatusCode: code ?? 500,
    };
  }
};
