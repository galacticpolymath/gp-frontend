import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { getJobTours } from "../JobTours/jobTourApi";
import { getSortOptionById, JOBVIZ_DEFAULT_SORT_OPTION } from "../jobvizSorting";
import {
  collectAssignmentAncestorIds,
  getChainFromIds,
  getHierarchySlice,
  getNodeBySocCode,
  getSelectedSocCodeForLevel,
  normalizeSocCode,
  parseJobvizPath,
} from "../jobvizUtils";
import {
  decodeJobvizSharePayload,
  JOBVIZ_REPORT_PARAM_NAME,
} from "../jobvizShareUtils";
import { isTruthyQueryFlag, JOBVIZ_PREVIEW_LIMIT } from "../JobTours/tourAccess";

const SAVED_JOBS_QUERY_PARAM = "saved";

export const useJobVizAssignmentState = ({
  assignmentQueryParamName,
  getSummaryModalSetter,
  hasGpPlusMembership,
  initialJobPairs,
  isTeacherEditMode,
  router,
  selectedTourJobs,
  setSavedJobIds,
  setSelectedTourJobs,
  setTourLoadState,
  status,
  token,
  unitName,
  userAuthorizationHeader,
}) => {
  const parsed = useMemo(
    () => parseJobvizPath(router.query?.["search-results"]),
    [router.query]
  );
  const tourIdParam =
    typeof router.query?.tourId === "string" ? router.query.tourId : null;
  const [activeTour, setActiveTour] = useState(null);
  const [showSavedJobsOnly, setShowSavedJobsOnly] = useState(false);
  const [showSavedJobsUpsell, setShowSavedJobsUpsell] = useState(false);
  const [showAssignmentOnly, setShowAssignmentOnly] = useState(false);
  const [sortOptionId, setSortOptionId] = useState(
    getSortOptionById(
      typeof router.query?.sort === "string" ? router.query.sort : undefined
    ).id
  );
  const lastReportParamRef = useRef(null);

  useEffect(() => {
    if (!tourIdParam) {
      setActiveTour(null);
      setTourLoadState({ isLoading: false, error: null });
      return;
    }
    let isMounted = true;
    setTourLoadState({ isLoading: true, error: null });
    getJobTours({ filterObj: { _id: tourIdParam }, limit: 1 })
      .then((tours) => {
        if (!isMounted) return;
        setActiveTour(tours?.[0] ?? null);
        setTourLoadState({ isLoading: false, error: null });
      })
      .catch((error) => {
        if (!isMounted) return;
        setTourLoadState({
          isLoading: false,
          error:
            error?.response?.data?.msg ||
            error?.message ||
            "Unable to load this tour.",
        });
      });
    return () => {
      isMounted = false;
    };
  }, [tourIdParam, setTourLoadState]);

  const effectiveUnitName =
    unitName ?? (router.query?.[assignmentQueryParamName.unitName]?.toString() || null);
  const socCodesParam = router.query?.[assignmentQueryParamName.socCodes];
  const hasSocCodesParam = Array.isArray(socCodesParam)
    ? socCodesParam.some(Boolean)
    : Boolean(socCodesParam);
  const shouldRenderAssignment =
    Boolean(effectiveUnitName) ||
    Boolean(initialJobPairs?.length) ||
    Boolean(activeTour?.selectedJobs?.length) ||
    hasSocCodesParam;

  const rawEditParam = router.query?.edit;
  const wantsTeacherEditMode =
    typeof rawEditParam === "string" &&
    ["1", "true", "edit"].includes(rawEditParam.toLowerCase());
  const canUseTeacherEditMode = wantsTeacherEditMode && !!hasGpPlusMembership;
  const isStudentAssignmentView =
    shouldRenderAssignment && !canUseTeacherEditMode;
  const viewMode = canUseTeacherEditMode
    ? "teacher-edit"
    : isStudentAssignmentView
      ? "student"
      : "default";
  const teacherEditDenied = wantsTeacherEditMode && !hasGpPlusMembership;
  const isStudentMode = viewMode === "student";
  const shouldForcePreviewMode =
    Boolean(tourIdParam) && !hasGpPlusMembership && !wantsTeacherEditMode;
  const isPreviewQuery = isTruthyQueryFlag(router.query?.preview);
  const isTourPreviewMode =
    (isPreviewQuery || shouldForcePreviewMode) && !isTeacherEditMode;
  const isStudentLinkView = isTruthyQueryFlag(router.query?.student);
  const showUnitPreviewAssignmentBanner = isTruthyQueryFlag(
    router.query?.previewAssignmentBanner
  );

  useEffect(() => {
    if (!router.isReady) return;
    if (!shouldForcePreviewMode || isPreviewQuery) return;
    const params = new URLSearchParams();
    Object.entries(router.query ?? {}).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((entry) => params.append(key, String(entry)));
        return;
      }
      if (value !== undefined && value !== null) {
        params.set(key, String(value));
      }
    });
    params.set("preview", "1");
    params.set("student", "1");
    router.replace(`${router.pathname}?${params.toString()}`, undefined, {
      shallow: true,
      scroll: false,
    });
  }, [isPreviewQuery, router, shouldForcePreviewMode]);

  const sourceAssignmentSocCodes = useMemo(() => {
    if (activeTour?.selectedJobs?.length) {
      return new Set(
        activeTour.selectedJobs
          .map((socCode) => normalizeSocCode(socCode))
          .filter(Boolean)
      );
    }
    const param = router.query?.[assignmentQueryParamName.socCodes];
    const value = Array.isArray(param) ? param.join(",") : param;
    if (!value) return null;
    return new Set(
      value
        .split(",")
        .map((socCode) => normalizeSocCode(socCode))
        .filter(Boolean)
    );
  }, [activeTour, assignmentQueryParamName.socCodes, router.query]);

  const allAssignmentSocCodes = useMemo(() => {
    if (isTeacherEditMode) return selectedTourJobs;
    return sourceAssignmentSocCodes;
  }, [isTeacherEditMode, selectedTourJobs, sourceAssignmentSocCodes]);

  const assignmentSocCodes = useMemo(() => {
    if (!allAssignmentSocCodes?.size) return allAssignmentSocCodes;
    if (isTourPreviewMode) {
      return new Set(
        Array.from(allAssignmentSocCodes).slice(0, JOBVIZ_PREVIEW_LIMIT)
      );
    }
    return allAssignmentSocCodes;
  }, [allAssignmentSocCodes, isTourPreviewMode]);

  const previewLockedCount = useMemo(() => {
    if (!isTourPreviewMode || !allAssignmentSocCodes?.size) return 0;
    return Math.max(allAssignmentSocCodes.size - JOBVIZ_PREVIEW_LIMIT, 0);
  }, [allAssignmentSocCodes, isTourPreviewMode]);

  const assignmentParams = useMemo(
    () => ({
      socCodes: assignmentSocCodes ?? undefined,
      unitName: effectiveUnitName,
    }),
    [assignmentSocCodes, effectiveUnitName]
  );

  useEffect(() => {
    if (!isTeacherEditMode) return;
    const nextSelectedSet = sourceAssignmentSocCodes
      ? new Set(sourceAssignmentSocCodes)
      : new Set();
    setSelectedTourJobs((prev) => {
      if (prev.size === nextSelectedSet.size) {
        const matches = Array.from(prev).every((value) => nextSelectedSet.has(value));
        if (matches) return prev;
      }
      return nextSelectedSet;
    });
  }, [isTeacherEditMode, setSelectedTourJobs, sourceAssignmentSocCodes]);

  const chainNodes = useMemo(
    () => getChainFromIds(parsed.idPath),
    [parsed.idPath]
  );
  const selectedLevelFromChain = useMemo(() => {
    const parent = chainNodes.find(
      (node) => node.hierarchy === parsed.targetLevel - 1
    );
    if (!parent) return null;
    return getSelectedSocCodeForLevel(parent, parsed.targetLevel);
  }, [chainNodes, parsed.targetLevel]);
  const selectedLevel = parsed.selectedLevel ?? selectedLevelFromChain ?? null;
  const hierarchySlice = useMemo(
    () => getHierarchySlice(parsed.targetLevel, selectedLevel),
    [parsed.targetLevel, selectedLevel]
  );
  const assignmentAncestors = useMemo(
    () => collectAssignmentAncestorIds(assignmentSocCodes ?? undefined),
    [assignmentSocCodes]
  );
  const resolvedSocCodesForBanner = isTeacherEditMode
    ? selectedTourJobs
    : assignmentSocCodes;
  const resolvedJobTitleAndSocCodePairs = useMemo(() => {
    const source = resolvedSocCodesForBanner
      ? Array.from(resolvedSocCodesForBanner)
      : [];
    if (!source.length) return initialJobPairs ?? null;
    const pairs = source
      .map((soc) => {
        const job = getNodeBySocCode(soc);
        return job ? [job.title, soc] : null;
      })
      .filter(Boolean);
    return pairs.length ? pairs : initialJobPairs ?? null;
  }, [initialJobPairs, resolvedSocCodesForBanner]);
  const hasAssignmentList = Boolean(resolvedSocCodesForBanner?.size);

  useEffect(() => {
    setShowAssignmentOnly((isStudentMode || isTourPreviewMode) && hasAssignmentList);
  }, [hasAssignmentList, isStudentMode, isTourPreviewMode]);

  const normalizedSortFromQuery = useMemo(
    () =>
      getSortOptionById(
        typeof router.query?.sort === "string" ? router.query.sort : undefined
      ).id,
    [router.query?.sort]
  );
  useEffect(() => {
    setSortOptionId(normalizedSortFromQuery);
  }, [normalizedSortFromQuery]);

  const persistSortInQuery = useCallback(
    (nextId) => {
      const [path, search = ""] = router.asPath.split("?");
      const params = new URLSearchParams(search);
      if (nextId && nextId !== JOBVIZ_DEFAULT_SORT_OPTION.id) {
        params.set("sort", nextId);
      } else {
        params.delete("sort");
      }
      const queryString = params.toString();
      router.replace(queryString ? `${path}?${queryString}` : path, undefined, {
        shallow: true,
        scroll: false,
      });
    },
    [router]
  );
  const handleSortControlChange = useCallback(
    (nextId) => {
      setSortOptionId(nextId);
      persistSortInQuery(nextId);
    },
    [persistSortInQuery]
  );

  const handleAssignedToggleClick = useCallback(() => {
    const isTurningOff = showAssignmentOnly && hasAssignmentList;
    if (!isTurningOff) {
      setShowAssignmentOnly(true);
      return;
    }
    setShowAssignmentOnly(false);
    if (parsed.targetLevel === 1 && parsed.idPath.length === 0) return;
    const [, search = ""] = router.asPath.split("?");
    router.push(search ? `/jobviz?${search}` : "/jobviz", undefined, {
      shallow: true,
      scroll: false,
    });
  }, [hasAssignmentList, parsed.idPath.length, parsed.targetLevel, router, showAssignmentOnly]);

  const persistSavedFilterInQuery = useCallback(
    (nextEnabled) => {
      const [path, search = ""] = router.asPath.split("?");
      const params = new URLSearchParams(search);
      if (nextEnabled) {
        params.set(SAVED_JOBS_QUERY_PARAM, "1");
      } else {
        params.delete(SAVED_JOBS_QUERY_PARAM);
      }
      const queryString = params.toString();
      router.replace(queryString ? `${path}?${queryString}` : path, undefined, {
        shallow: true,
        scroll: false,
      });
    },
    [router]
  );
  const handleSavedToggleClick = useCallback(() => {
    if (status !== "authenticated") {
      setShowSavedJobsUpsell(true);
      return;
    }
    setShowSavedJobsOnly((prev) => {
      const next = !prev;
      persistSavedFilterInQuery(next);
      return next;
    });
  }, [persistSavedFilterInQuery, status]);
  const closeSavedJobsUpsell = useCallback(() => {
    setShowSavedJobsUpsell(false);
  }, []);

  const sortQueryParam =
    sortOptionId === JOBVIZ_DEFAULT_SORT_OPTION.id ? undefined : sortOptionId;
  const preservedJobvizQueryParams = useMemo(
    () => ({
      ...(sortQueryParam ? { sort: sortQueryParam } : {}),
      ...(typeof router.query?.edit === "string" ? { edit: router.query.edit } : {}),
      ...(typeof router.query?.tourId === "string" ? { tourId: router.query.tourId } : {}),
    }),
    [router.query?.edit, router.query?.tourId, sortQueryParam]
  );

  const focusAssignedActive = Boolean(showAssignmentOnly && hasAssignmentList);
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.body.dataset.jobvizFocus = focusAssignedActive ? "true" : "false";
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("jobviz-focus-toggle", {
          detail: { value: focusAssignedActive },
        })
      );
    }
  }, [focusAssignedActive]);
  useEffect(
    () => () => {
      if (typeof document !== "undefined") {
        delete document.body.dataset.jobvizFocus;
      }
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("jobviz-focus-toggle", { detail: { value: false } })
        );
      }
    },
    []
  );

  useEffect(() => {
    if (!router.isReady) return;
    const rawSavedParam = router.query?.[SAVED_JOBS_QUERY_PARAM];
    const normalizedSavedParam = Array.isArray(rawSavedParam)
      ? rawSavedParam[0]
      : rawSavedParam;
    setShowSavedJobsOnly(
      ["1", "true"].includes(String(normalizedSavedParam ?? "").toLowerCase())
    );
  }, [router.isReady, router.query]);

  useEffect(() => {
    if (status !== "authenticated" || !token) {
      setSavedJobIds(new Set());
      return;
    }
    let isCancelled = false;
    axios
      .get("/api/get-user-account-data?willNotRetrieveMailingListStatus=true", {
        headers: { Authorization: userAuthorizationHeader },
      })
      .then(({ data }) => {
        if (isCancelled) return;
        const ids = Array.isArray(data?.savedJobIds)
          ? data.savedJobIds
              .filter((value) => typeof value === "string")
              .map((value) => value.trim())
              .filter(Boolean)
          : [];
        setSavedJobIds(new Set(ids));
      })
      .catch(() => {
        if (!isCancelled) setSavedJobIds(new Set());
      });
    return () => {
      isCancelled = true;
    };
  }, [setSavedJobIds, status, token, userAuthorizationHeader]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const handleSavedJobsUpdate = (event) => {
      const payload = event?.detail ?? {};
      const action = payload?.action;
      const jobId = typeof payload?.jobId === "string" ? payload.jobId.trim() : "";
      if (!jobId) return;
      setSavedJobIds((prev) => {
        const next = new Set(prev);
        if (action === "remove") next.delete(jobId);
        else next.add(jobId);
        return next;
      });
    };
    window.addEventListener("jobviz-saved-jobs-updated", handleSavedJobsUpdate);
    return () => {
      window.removeEventListener("jobviz-saved-jobs-updated", handleSavedJobsUpdate);
    };
  }, [setSavedJobIds]);

  useEffect(() => {
    if (!router.isReady) return;
    const param = router.query?.[JOBVIZ_REPORT_PARAM_NAME];
    const encoded = Array.isArray(param) ? param[0] : param;
    if (!encoded || encoded === lastReportParamRef.current) return;
    const payload = decodeJobvizSharePayload(encoded);
    if (!payload) return;
    lastReportParamRef.current = encoded;
    getSummaryModalSetter()({
      isDisplayed: true,
      unitName: payload.unitName ?? effectiveUnitName ?? null,
      jobs:
        payload.jobs?.map((job) => ({
          title: job.title,
          soc: job.soc,
        })) ?? [],
      payload,
      allowEditing: false,
    });
  }, [effectiveUnitName, getSummaryModalSetter, router.isReady, router.query]);

  return {
    activeTour,
    assignmentAncestors,
    assignmentParams,
    assignmentSocCodes,
    canUseTeacherEditMode,
    chainNodes,
    closeSavedJobsUpsell,
    effectiveUnitName,
    focusAssignedActive,
    handleAssignedToggleClick,
    handleSavedToggleClick,
    handleSortControlChange,
    hasAssignmentList,
    hierarchySlice,
    isPreviewQuery,
    isStudentLinkView,
    isStudentMode,
    isTourPreviewMode,
    parsed,
    preservedJobvizQueryParams,
    previewLockedCount,
    resolvedJobTitleAndSocCodePairs,
    resolvedSocCodesForBanner,
    selectedLevel,
    shouldForcePreviewMode,
    shouldRenderAssignment,
    showAssignmentOnly,
    showSavedJobsOnly,
    showSavedJobsUpsell,
    showUnitPreviewAssignmentBanner,
    sortOptionId,
    sourceAssignmentSocCodes,
    teacherEditDenied,
    toggleShowAssignmentOnly: setShowAssignmentOnly,
    tourIdParam,
    viewMode,
  };
};
