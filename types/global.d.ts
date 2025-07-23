import { ReactNode, CSSProperties } from "react";
import { IItem, IItemV2, ILesson } from "../backend/models/Unit/types/teachingMaterials";
import { REFERRED_BY_OPTS } from '../shared/constants';
import {
  IFeaturedMultimedia,
  INewUnitSchema,
} from "../backend/models/Unit/types/unit";
import { Session } from "next-auth";
import { TAboutUserForm, TUserSchemaForClient } from "../backend/models/User/types";
import { TWebAppForUI } from "../backend/models/WebApp";
import { TUserAccount } from "../providers/UserProvider";

declare global {
  interface Window {
    Outseta?: {
      logout: () => Promise<void>;
      setMagicLinkIdToken: (idToken: string) => void;
      auth: {
        close: () => Promise<void>;
      }
    };
  }
}
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

interface IItemForClient extends IItemV2 {
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
  unitNumID: INewUnitSchema["numID"] | null;
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
  units: IGpUnitsItemsPg<ILiveUnit> | null;
  lessons: IGpUnitsItemsPg<IUnitLesson> | null;
  webApps: IGpUnitsItemsPg<TWebAppForUI> | null;
  gpVideos: IGpUnitsItemsPg<IMultiMediaItemForUI> | null;
}

type TGpData = ILiveUnit | IUnitLesson | TWebAppForUI | IMultiMediaItemForUI;

interface IGpUnitsItemsPg<TData extends object> {
  isLast: boolean;
  data: TData[];
  totalItemsNum: number;
  didErrorOccur: boolean;
}

type TInputType = 
  | "button"
  | "checkbox"
  | "color"
  | "date"
  | "datetime-local"
  | "email"
  | "file"
  | "hidden"
  | "image"
  | "month"
  | "number"
  | "password"
  | "radio"
  | "range"
  | "reset"
  | "search"
  | "submit"
  | "tel"
  | "text"
type TReferredByOpt = (typeof REFERRED_BY_OPTS)[number];
export type TEnvironment = "dev" | "production"
export interface IUpdatedUserReqBody{
  updatedUser: Partial<Omit<IUserSchema, "password" | "_id">>
  clientUrl: string
  willUpdateMailingListStatusOnly?: boolean
  willSendEmailListingSubConfirmationEmail?: boolean
} 

export interface IUpdatedAboutUserForm{
  aboutUserForm: TAboutUserForm<Map>
}

export interface ILocalStorage{
  gpPlusFeatureLocation: string;
  didGpSignInAttemptOccur: boolean;
  userAccount: TUserSchemaForClient
}

interface IErr<TErrType extends string = string>{
  errType: TErrType,
  errMsg: string
}

export {
  IErr,
  TReferredByOpt,
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
  TInputType,
  ICurrentUnits,
};
