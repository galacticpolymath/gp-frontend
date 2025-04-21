import moment from "moment";
import { INewUnitSchema } from "../backend/models/Unit/types/unit";
import { IUnitForUnitsPg, TLiveUnit } from "../types/global";
import { STATUSES_OF_SHOWABLE_LESSONS } from "../globalVars";

export const createDbProjections = (fields: string[]) => {
  return fields.reduce((dbProjections, field) => {
    return {
      ...dbProjections,
      [field]: 1,
    };
  }, {});
};

export const getLiveUnits = (units: INewUnitSchema[]) => {
  const uniqueUnits: IUnitForUnitsPg[] = [];
  const todaysDate = new Date();

  for (const unit of units) {
    if (!unit.PublicationStatus) {
      console.log("No status for unit: ", unit);
      continue;
    }

    if (
      STATUSES_OF_SHOWABLE_LESSONS.includes(unit.PublicationStatus) &&
      !uniqueUnits.some((uniqueUnit) => unit.numID === uniqueUnit.numID) &&
      moment(unit.ReleaseDate).format("YYYY-MM-DD") <=
        moment(todaysDate).format("YYYY-MM-DD")
    ) {
      uniqueUnits.push(unit);
      continue;
    }

    if (
      STATUSES_OF_SHOWABLE_LESSONS.includes(unit.PublicationStatus) &&
      uniqueUnits.some((uniqueUnit) => unit.numID == uniqueUnit.numID)
    ) {
      const targetUnitIndex = uniqueUnits.findIndex(
        (uniqueUnit) => unit.numID == uniqueUnit.numID
      );
      let targetUnit = uniqueUnits[targetUnitIndex];

      if (unit.locale && targetUnit?.locals && targetUnit.locale) {
        targetUnit = {
          ...targetUnit,
          locals: [...targetUnit?.locals, unit.locale],
        };
      } else if (unit.locale && targetUnit.locale) {
        targetUnit = {
          ...targetUnit,
          locals: [targetUnit.locale, unit.locale],
        };
      }

      uniqueUnits[targetUnitIndex] = targetUnit;
    }
  }

  return uniqueUnits;
};

export const getTotalUnitLessons = (unit: INewUnitSchema) => {
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
  const unitObjUpdated = {
    ...unit,
    individualLessonsNum,
    ReleaseDate: moment(unit.ReleaseDate).format("YYYY-MM-DD"),
  } as TLiveUnit;

  return unitObjUpdated;
};
