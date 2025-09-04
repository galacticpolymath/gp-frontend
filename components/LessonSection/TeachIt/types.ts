/* eslint-disable quotes */

import {
  ITeachingMaterialsDataForUI,
  IUnitTeachingMaterials,
} from "../../../backend/models/Unit/types/teachingMaterials";
import { INewUnitSchema } from "../../../backend/models/Unit/types/unit";
import {
  IComponent,
  ILessonForUI,
  ISectionDots,
  TUseStateReturnVal,
} from "../../../types/global";
import { ITeachItServerProps, TUnitPropsForTeachItSec } from "./TeachItUI";

type TTargetUnitKeys = keyof Pick<INewUnitSchema, "ForGrades" | "GradesOrYears">;
type TTargetUnitProps<TKey extends TTargetUnitKeys = TTargetUnitKeys> = {
  [key in TKey]: INewUnitSchema[key];
};
export interface TeachItProps
  extends Pick<IComponent, "index">,
    TTargetUnitProps,
    IUnitTeachingMaterials, TUnitPropsForTeachItSec, ITeachItServerProps {
  Data: ITeachingMaterialsDataForUI<ILessonForUI> | null;
  _sectionDots: TUseStateReturnVal<ISectionDots>;
  SectionTitle: string;
}
