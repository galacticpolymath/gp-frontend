import { ReactNode, CSSProperties } from "react";
import { ILesson } from "../backend/models/Unit/types/teachingMaterials";

// front-end
interface IComponent {
  index: number;
  children: ReactNode;
  className: string;
  style: CSSProperties;
}
type TSetter<TData> = React.Dispatch<React.SetStateAction<TData>>;
type TUseStateReturnVal<TData> = [TData, TSetter<TData>];
interface ILessonForUI extends ILesson {
  status: string;
}

// For the unit page
interface ISectionDot {
  isInView: boolean;
  sectionTitleForDot: string;
  sectionId: string;
  willShowTitle: boolean;
  sectionDotId: string;
}

interface ISectionDots {
  clickedSectionId: string | null;
  dots: ISectionDot[];
}

export { IComponent, ILessonForUI, TUseStateReturnVal, TSetter, ISectionDot, ISectionDots };
