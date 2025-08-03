import moment from "moment";
import { INewUnitSchema } from "../backend/models/Unit/types/unit";
import { ILocalStorage, IUnitForUnitsPg, TLiveUnit } from "../types/global";
import { GOOGLE_DRIVE_PROJECT_CLIENT_ID, STATUSES_OF_SHOWABLE_LESSONS } from "../globalVars";

export const random = (min: number, max: number) => Math.floor(Math.random() * (max - min)) + min;

export function getIsMouseInsideElement(element: HTMLElement, { xCordinate, yCordinate }: { xCordinate: number, yCordinate: number }) {
  const rect = element.getBoundingClientRect();;

  return (
    xCordinate > rect.left &&
    xCordinate < rect.right &&
    yCordinate > rect.top &&
    yCordinate < rect.bottom
  );
}

// front-end related
export const checkIfElementClickedWasClipboard = (
  parentElement: unknown
): boolean => {
  if (
    parentElement &&
    typeof parentElement === "object" &&
    "nodeName" in parentElement &&
    typeof parentElement.nodeName === "string" &&
    parentElement?.nodeName?.toLowerCase() === "body"
  ) {
    console.log("Clip board icon wasn't clicked...");
    return false;
  }

  if (
    parentElement &&
    typeof parentElement === "object" &&
    "id" in parentElement &&
    parentElement.id === "clipboardIconWrapper"
  ) {
    console.log("clip board icon was clicked...");
    return true;
  }

  return checkIfElementClickedWasClipboard(
    (parentElement as { parentElement: unknown }).parentElement
  );
};

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

export const removeLocalStorageItem = (key: keyof ILocalStorage) => {
    localStorage.removeItem(key);
}

export const setLocalStorageItem = <TKey extends keyof ILocalStorage,
  TVal extends ILocalStorage[TKey]>(key: TKey, val: TVal) => {
    localStorage.setItem(key, JSON.stringify(val)); 
}

export const getLocalStorageItem = <TKey extends keyof ILocalStorage,
  TVal extends ILocalStorage[TKey]>(key: TKey): TVal | null => {
    try {
      if(typeof localStorage === "undefined") {
        return null;
      }

      const parsableVal = localStorage.getItem(key);

      if (!parsableVal) {
        return null;
      }

      return JSON.parse(parsableVal) as TVal; 
    } catch(error){
      console.error("Failed to retrieve the target item. Reason: ", error);

      return null;
    }
}

export const createGDriveAuthUrl = () => {
  const authUrl = new URL("https://accounts.google.com/o/oauth2/auth");
  // protects against CSRF attacks
  const state = Math.random().toString(36).substring(7);
  const _redirectUri = new URL(`${window.location.origin}/google-drive-auth-result`);


  console.log("_redirectUri: ", _redirectUri.href);

  const scopes =
    "https://www.googleapis.com/auth/drive.file";
  const params = [
    ["state", state],
    [
      "client_id",
      GOOGLE_DRIVE_PROJECT_CLIENT_ID,
    ],
    ["redirect_uri", _redirectUri.href],
    ["scope", scopes],
    ["response_type", "code"],
    ["access_type", "offline"],
    ["include_granted_scopes", "true"],
    ["prompt", "consent"],
  ];

  for (const [key, val] of params) {
    authUrl.searchParams.append(key.trim(), val.trim());
  }

  return authUrl.href;
}

const getIsWithinTargetElements = (selectorName: Set<string>, targetAttributeVal: string) => {
  const selectorNames = Array.from(selectorName);
  let isWithinElement = false;

  for (const selectorName of selectorNames) {
    if(selectorName.includes(targetAttributeVal)){
      isWithinElement = true;

      return isWithinElement;
    }
  }


  return isWithinElement;
}

export const getIsWithinParentElement = (
  element: HTMLElement,
  selectorName: string | Set<string>,
  attributeType: "className" | "id" = "className",
  comparisonType: "includes" | "strictEquals"
): boolean => {
  if (
    !element?.parentElement ||
    (element?.parentElement &&
      attributeType in element.parentElement &&
      element?.parentElement[attributeType] === undefined)
  ) {
    console.log("Reached end of document.");
    return false;
  }

  let isWithinParentElement = false;

  // if selectorName is a Set string, then using the value for attributeType query, check if the value appears in the array

  if (comparisonType === "includes" && element.parentElement[attributeType]) {
    const attributeVal = element.parentElement[attributeType];
    isWithinParentElement =
      typeof selectorName === "string"
        ? element.parentElement[attributeType].includes(selectorName)
        : getIsWithinTargetElements(selectorName, attributeVal);
  } else if (
    comparisonType === "strictEquals" &&
    element.parentElement[attributeType]
  ) {
    const attributeVal = element.parentElement[attributeType];
    isWithinParentElement =
      element.parentElement[attributeType] === selectorName;
    isWithinParentElement =
      typeof selectorName === "string"
        ? attributeVal === selectorName
        : selectorName.has(attributeVal);
  }

  if (
    element?.parentElement != null &&
    typeof element?.parentElement === "object" &&
    typeof element.parentElement[attributeType] === "string" &&
    isWithinParentElement
  ) {
    return true;
  }

  return getIsWithinParentElement(
    element.parentElement,
    selectorName,
    attributeType,
    comparisonType
  );
}