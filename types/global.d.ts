import { ReactNode, CSSProperties } from "react"
import { ILesson } from "../backend/models/Unit/types/teachingMaterials";

// front-end
interface IComponent{
    index: number
    children: ReactNode
    className: string;
    style: CSSProperties
}
type TSetter<TData> = React.Dispatch<React.SetStateAction<TData>>
type TUseStateReturnVal<TData> = [TData, TSetter<TData>]
interface ILessonForUI extends ILesson{
  status: string
}


export { IComponent, ILessonForUI, TUseStateReturnVal, TSetter }