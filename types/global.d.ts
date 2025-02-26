import { ReactNode, CSSProperties } from "react"

interface IComponent{
    index: number
    children: ReactNode
    className: string;
    style: CSSProperties
}