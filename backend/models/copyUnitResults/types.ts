export interface ICopyUnitResult{
    _id: string,
    userId: string,
    datetime: Date,
    unitId: string,
    result: "success" | "error",
    doesCopyExistInUserGDrive: boolean;
    errMsg?: string,
    gdriveFolderId?: string,
}