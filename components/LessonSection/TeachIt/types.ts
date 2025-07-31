/* eslint-disable quotes */

import {
  ITeachingMaterialsDataForUI,
  IUnitTeachingMaterials,
} from "../../../backend/models/Unit/types/teachingMaterials";
import { IUnit } from "../../../backend/models/Unit/types/unit";
import {
  IComponent,
  ILessonForUI,
  ISectionDots,
  TUseStateReturnVal,
} from "../../../types/global";
import { ITeachItServerProps, TeachItUIProps, TUnitPropsForTeachItSec } from "./TeachItUI";

type TTargetUnitKeys = keyof Pick<IUnit, "ForGrades" | "GradesOrYears">;
type TTargetUnitProps<TKey extends TTargetUnitKeys = TTargetUnitKeys> = {
  [key in TKey]: IUnit[key];
};

export interface TeachItProps
  extends Pick<IComponent, "index">,
    TTargetUnitProps,
    IUnitTeachingMaterials, TUnitPropsForTeachItSec, ITeachItServerProps {
  Data: ITeachingMaterialsDataForUI<ILessonForUI> | null;
  _sectionDots: TUseStateReturnVal<ISectionDots>;
  SectionTitle: string;
}
