import React, { createContext, useContext, useMemo } from "react";

type JobTourEditorContextValue = {
  isEditing: boolean;
  selectedJobs: Set<string>;
  toggleJob: (socCode: string) => void;
  isSelected: (socCode: string) => boolean;
  lastToggled?: string | null;
};

const JobTourEditorContext = createContext<JobTourEditorContextValue | null>(
  null
);

export const JobTourEditorProvider: React.FC<
  React.PropsWithChildren<JobTourEditorContextValue>
> = ({ children, ...value }) => {
  const memoValue = useMemo(() => value, [value]);
  return (
    <JobTourEditorContext.Provider value={memoValue}>
      {children}
    </JobTourEditorContext.Provider>
  );
};

export const useJobTourEditor = () => {
  const context = useContext(JobTourEditorContext);
  if (!context) {
    throw new Error("JobTourEditorContext is not available.");
  }
  return context;
};

export const useJobTourEditorOptional = () =>
  useContext(JobTourEditorContext);
