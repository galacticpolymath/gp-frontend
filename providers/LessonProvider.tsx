/* eslint-disable react/jsx-indent-props */
/* eslint-disable indent */
/* eslint-disable react/jsx-indent */
/* eslint-disable quotes */
import { createContext, useContext, useState } from "react";
import { TUseStateReturnVal } from "../types/global";


type TLessonToCopy = { gdriveLessonFolderId: string; name: string };
export type TLessonProviderVal = {
  _lessonToCopy: TUseStateReturnVal<TLessonToCopy | null>;
};

export const LessonContext = createContext<TLessonProviderVal | null>(null);

export const LessonProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
const [lessonToCopy, setLessonToCopy] = useState<TLessonToCopy | null>(null);
  const value: TLessonProviderVal = {
    _lessonToCopy: [lessonToCopy, setLessonToCopy],
  };

  return <LessonContext.Provider value={value}>{children}</LessonContext.Provider>;
};

export const useLessonContext = () => {
  const context = useContext(LessonContext);

  if (!context) {
    throw new Error("Unable to use ModalContext.");
  }

  return context;
};
