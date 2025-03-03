import { ITeachingMaterialsData } from "../../../backend/models/Unit/types/teachingMaterials";
import { IUnit } from "../../../backend/models/Unit/types/unit";
import { IComponent, ILessonForUI, ISectionDots, TUseStateReturnVal } from "../../../types/global";

type TTargetUnitKeys = keyof Pick<IUnit, "ForGrades" | "GradesOrYears">;
type TTargetUnitProps<TKey extends TTargetUnitKeys = TTargetUnitKeys> = {
    [key in TKey]: IUnit[TKey]
};

export interface TeachItProps extends Pick<IComponent, "index">, TTargetUnitProps{
    Data: ITeachingMaterialsData<ILessonForUI> | null,
    _sectionDots: TUseStateReturnVal<ISectionDots>,
    SectionTitle: string
}
