import { ReactNode, CSSProperties } from "react"

// front-end
interface IComponent{
    index: number
    children: ReactNode
    className: string;
    style: CSSProperties
}
export type TSetter<TData> = React.Dispatch<React.SetStateAction<TData>>
export type TUseStateReturnVal<TData> = [TData, TSetter<TData>]


export { IComponent }