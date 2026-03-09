import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  buildIdPathForNode,
  buildJobvizUrl,
  getDisplayTitle,
  getIconNameForNode,
  getJobSpecificIconName,
  getLineItemCountForNode,
  getNodeBySocCode,
  getSelectedSocCodeForLevel,
  getTargetLevelForNode,
  jobVizNodeById,
} from "../jobvizUtils";
import { sortJobVizItems } from "../jobvizSorting";

const VIEWING_HEADER_TRANSITION_MS = 480;
const GRID_NAVIGATION_HEADER_DELAY_MS = VIEWING_HEADER_TRANSITION_MS;

export const useJobVizGridState = ({
  assignmentAncestors,
  assignmentParams,
  assignmentSocCodes,
  chainNodes,
  filteredSlice,
  hasAssignmentList,
  isTourPreviewMode,
  parsed,
  preservedJobvizQueryParams,
  previewLockedCount,
  router,
  savedJobIds,
  scheduleUpgradeModal,
  scrollToBreadcrumb,
  scrollToViewingHeader,
  setIsJobModalOn,
  setJobvizReturnPath,
  setSelectedJob,
  showAssignmentOnly,
  showSavedJobsOnly,
  sortOptionId,
  status,
}) => {
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
          preservedJobvizQueryParams
        );
      }

      return buildJobvizUrl(
        { targetLevel, selectedLevel, idPath: parentPath },
        assignmentParams,
        preservedJobvizQueryParams
      );
    },
    [assignmentParams, preservedJobvizQueryParams]
  );

  const gridItems = useMemo(
    () =>
      filteredSlice.map((node) => ({
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
        highlightClicked: false,
        showBookmark:
          (node.soc_code && savedJobIds.has(node.soc_code)) ||
          savedJobIds.has(String(node.id)),
      })),
    [assignmentAncestors, assignmentSocCodes, filteredSlice, savedJobIds]
  );

  const assignmentJobItems = useMemo(() => {
    if (!assignmentSocCodes?.size) return [];
    return Array.from(assignmentSocCodes)
      .map((code) => getNodeBySocCode(code))
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
        showBookmark:
          (node.soc_code && savedJobIds.has(node.soc_code)) ||
          savedJobIds.has(String(node.id)),
      }));
  }, [assignmentSocCodes, savedJobIds]);

  const savedJobItems = useMemo(() => {
    if (!savedJobIds.size) return [];
    return Array.from(savedJobIds)
      .map((savedId) => {
        const normalized = savedId.trim();
        return getNodeBySocCode(normalized) ?? jobVizNodeById.get(Number(normalized));
      })
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
        isAssignmentJob: assignmentSocCodes?.has(node.soc_code) ?? false,
        highlight:
          assignmentAncestors.has(node.id) ||
          (assignmentSocCodes?.has(node.soc_code) ?? false),
        highlightClicked: false,
        showBookmark: true,
      }));
  }, [assignmentAncestors, assignmentSocCodes, savedJobIds]);

  const previewLockedItems = useMemo(() => {
    if (!isTourPreviewMode || !previewLockedCount) return [];
    return Array.from({ length: previewLockedCount }).map((_, index) => ({
      id: `preview-locked-${index + 1}`,
      title: "Unlock with GP+",
      iconName: "Lock",
      level: 2,
      jobsCount: undefined,
      growthPercent: null,
      wage: null,
      education: null,
      socCode: null,
      isAssignmentJob: true,
      highlight: false,
      highlightClicked: false,
      showBookmark: false,
      isLocked: true,
    }));
  }, [isTourPreviewMode, previewLockedCount]);

  const sortedGridItems = useMemo(
    () => sortJobVizItems(gridItems, sortOptionId),
    [gridItems, sortOptionId]
  );
  const sortedAssignmentItems = useMemo(
    () => sortJobVizItems(assignmentJobItems, sortOptionId),
    [assignmentJobItems, sortOptionId]
  );
  const sortedSavedItems = useMemo(
    () => sortJobVizItems(savedJobItems, sortOptionId),
    [savedJobItems, sortOptionId]
  );

  const filteredGridItems = useMemo(() => {
    if (showSavedJobsOnly && status === "authenticated") {
      return sortedSavedItems;
    }
    if (showAssignmentOnly && hasAssignmentList) {
      return isTourPreviewMode
        ? [...sortedAssignmentItems, ...previewLockedItems]
        : sortedAssignmentItems;
    }
    return sortedGridItems;
  }, [
    hasAssignmentList,
    isTourPreviewMode,
    previewLockedItems,
    showAssignmentOnly,
    showSavedJobsOnly,
    sortedAssignmentItems,
    sortedGridItems,
    sortedSavedItems,
    status,
  ]);

  const [persistedGridItems, setPersistedGridItems] = useState(filteredGridItems);
  const activeNode = chainNodes[chainNodes.length - 1] ?? null;
  const showDetail = Boolean(activeNode && activeNode.occupation_type === "Line item");

  useEffect(() => {
    if (!showDetail) setPersistedGridItems(filteredGridItems);
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

  const parentForHeading = useMemo(
    () => (parsed.selectedLevel ? getNodeBySocCode(parsed.selectedLevel) ?? null : null),
    [parsed.selectedLevel]
  );
  const sectionHeading =
    parentForHeading?.soc_title ||
    parentForHeading?.title ||
    "Browse jobs by category or search";
  const showIntroHeading = chainNodes.length === 0;

  const handleAssignmentJobClick = useCallback(
    (socCode) => {
      const node = getNodeBySocCode(socCode);
      if (!node) return;
      setSelectedJob({ ...node, wasSelectedFromJobToursCard: false });
      setIsJobModalOn(true);
      setPersistedGridItems(filteredGridItems);
      setJobvizReturnPath(buildReturnUrlForNode(node));
      router.push(
        buildJobvizUrl(
          { fromNode: node },
          assignmentParams,
          preservedJobvizQueryParams
        ),
        undefined,
        { scroll: false, shallow: true }
      );
    },
    [
      assignmentParams,
      buildReturnUrlForNode,
      filteredGridItems,
      preservedJobvizQueryParams,
      router,
      setIsJobModalOn,
      setJobvizReturnPath,
      setSelectedJob,
    ]
  );

  const handleGridClick = useCallback(
    (item) => {
      const node = jobVizNodeById.get(Number(item.id));
      if (!node) return;
      const targetLevel = getTargetLevelForNode(node);
      const selectedLevel = getSelectedSocCodeForLevel(node, targetLevel);
      const idPath = buildIdPathForNode(node);
      const nextUrl = buildJobvizUrl(
        { targetLevel, selectedLevel, idPath },
        assignmentParams,
        preservedJobvizQueryParams
      );
      const isLineItem = node.occupation_type === "Line item";
      if (isLineItem) {
        setSelectedJob({ ...node, wasSelectedFromJobToursCard: false });
        setIsJobModalOn(true);
        setPersistedGridItems(filteredGridItems);
        setJobvizReturnPath(buildReturnUrlForNode(node));
      }
      const pushPromise = router.push(nextUrl, undefined, {
        scroll: false,
        shallow: true,
      });
      if (!isLineItem) {
        pushPromise.finally(scrollToViewingHeader);
      }
      return pushPromise;
    },
    [
      assignmentParams,
      buildReturnUrlForNode,
      filteredGridItems,
      preservedJobvizQueryParams,
      router,
      scrollToViewingHeader,
      setIsJobModalOn,
      setJobvizReturnPath,
      setSelectedJob,
    ]
  );

  const [navigationHint, setNavigationHint] = useState(null);
  const viewingHeaderTimeoutRef = useRef(null);
  const pendingNavigationRef = useRef(null);
  const navigationWaveRef = useRef(0);
  const navigationHintDelayRef = useRef(null);
  const normalizeRect = useCallback((rect) => {
    if (!rect) return null;
    if ("left" in rect) {
      return { x: rect.left, y: rect.top, width: rect.width, height: rect.height };
    }
    return rect;
  }, []);
  const isPromiseLike = (value) =>
    Boolean(value) &&
    typeof value === "object" &&
    typeof value.then === "function" &&
    typeof value.finally === "function";
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

  useEffect(
    () => () => {
      if (viewingHeaderTimeoutRef.current) clearTimeout(viewingHeaderTimeoutRef.current);
      if (navigationHintDelayRef.current) clearTimeout(navigationHintDelayRef.current);
      if (gridItemsDelayRef.current) clearTimeout(gridItemsDelayRef.current);
      pendingNavigationRef.current = null;
    },
    []
  );

  const handleGridExitComplete = useCallback(() => {
    if (pendingNavigationRef.current) {
      pendingNavigationRef.current();
      pendingNavigationRef.current = null;
    }
  }, []);

  const scheduleNavigation = useCallback(
    (direction, rect, action, pivotId = null) => {
      if (navigationHintDelayRef.current) clearTimeout(navigationHintDelayRef.current);
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
      if (item?.isLocked) {
        scheduleUpgradeModal(true);
        return;
      }
      if (showAssignmentOnly && hasAssignmentList) {
        if (item?.socCode) handleAssignmentJobClick(item.socCode);
        return;
      }
      if (item.level === 2 && item.socCode && item.level !== 1) {
        handleGridClick(item);
        return;
      }
      const pivotId = meta?.itemId ?? item.id;
      const fallbackRect = () => {
        if (typeof document === "undefined") return null;
        const el = document.querySelector(`[data-jobviz-card-id="${pivotId}"]`);
        if (!(el instanceof HTMLElement)) return null;
        const rect = el.getBoundingClientRect();
        return { x: rect.left, y: rect.top, width: rect.width, height: rect.height };
      };
      const cardRect = meta?.cardRect ?? fallbackRect();
      if (cardRect) {
        scheduleNavigation("down", cardRect, () => handleGridClick(item), pivotId);
        return;
      }
      handleGridClick(item);
    },
    [
      handleAssignmentJobClick,
      handleGridClick,
      hasAssignmentList,
      scheduleNavigation,
      scheduleUpgradeModal,
      showAssignmentOnly,
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
                        preservedJobvizQueryParams
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
      const label = getDisplayTitle(node).toLowerCase().replace(/[^a-z0-9]+/g, "-");
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
                      preservedJobvizQueryParams
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
    preservedJobvizQueryParams,
    router,
    scheduleNavigation,
    scrollToBreadcrumb,
  ]);

  const isShowingAssignmentScope = showAssignmentOnly && hasAssignmentList;
  const isShowingSavedScope = showSavedJobsOnly && status === "authenticated";
  const activeBreadcrumb = breadcrumbs[breadcrumbs.length - 1];
  const baseViewTitle = activeNode
    ? getDisplayTitle(activeNode)
    : activeBreadcrumb?.label?.replace(/-/g, " ") ?? "Job categories";
  const viewingTitle = isShowingSavedScope
    ? "Saved jobs"
    : isShowingAssignmentScope
      ? "Tour jobs"
      : baseViewTitle;
  const viewingIconName = isShowingSavedScope
    ? "Star"
    : isShowingAssignmentScope
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
    () => ({ title: viewingTitle, meta: viewingMetaLine, iconName: viewingIconName }),
    [viewingIconName, viewingMetaLine, viewingTitle]
  );
  const [activeViewingHeader, setActiveViewingHeader] = useState(viewingHeaderData);
  const [outgoingViewingHeader, setOutgoingViewingHeader] = useState(null);
  const [isViewingHeaderTransitioning, setIsViewingHeaderTransitioning] =
    useState(false);

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

  useEffect(() => {
    if (activeNode && activeNode.occupation_type === "Line item") {
      setSelectedJob({ ...activeNode, wasSelectedFromJobToursCard: false });
      setIsJobModalOn(true);
      return;
    }
    setIsJobModalOn(false);
    setJobvizReturnPath(null);
  }, [activeNode, setIsJobModalOn, setJobvizReturnPath, setSelectedJob]);

  const ensureJobCategoriesLevel = useCallback(() => {
    if (parsed.targetLevel === 1 && chainNodes.length === 0) return;
    const nextUrl = buildJobvizUrl(
      { targetLevel: 1, selectedLevel: null, idPath: [] },
      assignmentParams,
      preservedJobvizQueryParams
    );
    return scheduleNavigation("up", null, () =>
      router.push(nextUrl, undefined, { scroll: false, shallow: true })
    );
  }, [
    assignmentParams,
    chainNodes.length,
    parsed.targetLevel,
    preservedJobvizQueryParams,
    router,
    scheduleNavigation,
  ]);

  return {
    activeNode,
    activeViewingHeader,
    breadcrumbs,
    ensureJobCategoriesLevel,
    handleAssignmentJobClick,
    handleGridExitComplete,
    handleGridItemClick,
    isShowingAssignmentScope,
    isShowingSavedScope,
    isViewingHeaderTransitioning,
    navigationHint,
    outgoingViewingHeader,
    renderedGridItems,
    sectionHeading,
    showIntroHeading,
  };
};
