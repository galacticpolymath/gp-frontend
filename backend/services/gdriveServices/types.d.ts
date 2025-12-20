import { renameFiles } from '.';

export interface IFile {
  title: string;
  [key: string]: unknown;
}
export type TRenameFilesResult = {
  failedUpdatedFiles?: { id: string; name: string }[];
  wasSuccessful: boolean;
  errType?: 'fileUpdateErr' | 'renameFilesFailed' | 'invalidAuthToken';
};
export type TFilesToRename = (Parameters<typeof renameFiles>[0][number] & { fileIdInGpGoogleDrive: string })[]
export type TFileToCopy = {
  id: string
  name: string;
}