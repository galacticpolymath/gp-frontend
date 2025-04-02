import { ReactNode, CSSProperties } from "react";
import { IItem, ILesson } from "../backend/models/Unit/types/teachingMaterials";

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
export interface IUserSession extends Session{
  token: string
}

// For the unit page
interface ISectionDot {
  isInView: boolean;
  sectionTitleForDot: string;
  sectionId: string;
  willShowTitle: boolean;
  sectionDotId: string;
}

interface IItemForClient extends IItem{
  filePreviewImg: string
}

interface ISectionDots {
  clickedSectionId: string | null;
  dots: ISectionDot[];
}

export { IComponent, ILessonForUI, TUseStateReturnVal, TSetter, ISectionDot, ISectionDots, IItemForClient };
