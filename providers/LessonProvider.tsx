/* eslint-disable react/jsx-indent-props */
/* eslint-disable indent */
/* eslint-disable react/jsx-indent */
/* eslint-disable quotes */
import { createContext, useContext, useState } from "react";
import { TUseStateReturnVal } from "../types/global";
import { TFileToCopy } from "../backend/services/gdriveServices/types";

type TSelectedLessonToCopy = {
  id: string;
  willOpenGDrivePicker: boolean;
};
type TFailedCopiedLessonFile = TFileToCopy[] | null;
export type TLessonProviderVal = {
  _lessonToCopy: TUseStateReturnVal<TSelectedLessonToCopy | null>;
  _lessonsCopyJobs: TUseStateReturnVal<string[]>;
  _failedCopiedLessonFiles: TUseStateReturnVal<TFailedCopiedLessonFile>;
};

export const LessonContext = createContext<TLessonProviderVal | null>(null);

export const LessonProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [lessonToCopy, setLessonToCopy] =
    useState<TSelectedLessonToCopy | null>(null);
  const [lessonsCopyJobs, setLessonsCopyJobs] = useState<string[]>([]);
  const [failedCopiedLessonFiles, setFailedCopiedLessonFiles] =
    useState<TFailedCopiedLessonFile>(null);
  const value: TLessonProviderVal = {
    _lessonToCopy: [lessonToCopy, setLessonToCopy],
    _lessonsCopyJobs: [lessonsCopyJobs, setLessonsCopyJobs],
    _failedCopiedLessonFiles: [
      failedCopiedLessonFiles,
      setFailedCopiedLessonFiles,
    ],
  };

  return (
    <LessonContext.Provider value={value}>{children}</LessonContext.Provider>
  );
};

export const useLessonContext = () => {
  const context = useContext(LessonContext);

  if (!context) {
    throw new Error("Unable to use ModalContext.");
  }

  return context;
};
