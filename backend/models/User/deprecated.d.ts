import { IAgeGroupsSelection } from "./types";

export type  TAboutUserFormDeprecated<TMutableObj extends object = Record<string, unknown>> = Partial<{
  /**
   * @deprecated
   * Use `gradesType` and `gradesTaught` instead
   */
  gradesOrYears: IAgeGroupsSelection;
  /**
   * @deprecated
   * Use `firstName` and `lastName` instead
   */
  name: {
    first: string;
    last: string;
  };
  /**
   * @deprecated Use `siteVisitReasonsDefault` and `siteVisitReasonsCustom` instead
   */
  reasonsForSiteVisit?: TMutableObj;
  /**
   * @deprecated
   * Use `subjectsTaughtDefault` and `subjectsTaughtCustom` instead
   */
  subjects?: TMutableObj;
  /**
   * @deprecated
   * Use `classSize: number` and `isNotTeaching: boolean` instead
   */
  classroomSize: {
    num: number;
    isNotTeaching: boolean;
  };
}>

