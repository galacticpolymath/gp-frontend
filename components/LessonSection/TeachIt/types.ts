/* eslint-disable quotes */

import { TUnitOverviewPropsForUI } from "../../../backend/models/Unit/types/overview";
import {
  ITeachingMaterialsDataForUI,
  IUnitTeachingMaterials,
} from "../../../backend/models/Unit/types/teachingMaterials";
import { INewUnitSchema, IUnit } from "../../../backend/models/Unit/types/unit";
import {
  IComponent,
  ILessonForUI,
  ISectionDots,
  TUseStateReturnVal,
} from "../../../types/global";

type TTargetUnitKeys = keyof Pick<IUnit, "ForGrades" | "GradesOrYears">;
type TTargetUnitProps<TKey extends TTargetUnitKeys = TTargetUnitKeys> = {
  [key in TKey]: IUnit[key];
};

export interface TeachItProps
  extends Pick<IComponent, "index">,
    TTargetUnitProps,
    IUnitTeachingMaterials, Partial<Pick<INewUnitSchema, "GdrivePublicID" | "Title">> {
  Data: ITeachingMaterialsDataForUI<ILessonForUI> | null;
  _sectionDots: TUseStateReturnVal<ISectionDots>;
  SectionTitle: string;
}
