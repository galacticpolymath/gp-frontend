import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/router";
import Layout from "../../components/Layout";
import { AssignmentBanner } from "../../components/JobViz/AssignmentBanner";
import {
  JobVizBreadcrumb,
  JOBVIZ_BREADCRUMB_ID,
} from "../../components/JobViz/JobVizBreadcrumb";
import { JobVizGrid } from "../../components/JobViz/JobVizGrid";
import { JobVizLayout } from "../../components/JobViz/JobVizLayout";
import { LucideIcon } from "../../components/JobViz/LucideIcon";
import { JobVizSortControl } from "../../components/JobViz/JobVizSortControl";
import HeroForFreeUsers from "../../components/JobViz/Heros/HeroForFreeUsers";
import { JOBVIZ_BRACKET_SEARCH_ID } from "../../components/JobViz/jobvizConstants";
import styles from "../../styles/jobvizBurst.module.scss";
import {
  buildIdPathForNode,
  buildJobvizUrl,
  collectAssignmentAncestorIds,
  filterJobsBySocCodes,
  getChainFromIds,
  getDisplayTitle,
  getHierarchySlice,
  getIconNameForNode,
  getJobSpecificIconName,
  getLineItemCountForNode,
  getSelectedSocCodeForLevel,
  getTargetLevelForNode,
  jobVizData,
  jobVizNodeById,
  parseJobvizPath,
} from "../../components/JobViz/jobvizUtils";
import { JobVizSearch } from "../../components/JobViz/JobVizSearch";
import {
  JOBVIZ_DEFAULT_SORT_OPTION,
  JOBVIZ_SORT_OPTIONS,
  getSortOptionById,
  sortJobVizItems,
} from "../../components/JobViz/jobvizSorting";
import {
  decodeJobvizSharePayload,
  JOBVIZ_REPORT_PARAM_NAME,
} from "../../components/JobViz/jobvizShareUtils";
import {
  SOC_CODES_PARAM_NAME,
  UNIT_NAME_PARAM_NAME,
} from "../../components/LessonSection/JobVizConnections";
import { getUnitRelatedJobs } from "../../helperFns/filterUnitRelatedJobs";
import { verifyJwt } from "../../backend/utils/security";
import { ModalContext } from "../../providers/ModalProvider";
import { useHeroStatAction } from "../../components/JobViz/useHeroStatAction";
import {
  JOBVIZ_CATEGORIES_ANCHOR_ID,
  JOBVIZ_HIERARCHY_HEADING_ID,
} from "../../components/JobViz/jobvizDomIds";

const JOBVIZ_DESCRIPTION =
  "Explore the full BLS hierarchy with the JobViz glass UI—glass cards, glowing breadcrumbs, and animated explore links keyed to real SOC data.";
const JOBVIZ_DATA_SOURCE =
  "https://www.bls.gov/emp/tables/occupational-projections-and-characteristics.htm";
const VIEWING_HEADER_TRANSITION_MS = 480;
const GRID_NAVIGATION_HEADER_DELAY_MS = VIEWING_HEADER_TRANSITION_MS;

const JobVizSearchResults = ({
  metaDescription,
  unitName,
  jobTitleAndSocCodePairs,
  hasGpPlusMembership,
}) => {
  const router = useRouter();
  const modalContext = useContext(ModalContext);
  if (!modalContext) {
    throw new Error("ModalContext is required for JobViz");
  }
  const [, setSelectedJob] = modalContext._selectedJob;
  const [, setIsJobModalOn] = modalContext._isJobModalOn;
  const [jobvizReturnPath, setJobvizReturnPath] =
    modalContext._jobvizReturnPath;
  const [, setJobvizSummaryModal] = modalContext._jobvizSummaryModal;

  const parsed = useMemo(
    () => parseJobvizPath(router.query?.["search-results"]),
    [router.query]
  );

  const assignmentSocCodes = useMemo(() => {
    const param = router.query?.[SOC_CODES_PARAM_NAME];
    const value = Array.isArray(param) ? param.join(",") : param;

    if (!value) return null;

    return new Set(value.split(",").filter(Boolean));
  }, [router.query]);

  const preservedUnitName =
    unitName ?? (router.query?.[UNIT_NAME_PARAM_NAME]?.toString() || null);

  const assignmentParams = useMemo(
    () => ({
      socCodes: assignmentSocCodes ?? undefined,
      unitName: preservedUnitName,
    }),
    [assignmentSocCodes, preservedUnitName]
  );
  const shouldRenderAssignment =
    Boolean(preservedUnitName) || Boolean(jobTitleAndSocCodePairs?.length);
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
  const isTeacherEditMode = viewMode === "teacher-edit";
  const lastReportParamRef = useRef(null);

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

  const selectedLevel =
    parsed.selectedLevel ?? selectedLevelFromChain ?? null;

  const hierarchySlice = useMemo(
    () => getHierarchySlice(parsed.targetLevel, selectedLevel),
    [parsed.targetLevel, selectedLevel]
  );

  const assignmentAncestors = useMemo(
    () => collectAssignmentAncestorIds(assignmentSocCodes ?? undefined),
    [assignmentSocCodes]
  );
  const hasAssignmentList = Boolean(assignmentSocCodes?.size);
  const [showAssignmentOnly, setShowAssignmentOnly] = useState(
    () => isStudentMode && hasAssignmentList
  );
  useEffect(() => {
    if (isStudentMode && hasAssignmentList) {
      setShowAssignmentOnly(true);
    }
  }, [hasAssignmentList, isStudentMode]);
  const sortQueryFromRouter =
    typeof router.query?.sort === "string" ? router.query.sort : undefined;
  const normalizedSortFromQuery = useMemo(
    () => getSortOptionById(sortQueryFromRouter).id,
    [sortQueryFromRouter]
  );
  const [sortOptionId, setSortOptionId] = useState(normalizedSortFromQuery);
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
      const nextUrl = queryString ? `${path}?${queryString}` : path;
      router.replace(nextUrl, undefined, { shallow: true, scroll: false });
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
  const sortQueryParam =
    sortOptionId === JOBVIZ_DEFAULT_SORT_OPTION.id ? undefined : sortOptionId;
  const sortQueryParams = useMemo(
    () => (sortQueryParam ? { sort: sortQueryParam } : undefined),
    [sortQueryParam]
  );
  // filter state managed via button; when assignment data is absent the toggle is ignored.
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

  useEffect(() => {
    return () => {
      if (typeof document !== "undefined") {
        delete document.body.dataset.jobvizFocus;
      }
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("jobviz-focus-toggle", { detail: { value: false } })
        );
      }
    };
  }, []);

  useEffect(() => {
    if (!router.isReady) return;
    const param = router.query?.[JOBVIZ_REPORT_PARAM_NAME];
    const encoded = Array.isArray(param) ? param[0] : param;
    if (!encoded || encoded === lastReportParamRef.current) return;
    const payload = decodeJobvizSharePayload(encoded);
    if (!payload) return;
    lastReportParamRef.current = encoded;
    setJobvizSummaryModal({
      isDisplayed: true,
      unitName: payload.unitName ?? preservedUnitName ?? null,
      jobs:
        payload.jobs?.map((job) => ({
          title: job.title,
          soc: job.soc,
        })) ?? [],
      payload,
      allowEditing: false,
    });
  }, [preservedUnitName, router.isReady, router.query, setJobvizSummaryModal]);

  const buildReturnUrlForNode = useCallback(
    (node) => {
      const targetLevel = getTargetLevelForNode(node);
      const selectedLevel = getSelectedSocCodeForLevel(node, targetLevel);
      const fullIdPath = buildIdPathForNode(node);
      const parentPath = fullIdPath.slice(0, -1);

      if (!parentPath.length) {
        return buildJobvizUrl(
          { targetLevel: 1, selectedLevel: null, idPath: [] },
          assignmentParams,
          sortQueryParams
        );
      }

      return buildJobvizUrl(
        { targetLevel, selectedLevel, idPath: parentPath },
        assignmentParams,
        sortQueryParams
      );
    },
    [assignmentParams, sortQueryParams]
  );

  const handleAssignmentJobClick = (socCode) => {
    const node = jobVizData.find((n) => n.soc_code === socCode);
    if (!node) return;

    setSelectedJob({ ...node, wasSelectedFromJobToursCard: false });
    setIsJobModalOn(true);
    setPersistedGridItems(filteredGridItems);
    setJobvizReturnPath(buildReturnUrlForNode(node));

    const url = buildJobvizUrl(
      { fromNode: node },
      assignmentParams,
      sortQueryParams
    );
    router.push(url, undefined, { scroll: false, shallow: true });
  };

  const filteredSlice = useMemo(() => {
    return hierarchySlice;
  }, [hierarchySlice]);
  const activeNode = chainNodes[chainNodes.length - 1] ?? null;
  const showDetail =
    Boolean(activeNode && activeNode.occupation_type === "Line item");
  const resolvedMetaDescription = activeNode
    ? activeNode.def
      ? `${getDisplayTitle(activeNode)}: ${activeNode.def}`
      : getDisplayTitle(activeNode)
    : metaDescription ?? JOBVIZ_DESCRIPTION;
  const layoutTitleBase =
    "JobViz Career Explorer | Connect Learning to 1,000+ Real-World Careers";
  const resolvedPageTitle = activeNode
    ? `${getDisplayTitle(activeNode)} | JobViz Career Explorer`
    : layoutTitleBase;

  const scrollToBreadcrumb = () => {
    if (typeof window === "undefined") return;
    window.requestAnimationFrame(() => {
      const el = document.getElementById(JOBVIZ_BREADCRUMB_ID);
      if (!el) return;
      const offset = 32;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    });
  };

  const gridItems = useMemo(() => {
    return filteredSlice.map((node) => ({
      id: String(node.id),
      title: getDisplayTitle(node),
      iconName: getIconNameForNode(node),
      level: node.occupation_type === "Line item" ? 2 : 1,
      jobsCount:
        node.occupation_type === "Line item"
          ? undefined
          : getLineItemCountForNode(node),
      growthPercent: node.employment_change_percent ?? null,
      wage: node.median_annual_wage ?? null,
      education:
        node.occupation_type === "Line item"
          ? node.typical_education_needed_for_entry ?? null
          : null,
      jobIconName:
        node.occupation_type === "Line item"
          ? getJobSpecificIconName(node)
          : undefined,
      socCode: node.soc_code ?? null,
      isAssignmentJob:
        node.occupation_type === "Line item"
          ? assignmentSocCodes?.has(node.soc_code) ?? false
          : false,
      highlight:
        assignmentAncestors.has(node.id) ||
        (assignmentSocCodes?.has(node.soc_code) ?? false),
      highlightClicked: activeNode?.id === node.id,
      showBookmark:
        assignmentAncestors.has(node.id) ||
        (assignmentSocCodes?.has(node.soc_code) ?? false),
    }));
  }, [
    filteredSlice,
    assignmentAncestors,
    assignmentSocCodes,
    activeNode?.id,
  ]);

  const assignmentJobItems = useMemo(() => {
    if (!assignmentSocCodes?.size) return [];
    return Array.from(assignmentSocCodes)
      .map((code) => jobVizData.find((node) => node.soc_code === code))
      .filter(Boolean)
      .map((node) => ({
        id: String(node.id),
        title: getDisplayTitle(node),
        iconName: getIconNameForNode(node),
        level: 2,
        jobsCount: undefined,
        growthPercent: node.employment_change_percent ?? null,
        wage: node.median_annual_wage ?? null,
        education: node.typical_education_needed_for_entry ?? null,
        jobIconName: getJobSpecificIconName(node),
        socCode: node.soc_code ?? null,
        isAssignmentJob: true,
        highlight: true,
        highlightClicked: false,
        showBookmark: true,
      }));
  }, [assignmentSocCodes]);

  const sortedGridItems = useMemo(
    () => sortJobVizItems(gridItems, sortOptionId),
    [gridItems, sortOptionId]
  );

  const sortedAssignmentItems = useMemo(
    () => sortJobVizItems(assignmentJobItems, sortOptionId),
    [assignmentJobItems, sortOptionId]
  );

  const filteredGridItems = useMemo(() => {
    if (showAssignmentOnly && hasAssignmentList) {
      return sortedAssignmentItems;
    }
    return sortedGridItems;
  }, [
    sortedGridItems,
    sortedAssignmentItems,
    showAssignmentOnly,
    hasAssignmentList,
  ]);
  const [persistedGridItems, setPersistedGridItems] = useState(filteredGridItems);
  useEffect(() => {
    if (!showDetail) {
      setPersistedGridItems(filteredGridItems);
    }
  }, [filteredGridItems, showDetail]);
  const displayGridItems = showDetail ? persistedGridItems : filteredGridItems;
  const [renderedGridItems, setRenderedGridItems] = useState(displayGridItems);
  const gridItemsDelayRef = useRef(null);
  const initialGridRenderRef = useRef(true);
  useEffect(() => {
    if (initialGridRenderRef.current) {
      initialGridRenderRef.current = false;
      setRenderedGridItems(displayGridItems);
      return;
    }
    if (gridItemsDelayRef.current) {
      clearTimeout(gridItemsDelayRef.current);
      gridItemsDelayRef.current = null;
    }
    const applyItems = () => {
      setRenderedGridItems(displayGridItems);
      gridItemsDelayRef.current = null;
    };
    if (typeof window !== "undefined" && GRID_NAVIGATION_HEADER_DELAY_MS > 0) {
      gridItemsDelayRef.current = window.setTimeout(
        applyItems,
        GRID_NAVIGATION_HEADER_DELAY_MS
      );
    } else {
      applyItems();
    }
    return () => {
      if (gridItemsDelayRef.current) {
        clearTimeout(gridItemsDelayRef.current);
        gridItemsDelayRef.current = null;
      }
    };
  }, [displayGridItems]);

  const visibleGroupCount = useMemo(
    () => displayGridItems.filter((item) => item.level === 1).length,
    [displayGridItems]
  );
  const visibleJobCount = useMemo(
    () => displayGridItems.filter((item) => item.level === 2).length,
    [displayGridItems]
  );

  const parentForHeading = useMemo(() => {
    if (selectedLevel) {
      return jobVizData.find((node) => node.soc_code === selectedLevel) ?? null;
    }
    return null;
  }, [selectedLevel]);

  const sectionHeading =
    parentForHeading?.soc_title ||
    parentForHeading?.title ||
    "Browse jobs by category or search";

  const showIntroHeading = chainNodes.length === 0;

  const handleAssignmentGridClick = (item) => {
    if (!item?.socCode) return;
    handleAssignmentJobClick(item.socCode);
  };

  const handleGridClick = (item) => {
    const node = jobVizNodeById.get(Number(item.id));
    if (!node) return;

    const targetLevel = getTargetLevelForNode(node);
    const selectedLevelForNode = getSelectedSocCodeForLevel(
      node,
      targetLevel
    );
    const idPath = buildIdPathForNode(node);
    const nextUrl = buildJobvizUrl(
      { targetLevel, selectedLevel: selectedLevelForNode, idPath },
      assignmentParams,
      sortQueryParams
    );

    if (node.occupation_type === "Line item") {
      setPersistedGridItems(filteredGridItems);
      setJobvizReturnPath(buildReturnUrlForNode(node));
    }
    router.push(nextUrl, undefined, { scroll: false, shallow: true });
  };
  const [navigationHint, setNavigationHint] = useState(null);

  useEffect(() => {
    return () => {
      if (viewingHeaderTimeoutRef.current) {
        clearTimeout(viewingHeaderTimeoutRef.current);
      }
    };
  }, []);
  const pendingNavigationRef = useRef(null);
  const isPromiseLike = (value) =>
    Boolean(value) &&
    typeof value === "object" &&
    typeof value.then === "function" &&
    typeof value.finally === "function";
  const normalizeRect = useCallback((rect) => {
    if (!rect) return null;
    if ("left" in rect) {
      return {
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height,
      };
    }
    return rect;
  }, []);
  const navigationWaveRef = useRef(0);
  const navigationHintDelayRef = useRef(null);
  const triggerNavigationHint = useCallback(
    (direction, rect, pivotId = null) => {
      navigationWaveRef.current += 1;
      setNavigationHint({
        direction,
        anchor: normalizeRect(rect),
        wave: navigationWaveRef.current,
        pivotId,
      });
    },
    [normalizeRect]
  );
  useEffect(() => {
    return () => {
      if (navigationHintDelayRef.current) {
        clearTimeout(navigationHintDelayRef.current);
      }
      if (gridItemsDelayRef.current) {
        clearTimeout(gridItemsDelayRef.current);
      }
      pendingNavigationRef.current = null;
    };
  }, []);
  const handleGridExitComplete = useCallback(() => {
    if (pendingNavigationRef.current) {
      pendingNavigationRef.current();
      pendingNavigationRef.current = null;
    }
  }, []);
  const scheduleNavigation = useCallback(
    (direction, rect, action, pivotId = null) => {
      if (navigationHintDelayRef.current) {
        clearTimeout(navigationHintDelayRef.current);
        navigationHintDelayRef.current = null;
      }
      const startNavigationHint = () => {
        triggerNavigationHint(direction, rect, pivotId);
        navigationHintDelayRef.current = null;
      };
      if (typeof window !== "undefined" && GRID_NAVIGATION_HEADER_DELAY_MS > 0) {
        navigationHintDelayRef.current = window.setTimeout(
          startNavigationHint,
          GRID_NAVIGATION_HEADER_DELAY_MS
        );
      } else {
        startNavigationHint();
      }
      if (!action) {
        pendingNavigationRef.current = null;
        return null;
      }
      let resolveNavigation;
      const completion = new Promise((resolve) => {
        resolveNavigation = resolve;
      });
      pendingNavigationRef.current = () => {
        try {
          const result = action();
          if (isPromiseLike(result)) {
            result.finally(() => resolveNavigation?.());
            return;
          }
        } catch (error) {
          resolveNavigation?.();
          throw error;
        }
        resolveNavigation?.();
      };
      return completion;
    },
    [triggerNavigationHint]
  );
  const handleGridItemClick = useCallback(
    (item, meta) => {
      if (showAssignmentOnly && hasAssignmentList) {
        handleAssignmentGridClick(item);
        return;
      }
      const isTerminalCard =
        item.level === 2 && item.socCode && item.level !== 1;
      if (isTerminalCard) {
        handleGridClick(item);
        return;
      }
      const pivotId = meta?.itemId ?? item.id;
      const fallbackRect = () => {
        if (typeof document === "undefined") return null;
        const el = document.querySelector(
          `[data-jobviz-card-id="${pivotId}"]`
        );
        if (!(el instanceof HTMLElement)) return null;
        const rect = el.getBoundingClientRect();
        return { x: rect.left, y: rect.top, width: rect.width, height: rect.height };
      };
      const cardRect = meta?.cardRect ?? fallbackRect();
      if (cardRect) {
        scheduleNavigation(
          "down",
          cardRect,
          () => handleGridClick(item),
          pivotId
        );
        return;
      }
      handleGridClick(item);
    },
    [
      showAssignmentOnly,
      hasAssignmentList,
      handleAssignmentGridClick,
      scheduleNavigation,
      handleGridClick,
    ]
  );

  const breadcrumbs = useMemo(() => {
    const segments = [
      {
        label: "job-categories",
        iconName: "Grid2x2",
        onClick:
          chainNodes.length || parsed.targetLevel > 1
            ? (event) => {
                const rect = event?.currentTarget?.getBoundingClientRect();
                scheduleNavigation("up", rect, () =>
                  router
                    .push(
                      buildJobvizUrl(
                        { targetLevel: 1, selectedLevel: null, idPath: [] },
                        assignmentParams,
                        sortQueryParams
                      ),
                      undefined,
                      { scroll: false, shallow: true }
                    )
                    .finally(scrollToBreadcrumb)
                );
              }
            : undefined,
        isActive: !chainNodes.length,
      },
    ];

    chainNodes.forEach((node, index) => {
      const targetLevelForNode = getTargetLevelForNode(node);
      const isLast = index === chainNodes.length - 1;
      const label = getDisplayTitle(node)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-");

      // Avoid duplicate consecutive labels when idPath contains the same node twice.
      const isDuplicate =
        segments.length &&
        segments[segments.length - 1].label === label &&
        segments[segments.length - 1].iconName === getIconNameForNode(node);

      if (isDuplicate) return;

      segments.push({
        label,
        iconName: getIconNameForNode(node),
        isActive: isLast,
        onClick: isLast
          ? undefined
          : (event) => {
              const rect = event?.currentTarget?.getBoundingClientRect();
              scheduleNavigation("up", rect, () =>
                router
                  .push(
                    buildJobvizUrl(
                      {
                        targetLevel: targetLevelForNode,
                        selectedLevel: getSelectedSocCodeForLevel(
                          node,
                          targetLevelForNode
                        ),
                        idPath: buildIdPathForNode(node),
                      },
                      assignmentParams,
                      sortQueryParams
                    ),
                    undefined,
                    { scroll: false, shallow: true }
                  )
                  .finally(scrollToBreadcrumb)
              );
            },
      });
    });

    return segments;
  }, [
    assignmentParams,
    chainNodes,
    parsed.targetLevel,
    router,
    scheduleNavigation,
    scrollToBreadcrumb,
    sortQueryParams,
  ]);
  const isShowingAssignmentScope = showAssignmentOnly && hasAssignmentList;
  const activeBreadcrumb = breadcrumbs[breadcrumbs.length - 1];
  const baseViewTitle = activeNode
    ? getDisplayTitle(activeNode)
    : activeBreadcrumb?.label?.replace(/-/g, " ") ?? "Job categories";
  const viewingTitle = isShowingAssignmentScope
    ? "Assigned jobs"
    : baseViewTitle;
  const viewingIconName = isShowingAssignmentScope
    ? "Sparkles"
    : activeNode
      ? getIconNameForNode(activeNode)
      : activeBreadcrumb?.iconName ?? "Grid2x2";
  const viewingMetaLine =
    visibleGroupCount > 0
      ? `Showing ${visibleGroupCount} job group${visibleGroupCount === 1 ? "" : "s"}${
          visibleJobCount > 0
            ? ` & ${visibleJobCount} job${visibleJobCount === 1 ? "" : "s"}`
            : ""
        }`
      : `Showing ${visibleJobCount} job${visibleJobCount === 1 ? "" : "s"}`;
  const viewingHeaderData = useMemo(
    () => ({
      title: viewingTitle,
      meta: viewingMetaLine,
      iconName: viewingIconName,
    }),
    [viewingTitle, viewingMetaLine, viewingIconName]
  );
  const [activeViewingHeader, setActiveViewingHeader] = useState(
    viewingHeaderData
  );
  const [outgoingViewingHeader, setOutgoingViewingHeader] = useState(null);
  const [isViewingHeaderTransitioning, setIsViewingHeaderTransitioning] =
    useState(false);
  const viewingHeaderTimeoutRef = useRef(null);
  useEffect(() => {
    const prev = activeViewingHeader;
    const changed =
      prev.title !== viewingHeaderData.title ||
      prev.meta !== viewingHeaderData.meta ||
      prev.iconName !== viewingHeaderData.iconName;
    if (!changed) return;
    setOutgoingViewingHeader(prev);
    setActiveViewingHeader(viewingHeaderData);
    setIsViewingHeaderTransitioning(true);
    if (viewingHeaderTimeoutRef.current) {
      clearTimeout(viewingHeaderTimeoutRef.current);
    }
    viewingHeaderTimeoutRef.current = setTimeout(() => {
      setOutgoingViewingHeader(null);
      setIsViewingHeaderTransitioning(false);
      viewingHeaderTimeoutRef.current = null;
    }, VIEWING_HEADER_TRANSITION_MS);
  }, [activeViewingHeader, viewingHeaderData]);

  const assignmentJobCount =
    jobTitleAndSocCodePairs?.length ?? assignmentSocCodes?.size ?? 0;
  const baseHeroSubtitle =
    "A tool for grades 6 to adult to explore career possibilities!";
  const assignmentCountLabel = assignmentJobCount
    ? `${assignmentJobCount} career${assignmentJobCount === 1 ? "" : "s"}`
    : "a curated set of careers";
  const studentHeroSubtitle = `This assignment spotlights ${assignmentCountLabel} with quick descriptions, wages, and growth stats so you can rate how interested you are. Feel free to explore related careers as you rate the selected jobs. Discover what's possible!`;
  const heroSubtitle = isStudentMode ? studentHeroSubtitle : baseHeroSubtitle;
  const heroTitle = isStudentMode
    ? "JobViz+ Career Tour Assignment"
    : "JobViz Career Explorer+";
  const isGpPlusHero = !!hasGpPlusMembership;
  const ensureJobCategoriesLevel = useCallback(() => {
    if (parsed.targetLevel === 1 && chainNodes.length === 0) {
      return;
    }
    const nextUrl = buildJobvizUrl(
      { targetLevel: 1, selectedLevel: null, idPath: [] },
      assignmentParams,
      sortQueryParams
    );
    return scheduleNavigation("up", null, () =>
      router.push(nextUrl, undefined, { scroll: false, shallow: true })
    );
  }, [
    assignmentParams,
    chainNodes.length,
    parsed.targetLevel,
    router,
    scheduleNavigation,
    sortQueryParams,
  ]);
  const handleHeroStatAction = useHeroStatAction({
    onBrowseNavigate: ensureJobCategoriesLevel,
  });
  const heroEyebrow = isStudentMode
    ? "STUDENT VIEW"
    : isGpPlusHero
      ? "Premium | GP+ Subscriber"
      : undefined;
  const heroSlot = !isStudentMode && !isGpPlusHero ? (
    <HeroForFreeUsers onStatAction={handleHeroStatAction} />
  ) : null;
  const showGpPlusUpsell = !hasGpPlusMembership && !isStudentMode;


  useEffect(() => {
    if (activeNode && activeNode.occupation_type === "Line item") {
      setSelectedJob({ ...activeNode, wasSelectedFromJobToursCard: false });
      setIsJobModalOn(true);
      return;
    }

    setIsJobModalOn(false);
    setSelectedJob(null);
    setJobvizReturnPath(null);
  }, [activeNode, setIsJobModalOn, setSelectedJob, setJobvizReturnPath]);

  const jobvizCanonicalUrl = "https://teach.galacticpolymath.com/jobviz";
  const datasetStructuredData = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "Dataset",
      name: resolvedPageTitle,
      description: resolvedMetaDescription,
      creator: {
        "@type": "Organization",
        name: "Galactic Polymath",
        url: "https://teach.galacticpolymath.com",
      },
      keywords: [
        "jobviz",
        "career explorer",
        "career exploration",
        "Bureau of Labor Statistics",
        "STEM careers",
      ],
      isAccessibleForFree: true,
      url: jobvizCanonicalUrl,
      distribution: [
        {
          "@type": "DataDownload",
          encodingFormat: "text/html",
          contentUrl: jobvizCanonicalUrl,
        },
      ],
    }),
    [resolvedMetaDescription, resolvedPageTitle]
  );
  const layoutProps = {
    title: resolvedPageTitle,
    description: resolvedMetaDescription,
    imgSrc: "https://teach.galacticpolymath.com/imgs/jobViz/jobviz_icon.png",
    url: jobvizCanonicalUrl,
    canonicalLink: jobvizCanonicalUrl,
    keywords:
      "jobviz, job viz, career explorer, career exploration, career pathways, BLS jobs, career navigation",
    showNav: viewMode !== "student",
    showFooter: viewMode !== "student",
    structuredData: datasetStructuredData,
  };
  const assignmentBannerOverrides = useMemo(() => {
    if (viewMode !== "student") return null;
    const unitLabel = preservedUnitName
      ? `Jobs connected to the "${preservedUnitName}" lesson`
      : "Jobs your teacher wants you to explore first";
    return {
      assignmentUnitLabelOverride: unitLabel,
      assignmentCopyOverride:
        "Explore each job, note how interested you are, and be ready to explain your rating using the data shown here.",
    };
  }, [preservedUnitName, viewMode]);

  return (
    <Layout {...layoutProps}>
      {shouldRenderAssignment && (
        <>
          <AssignmentBanner
            variant="mobile"
            unitName={preservedUnitName}
            jobs={jobTitleAndSocCodePairs}
            assignmentParams={assignmentParams}
            onJobClick={handleAssignmentJobClick}
            {...(assignmentBannerOverrides ?? {})}
          />
          <div id="jobviz-mobile-modal-anchor" />
        </>
      )}
      <div
        className={styles.jobvizPageShell}
        data-has-assignment={shouldRenderAssignment}
      >
        <div className={styles.jobvizMainColumn}>
          <JobVizLayout
            heroTitle={heroTitle}
            heroSubtitle={heroSubtitle}
            heroSlot={heroSlot}
            heroEyebrow={heroEyebrow}
            onStatAction={handleHeroStatAction}
          >
            {teacherEditDenied && (
              <div className={styles.jobvizNotice} role="alert">
                <strong>Looking for edit controls?</strong> GP+ members can turn on tour editing to build and save custom JobViz+ assignments. Sign in with a GP+ account or remove the <code>?edit=1</code> parameter to preview the student view.
              </div>
            )}
            {isTeacherEditMode && !teacherEditDenied && (
              <div className={styles.tourBuilderPlaceholder}>
                <h3>Tour Builder preview</h3>
                <p>
                  This editing surface will soon let you rename the assignment, customize the hero copy, and click assignment dots to add jobs to your tour. We&apos;ll store these plans in GP+ so you can reuse or share them.
                </p>
                <p>
                  In the meantime, explore the assignment flow below to see what your students experience.
                </p>
              </div>
            )}
            {showIntroHeading && (
              <h2 className={styles.jobvizSectionHeading}>{sectionHeading}</h2>
            )}
            <h3 className={styles.jobvizSearchAppeal}>
              Explore the true diversity of career opportunities.
            </h3>

            <JobVizSearch
              assignmentParams={assignmentParams}
              extraQueryParams={sortQueryParams}
            />
            <div id={JOBVIZ_BRACKET_SEARCH_ID} />
            <div className={styles.jobvizContextZone}>
              <div
                className={styles.jobvizGridWrap}
                id={JOBVIZ_CATEGORIES_ANCHOR_ID}
              >
                <div className={styles.pathHeader}>
                  <div className={styles.gridContextLabel}>Current Path</div>
                  {isShowingAssignmentScope ? (
                    <div className={styles.assignedScopeMessage}>
                      <LucideIcon name="Sparkles" />
                      Showing assigned jobs across multiple categories
                    </div>
                  ) : (
                    <JobVizBreadcrumb segments={breadcrumbs} />
                  )}
                </div>
                <div className={styles.viewingHeader}>
                  {outgoingViewingHeader && (
                    <div
                      className={`${styles.viewingHeaderLayer} ${styles.viewingHeaderLayerOutgoing}`}
                      aria-hidden="true"
                    >
                      <div className={styles.viewingIdentity}>
                        <span className={styles.viewingIcon}>
                          <LucideIcon name={outgoingViewingHeader.iconName} />
                        </span>
                        <div>
                          <h3 className={styles.viewingTitle}>
                            {outgoingViewingHeader.title}
                          </h3>
                          <p className={styles.viewingMeta}>
                            {outgoingViewingHeader.meta}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  <div
                    className={`${styles.viewingHeaderLayer} ${
                      isViewingHeaderTransitioning
                        ? styles.viewingHeaderLayerIncoming
                        : ""
                    }`}
                  >
                    <div className={styles.viewingIdentity}>
                      <span className={styles.viewingIcon}>
                        <LucideIcon name={activeViewingHeader.iconName} />
                      </span>
                      <div>
                        <h3
                          id={JOBVIZ_HIERARCHY_HEADING_ID}
                          className={styles.viewingTitle}
                        >
                          {activeViewingHeader.title}
                        </h3>
                        <p className={styles.viewingMeta}>
                          {activeViewingHeader.meta}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className={styles.gridFilterRow}>
                  {hasAssignmentList && (
                    <div className={styles.gridFilterActions}>
                      <button
                        type="button"
                        className={`${styles.assignedToggleButton} ${
                          isShowingAssignmentScope
                            ? styles.assignedToggleButtonActive
                            : ""
                        }`}
                        onClick={() => setShowAssignmentOnly((prev) => !prev)}
                        aria-pressed={isShowingAssignmentScope}
                      >
                        <span
                          className={styles.assignedToggleIndicator}
                          aria-hidden="true"
                        />
                        Show only assigned jobs
                      </button>
                      {isStudentMode && !isShowingAssignmentScope && (
                        <button
                          type="button"
                          className={styles.assignmentReturnButton}
                          onClick={() => setShowAssignmentOnly(true)}
                        >
                          Back to assignment
                        </button>
                      )}
                    </div>
                  )}
                  <JobVizSortControl
                    activeOptionId={sortOptionId}
                    onChange={handleSortControlChange}
                    options={JOBVIZ_SORT_OPTIONS}
                  />
                </div>
                <JobVizGrid
                  items={renderedGridItems}
                  onItemClick={handleGridItemClick}
                  navigationHint={navigationHint}
                  onExitComplete={handleGridExitComplete}
                />
              </div>

              <p className={`${styles.jobvizSource} ${styles.jobvizSourceFixed}`}>
                Data source:{" "}
                <a href={JOBVIZ_DATA_SOURCE} target="_blank" rel="noreferrer">
                  US Bureau of Labor Statistics
                </a>
                {activeNode?.BLS_link && (
                  <>
                    {"  "}•{" "}
                    <a href={activeNode.BLS_link} target="_blank" rel="noreferrer">
                      View on BLS
                    </a>
                  </>
                )}
              </p>
              {showGpPlusUpsell && (
                <div className={styles.jobvizUpsellCard}>
                  <div>
                    <p className={styles.jobvizUpsellEyebrow}>For Teachers</p>
                    <h3>Want to connect this resource to your classroom?</h3>
                    <p>
                      Unlock curated JobViz+ career tours, assignment tools, and ready-to-use lesson
                      integrations with a GP+ subscription.
                    </p>
                  </div>
                  <a
                    href="https://www.galacticpolymath.com/plus"
                    target="_blank"
                    rel="noreferrer"
                    className={styles.jobvizUpsellButton}
                  >
                    Explore GP+
                  </a>
                </div>
              )}
            </div>
          </JobVizLayout>
        </div>
        {shouldRenderAssignment && (
          <AssignmentBanner
            variant="desktop"
            unitName={preservedUnitName}
            jobs={jobTitleAndSocCodePairs}
            assignmentParams={assignmentParams}
            onJobClick={handleAssignmentJobClick}
            {...(assignmentBannerOverrides ?? {})}
          />
        )}
      </div>
    </Layout>
  );
};

export const getServerSideProps = async ({ query, req, resolvedUrl }) => {
  const socCodesStr = query?.[SOC_CODES_PARAM_NAME];
  const unitName = query?.[UNIT_NAME_PARAM_NAME] ?? null;
  const socCodes = socCodesStr ? new Set(socCodesStr.split(",")) : null;
  const jobTitleAndSocCodePairs = socCodes
    ? getUnitRelatedJobs(socCodes).map(({ title, soc_code }) => [
        title,
        soc_code,
      ])
    : null;
  let metaDescription = null;
  const sessionToken =
    req.cookies["next-auth.session-token"] ||
    req.cookies["__Secure-next-auth.session-token"] ||
    null;
  let hasGpPlusMembership = req?.cookies?.["isGpPlusMember"];

  if (typeof hasGpPlusMembership === "string") {
    hasGpPlusMembership = hasGpPlusMembership === "true";
  } else if (!hasGpPlusMembership && sessionToken) {
    hasGpPlusMembership = !!(await verifyJwt(sessionToken))?.payload
      ?.hasGpPlusMembership;
  }

  const isAuthenticated = Boolean(sessionToken);
  hasGpPlusMembership = Boolean(isAuthenticated && hasGpPlusMembership);

  const pathWithoutQuery = resolvedUrl.split("?")[0];
  const pathSegments = pathWithoutQuery.split("/").slice(2);
  const parsedPath = parseJobvizPath(pathSegments);
  const lastId = parsedPath.idPath[parsedPath.idPath.length - 1];

  if (lastId) {
    const node = jobVizNodeById.get(lastId);
    if (node) {
      metaDescription = node.def
        ? `${getDisplayTitle(node)}: ${node.def}`
        : getDisplayTitle(node);
    }
  }

  return {
    props: {
      metaDescription,
      unitName,
      jobTitleAndSocCodePairs,
      hasGpPlusMembership,
    },
  };
};

export default JobVizSearchResults;
