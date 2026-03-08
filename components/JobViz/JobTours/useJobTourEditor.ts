import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { toast } from "react-hot-toast";
import {
  CLASS_SUBJECT_OPTIONS,
  DEFAULT_JOB_TOUR_ASSIGNMENT,
  DEFAULT_JOB_TOUR_VERSION_PREFIX,
} from "./jobTourConstants";
import { createJobTour, updateJobTour } from "./jobTourApi";
import type { JobTourRecord } from "./jobTourTypes";
import type { JobTourEditorFormState } from "./JobTourEditorFields";

type UnitOption = { id: string; title: string };

type JobTourSnapshot = {
  heading: string;
  whoCanSee: JobTourEditorFormState["whoCanSee"];
  classSubject: string;
  gradeLevel: string;
  tags: string[];
  gpUnitsAssociated: string[];
  explanation: string;
  assignment: string;
  selectedJobs: string[];
};

interface UseJobTourEditorArgs {
  isTeacherEditMode: boolean;
  activeTour: JobTourRecord | null;
  preservedUnitName?: string | null;
  sourceAssignmentSocCodes: Set<string> | null;
  selectedTourJobs: Set<string>;
  setSelectedTourJobs: Dispatch<SetStateAction<Set<string>>>;
  token?: string | null;
  isTourOwner: boolean;
  buildEditUrl: (args?: { tourIdOverride?: string }) => string;
  replaceRoute: (url: string) => void;
}

const areSetsEqual = (left: Set<string>, right: Set<string>) => {
  if (left === right) return true;
  if (left.size !== right.size) return false;
  for (const value of Array.from(left)) {
    if (!right.has(value)) return false;
  }
  return true;
};

const createVersionString = () => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${DEFAULT_JOB_TOUR_VERSION_PREFIX}.${now.getFullYear()}${month}${day}`;
};

const getDefaultFormState = (): JobTourEditorFormState => ({
  heading: "",
  whoCanSee: "me",
  classSubject: "",
  classSubjectCustom: "",
  gradeLevel: "",
  tags: "",
  gpUnitsAssociated: [],
  explanation: "",
  assignment: DEFAULT_JOB_TOUR_ASSIGNMENT,
});

export const useJobTourEditor = ({
  isTeacherEditMode,
  activeTour,
  preservedUnitName,
  sourceAssignmentSocCodes,
  selectedTourJobs,
  setSelectedTourJobs,
  token,
  isTourOwner,
  buildEditUrl,
  replaceRoute,
}: UseJobTourEditorArgs) => {
  const [unitOptions, setUnitOptions] = useState<UnitOption[]>([]);
  const [isSavingTour, setIsSavingTour] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [tourForm, setTourForm] =
    useState<JobTourEditorFormState>(getDefaultFormState);
  const [lastSavedSnapshot, setLastSavedSnapshot] =
    useState<JobTourSnapshot | null>(null);

  useEffect(() => {
    if (!isTeacherEditMode) return;
    const nextSelectedSet = sourceAssignmentSocCodes
      ? new Set(sourceAssignmentSocCodes)
      : new Set<string>();
    setSelectedTourJobs((prev) =>
      areSetsEqual(prev, nextSelectedSet) ? prev : nextSelectedSet
    );
  }, [isTeacherEditMode, setSelectedTourJobs, sourceAssignmentSocCodes]);

  useEffect(() => {
    if (!isTeacherEditMode) return;
    if (!activeTour) {
      setTourForm((prev) => ({
        ...prev,
        heading:
          prev.heading || preservedUnitName
            ? prev.heading || `${preservedUnitName} JobViz Tour`
            : prev.heading,
        assignment: prev.assignment || DEFAULT_JOB_TOUR_ASSIGNMENT,
      }));
      return;
    }

    const isDefaultSubject = (CLASS_SUBJECT_OPTIONS as readonly string[]).includes(
      activeTour.classSubject
    );
    setTourForm({
      heading: activeTour.heading ?? "",
      whoCanSee: activeTour.whoCanSee ?? "me",
      classSubject: isDefaultSubject ? activeTour.classSubject : "Other",
      classSubjectCustom: isDefaultSubject ? "" : activeTour.classSubject ?? "",
      gradeLevel: activeTour.gradeLevel ?? "",
      tags: (activeTour.tags ?? []).join(", "),
      gpUnitsAssociated: activeTour.gpUnitsAssociated ?? [],
      explanation: activeTour.explanation ?? "",
      assignment: activeTour.assignment ?? DEFAULT_JOB_TOUR_ASSIGNMENT,
    });
    setLastSavedSnapshot({
      heading: activeTour.heading ?? "",
      whoCanSee: activeTour.whoCanSee ?? "me",
      classSubject: (CLASS_SUBJECT_OPTIONS as readonly string[]).includes(
        activeTour.classSubject
      )
        ? activeTour.classSubject
        : activeTour.classSubject ?? "",
      gradeLevel: activeTour.gradeLevel ?? "",
      tags: (activeTour.tags ?? []).map((tag) => tag.trim()).filter(Boolean),
      gpUnitsAssociated: [...(activeTour.gpUnitsAssociated ?? [])].sort(),
      explanation: activeTour.explanation ?? "",
      assignment: activeTour.assignment ?? DEFAULT_JOB_TOUR_ASSIGNMENT,
      selectedJobs: [...(activeTour.selectedJobs ?? [])].sort(),
    });
  }, [activeTour, isTeacherEditMode, preservedUnitName]);

  useEffect(() => {
    if (!isTeacherEditMode) return;
    const controller = new AbortController();
    const params = new URLSearchParams();
    params.set(
      "projectionsObj",
      JSON.stringify({ Title: 1, numID: 1, locale: 1 })
    );

    fetch(`/api/get-units?${params.toString()}`, { signal: controller.signal })
      .then((response) => response.json())
      .then((payload) => {
        const units = Array.isArray(payload?.units) ? payload.units : [];
        const options = units
          .map((unit: any) => ({
            id: `${unit.numID ?? unit._id ?? unit.Title}`,
            title: unit.Title ?? "Untitled unit",
          }))
          .filter((unit: UnitOption) => unit.id && unit.title)
          .sort((a: UnitOption, b: UnitOption) => a.title.localeCompare(b.title));
        setUnitOptions(options);
      })
      .catch((error) => {
        if (error?.name === "AbortError") return;
        setUnitOptions([]);
      });

    return () => {
      controller.abort();
    };
  }, [isTeacherEditMode]);

  const resolvedClassSubject = useMemo(
    () =>
      tourForm.classSubject === "Other"
        ? tourForm.classSubjectCustom.trim()
        : tourForm.classSubject.trim(),
    [tourForm.classSubject, tourForm.classSubjectCustom]
  );

  const selectedTourJobsArray = useMemo(
    () => Array.from(selectedTourJobs),
    [selectedTourJobs]
  );

  const validationErrors = useMemo(() => {
    if (!isTeacherEditMode) return [];
    const errors: string[] = [];
    const isPublic = tourForm.whoCanSee === "everyone";

    if (!tourForm.heading.trim()) {
      errors.push("Title required");
    }
    if (selectedTourJobsArray.length === 0) {
      errors.push("Add at least one job");
    }
    if (isPublic) {
      if (!resolvedClassSubject) errors.push("Class subject required");
      if (!tourForm.gradeLevel.trim()) errors.push("Grade level required");
      if (!tourForm.assignment.trim()) errors.push("Assignment required");
      if (!tourForm.explanation.trim()) errors.push("Context required");
    }

    return errors;
  }, [
    isTeacherEditMode,
    resolvedClassSubject,
    selectedTourJobsArray.length,
    tourForm.assignment,
    tourForm.explanation,
    tourForm.gradeLevel,
    tourForm.heading,
    tourForm.whoCanSee,
  ]);

  const saveErrors = useMemo(
    () => (saveError ? [...validationErrors, saveError] : validationErrors),
    [saveError, validationErrors]
  );

  const buildSnapshot = useCallback((): JobTourSnapshot => {
    const normalizedSubject =
      tourForm.classSubject === "Other"
        ? tourForm.classSubjectCustom.trim()
        : tourForm.classSubject.trim();

    return {
      heading: tourForm.heading.trim(),
      whoCanSee: tourForm.whoCanSee,
      classSubject: normalizedSubject || "Other",
      gradeLevel: tourForm.gradeLevel.trim() || "Middle school",
      tags: tourForm.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      gpUnitsAssociated: [...tourForm.gpUnitsAssociated].sort(),
      explanation: tourForm.explanation.trim(),
      assignment: tourForm.assignment.trim() || DEFAULT_JOB_TOUR_ASSIGNMENT,
      selectedJobs: Array.from(selectedTourJobs).sort(),
    };
  }, [selectedTourJobs, tourForm]);

  const hasUnsavedChanges = useMemo(() => {
    if (!isTeacherEditMode) return false;
    const snapshot = buildSnapshot();
    if (!lastSavedSnapshot) return true;
    return (
      snapshot.heading !== lastSavedSnapshot.heading ||
      snapshot.whoCanSee !== lastSavedSnapshot.whoCanSee ||
      snapshot.classSubject !== lastSavedSnapshot.classSubject ||
      snapshot.gradeLevel !== lastSavedSnapshot.gradeLevel ||
      snapshot.explanation !== lastSavedSnapshot.explanation ||
      snapshot.assignment !== lastSavedSnapshot.assignment ||
      snapshot.tags.join("|") !== lastSavedSnapshot.tags.join("|") ||
      snapshot.gpUnitsAssociated.join("|") !==
        lastSavedSnapshot.gpUnitsAssociated.join("|") ||
      snapshot.selectedJobs.join("|") !== lastSavedSnapshot.selectedJobs.join("|")
    );
  }, [buildSnapshot, isTeacherEditMode, lastSavedSnapshot]);

  const handleSaveTour = useCallback(async () => {
    if (!isTeacherEditMode) return;
    setSaveError(null);

    if (validationErrors.length) {
      setSaveError("Please complete the required fields.");
      return;
    }
    if (!token) {
      setSaveError("Please sign in to save.");
      return;
    }

    const snapshot = buildSnapshot();
    const payload = {
      ...snapshot,
      version: createVersionString(),
      publishedDate:
        snapshot.whoCanSee === "everyone" ? new Date().toISOString() : null,
    };

    try {
      setIsSavingTour(true);
      if (activeTour?._id && isTourOwner) {
        await updateJobTour(activeTour._id, payload);
        toast.success("Tour updated!");
      } else {
        const result = await createJobTour(payload, token);
        toast.success("Tour saved!");
        if (result?.jobTourId) {
          replaceRoute(buildEditUrl({ tourIdOverride: result.jobTourId }));
        }
      }
      setLastSavedSnapshot(snapshot);
    } catch (error: any) {
      const message =
        error?.response?.data?.msg || error?.message || "Unable to save tour.";
      if (tourForm.whoCanSee === "everyone" && /explanation/i.test(message)) {
        setSaveError(
          'Classroom Context is required when visibility is "Everyone".'
        );
      } else {
        setSaveError(message);
      }
    } finally {
      setIsSavingTour(false);
    }
  }, [
    activeTour?._id,
    buildEditUrl,
    buildSnapshot,
    isTeacherEditMode,
    isTourOwner,
    replaceRoute,
    token,
    tourForm.whoCanSee,
    validationErrors.length,
  ]);

  return {
    handleSaveTour,
    hasUnsavedChanges,
    isSavingTour,
    resolvedClassSubject,
    saveErrors,
    selectedTourJobsArray,
    setTourForm,
    tourForm,
    unitOptions,
  };
};
