/* eslint-disable react/jsx-indent-props */
/* eslint-disable indent */
/* eslint-disable react/jsx-indent */
/* eslint-disable quotes */
import { createContext, useContext, useState } from "react";
import { TUseStateReturnVal } from "../types/global";
import { TCopyFilesMsg } from "../pages/api/gp-plus/copy-lesson";

type TLessonToCopy = { gdriveLessonFolderId: string; name: string };
type TCopyLessonJob = Partial<
  {
    toastId: string;
    isToastDisplayed: boolean;
  } & TCopyFilesMsg
>;
export type TLessonProviderVal = {
  _lessonToCopy: TUseStateReturnVal<TLessonToCopy | null>;
  _lessonsCopyJobs: TUseStateReturnVal<string[]>;
};

export const LessonContext = createContext<TLessonProviderVal | null>(null);

export const LessonProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [lessonToCopy, setLessonToCopy] = useState<TLessonToCopy | null>(null);
  const [lessonsCopyJobs, setLessonsCopyJobs] = useState<string[]>([]);
  const value: TLessonProviderVal = {
    _lessonToCopy: [lessonToCopy, setLessonToCopy],
    _lessonsCopyJobs: [lessonsCopyJobs, setLessonsCopyJobs],
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
