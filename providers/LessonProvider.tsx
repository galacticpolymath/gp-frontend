import React, { createContext, PropsWithChildren, useContext, useState } from 'react';
import { TUseStateReturnVal } from '../types/global';
import { TFileToCopy } from '../backend/services/gdriveServices/types';
import {
  IItemV2,
  IItemV2Props,
} from '../backend/models/Unit/types/teachingMaterials';

type TSelectedLessonToCopy = {
  id: string;
  willOpenGDrivePicker: boolean;
};
interface IFailedLessonCopyBugReport {
  failedCopiedLessons: TFileToCopy[];
  unitName: string;
  lessonName: string;
}
export type TSelectedLessonItems = {
  index: number;
  items: (IItemV2Props & Pick<IItemV2, 'itemCat' | 'links'>)[];
} | null;

export type TIdsOfLessonsBeingCopied = Set<string>;

export type TLessonProviderVal = {
  _lessonToCopy: TUseStateReturnVal<TSelectedLessonToCopy | null>;
  _lessonsCopyJobs: TUseStateReturnVal<string[]>;
  _failedLessonCopyBugReport: TUseStateReturnVal<IFailedLessonCopyBugReport | null>;
  _selectedLessonItems: TUseStateReturnVal<TSelectedLessonItems>;
  _idsOfLessonsBeingCopied: TUseStateReturnVal<TIdsOfLessonsBeingCopied>;
  _isJobToursStickyTopCardDisplayed: TUseStateReturnVal<boolean>;
};

export const LessonContext = createContext<TLessonProviderVal | null>(null);

export const LessonProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const [isJobToursStickyTopCardDisplayed, setIsJobToursStickyTopCardDisplayed] =
    useState(false);
  const [idsOfLessonsBeingCopied, setIdsOfLessonsBeingCopied] =
    useState<TIdsOfLessonsBeingCopied>(new Set());
  const [lessonToCopy, setLessonToCopy] =
    useState<TSelectedLessonToCopy | null>(null);
  const [selectedLessonItems, setSelectedLessonItems] =
    useState<TSelectedLessonItems>(null);
  const [lessonsCopyJobs, setLessonsCopyJobs] = useState<string[]>([]);
  const [failedLessonCopyBugReport, setFailedLessonCopyBugReport] =
    useState<IFailedLessonCopyBugReport | null>(null);
  const value: TLessonProviderVal = {
    _idsOfLessonsBeingCopied: [
      idsOfLessonsBeingCopied,
      setIdsOfLessonsBeingCopied,
    ],
    _isJobToursStickyTopCardDisplayed: [isJobToursStickyTopCardDisplayed, setIsJobToursStickyTopCardDisplayed],
    _selectedLessonItems: [selectedLessonItems, setSelectedLessonItems],
    _lessonToCopy: [lessonToCopy, setLessonToCopy],
    _lessonsCopyJobs: [lessonsCopyJobs, setLessonsCopyJobs],
    _failedLessonCopyBugReport: [
      failedLessonCopyBugReport,
      setFailedLessonCopyBugReport,
    ],
  };

  return (
    <LessonContext.Provider value={value}>{children}</LessonContext.Provider>
  );
};

export const useLessonContext = () => {
  const context = useContext(LessonContext);

  if (!context) {
    throw new Error('Unable to use ModalContext.');
  }

  return context;
};
