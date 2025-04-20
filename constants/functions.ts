import moment from "moment";
import {
  IFeaturedMultimedia,
  INewUnitSchema,
} from "../backend/models/Unit/types/unit";
import { getVideoThumb } from "../components/LessonSection/Preview/utils";
import { IMultiMediaItemForUI, IUnitForUnitsPg } from "../types/global";
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
        if(!unit.PublicationStatus){
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
            console.log("unit, sup there, unit.numID: ", unit.numID);
            const targetUnitIndex = uniqueUnits.findIndex(
                (uniqueUnit) => unit.numID == uniqueUnit.numID
            );
            let targetUnit = uniqueUnits[targetUnitIndex];

            if(unit.locale && targetUnit?.locals && targetUnit.locale){
              targetUnit = {
                ...targetUnit,
                locals: targetUnit?.locals
                ? [...targetUnit?.locals, unit.locale]
                : [targetUnit.locale, unit.locale],
              };
            }

            uniqueUnits[targetUnitIndex] = targetUnit;
        }
    }

    return uniqueUnits;
};

// COPY THIS:
// {
//                         ReleaseDate: ReleaseDate,
//                         lessonUnitTitle: Title,
//                         videoTitle: media.title,
//                         mainLink: media.mainLink,
//                         description: media.description ?? media.lessonRelevance,
//                         thumbnail: getVideoThumb(media.mainLink),
//                         unitNumId: numID,
//                         lessonNumId:
//                             media.forLsn && Number.isInteger(+media.forLsn)
//                                 ? parseInt(media.forLsn)
//                                 : null,
//                     }

