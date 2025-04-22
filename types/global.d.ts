import { ReactNode, CSSProperties } from "react";
import { IItem, ILesson } from "../backend/models/Unit/types/teachingMaterials";
import {
  IFeaturedMultimedia,
  INewUnitSchema,
} from "../backend/models/Unit/types/unit";

// front-end
interface IComponent {
  index: number;
  children: ReactNode;
  className: string;
  style: CSSProperties;
}
type TSetter<TData> = React.Dispatch<React.SetStateAction<TData>>;
type TUseStateReturnVal<TData> = [TData, TSetter<TData>];
export interface ILessonForUI extends ILesson {
  lsn: string;
  status: string;
}
export interface IUserSession extends Session {
  token: string;
}

// For the unit page
interface ISectionDot {
  isInView: boolean;
  sectionTitleForDot: string;
  sectionId: string;
  willShowTitle: boolean;
  sectionDotId: string;
}

interface IItemForClient extends IItem {
  filePreviewImg: string;
}

interface ISectionDots {
  clickedSectionId: string | null;
  dots: ISectionDot[];
}

// for the units page
interface IMultiMediaItemForUI
  extends Pick<INewUnitSchema, "ReleaseDate">,
    Pick<IFeaturedMultimedia, "description" | "mainLink"> {
  id: string;
  lessonUnitTitle: string | null;
  videoTitle: string | null;
  thumbnail: string;
  unitNumId: number | null;
  lessonNumId: number | null;
}

export interface IWebAppLink {
  lessonIdStr: string | null;
  unitNumID: INewUnitSchema["numID"];
  webAppLink: string;
  title: string | null;
  unitTitle: INewUnitSchema["Title"] | null;
  description: string | null;
  webAppPreviewImg: string | null;
  webAppImgAlt: string | null;
  pathToFile: string | null;
}

export interface IUnitLesson {
  tags: string[] | null;
  lessonPartPath: string | null;
  tile: string | null;
  lessonPartTitle: string | null;
  dur: number | null;
  preface: string | null;
  lessonPartNum: number | null;
  unitTitle: INewUnitSchema["Title"];
  subject: INewUnitSchema["TargetSubject"];
  grades: INewUnitSchema["ForGrades"];
  gradesOrYears: INewUnitSchema["GradesOrYears"];
  status: string | null;
  sortByDate: string | null;
}

export interface IUnitForUnitsPg extends INewUnitSchema {
  locals?: string[] | null;
}

type TLiveUnit = INewUnitSchema & {
  individualLessonsNum: number;
  isNew?: boolean;
};

interface ILiveUnit extends Pick<IUnitForUnitsPg, "locals">, TLiveUnit {}

interface ICurrentUnits {
  units: IGpUnitsItemsPg<ILiveUnit>;
  lessons: IGpUnitsItemsPg<IUnitLesson>;
  webApps: IGpUnitsItemsPg<IWebAppLink>;
  gpVideos: IGpUnitsItemsPg<IMultiMediaItemForUI>;
}

type TGpData = ILiveUnit | IUnitLesson | IWebAppLink | IMultiMediaItemForUI;

interface IGpUnitsItemsPg<TData extends object> {
  isLast: boolean;
  data: TData[];
  totalItemsNum: number;
  didErrorOccur: boolean;
}

export {
  IGpUnitsItemsPg,
  TLiveUnit,
  TGpData,
  ILiveUnit,
  IComponent,
  ILessonForUI,
  IUnitLesson,
  IWebAppLink,
  IMultiMediaItemForUI,
  TUseStateReturnVal,
  TSetter,
  ISectionDot,
  ISectionDots,
  IItemForClient,
  ICurrentUnits,
};
