export interface ICopyUnitResult{
    _id: string,
    userId: string,
    datetime: Date,
    unitId: string,
    result: "success" | "error",
    errMsg?: string,
    unitFolderLink?: string,
}