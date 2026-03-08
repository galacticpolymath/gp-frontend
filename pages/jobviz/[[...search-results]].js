import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import Layout from "../../components/Layout";
import { AssignmentBanner } from "../../components/JobViz/AssignmentBanner";
import { JOBVIZ_BREADCRUMB_ID } from "../../components/JobViz/JobVizBreadcrumb";
import { JobVizGrid } from "../../components/JobViz/JobVizGrid";
import { JobVizLayout } from "../../components/JobViz/JobVizLayout";
import HeroForFreeUsers from "../../components/JobViz/Heros/HeroForFreeUsers";
import { JOBVIZ_BRACKET_SEARCH_ID } from "../../components/JobViz/jobvizConstants";
import styles from "../../styles/jobviz.module.scss";
import {
  getDisplayTitle,
  jobVizNodeById,
  parseJobvizPath,
} from "../../components/JobViz/jobvizUtils";
import { JobVizSearch } from "../../components/JobViz/JobVizSearch";
import { JOBVIZ_SORT_OPTIONS } from "../../components/JobViz/jobvizSorting";
import {
  SOC_CODES_PARAM_NAME,
  UNIT_NAME_PARAM_NAME,
} from "../../components/LessonSection/JobVizConnections";
import { getUnitRelatedJobs } from "../../helperFns/filterUnitRelatedJobs";
import { ModalContext } from "../../providers/ModalProvider";
import { useHeroStatAction } from "../../components/JobViz/useHeroStatAction";
import {
  JOBVIZ_CATEGORIES_ANCHOR_ID,
  JOBVIZ_HIERARCHY_HEADING_ID,
} from "../../components/JobViz/jobvizDomIds";
import useSiteSession from "../../customHooks/useSiteSession";
import { useUserContext } from "../../providers/UserProvider";
import { JobTourEditorProvider } from "../../components/JobViz/jobTourEditorContext";
import JobTourEditorFields from "../../components/JobViz/JobTours/JobTourEditorFields";
import { DEFAULT_JOB_TOUR_ASSIGNMENT } from "../../components/JobViz/JobTours/jobTourConstants";
import { buildStudentTourUrl, JOBVIZ_PREVIEW_LIMIT } from "../../components/JobViz/JobTours/tourAccess";
import { useJobTourEditor } from "../../components/JobViz/JobTours/useJobTourEditor";
import { useJobVizAssignmentState } from "../../components/JobViz/Page/useJobVizAssignmentState";
import { useJobVizGridState } from "../../components/JobViz/Page/useJobVizGridState";
import { JobVizNotices } from "../../components/JobViz/Page/JobVizNotices";
import { JobVizGridHeader } from "../../components/JobViz/Page/JobVizGridHeader";
import { JobVizFilterBar } from "../../components/JobViz/Page/JobVizFilterBar";
import { JobVizSourceAndUpsell } from "../../components/JobViz/Page/JobVizSourceAndUpsell";
import { JobVizOverlays } from "../../components/JobViz/Page/JobVizOverlays";
import { toast } from "react-hot-toast";
import editorStyles from "../../components/JobViz/JobTours/JobTourEditorFields.module.scss";

const JobTourUpgradeModal = dynamic(
  () => import("../../components/JobViz/JobTours/JobTourUpgradeModal")
);

const JOBVIZ_DESCRIPTION =
  "Explore the full BLS hierarchy with the JobViz glass UI—glass cards, glowing breadcrumbs, and animated explore links keyed to real SOC data.";
const JOBVIZ_DATA_SOURCE =
  "https://www.bls.gov/emp/tables/occupational-projections-and-characteristics.htm";
const JOBVIZ_WELCOME_DISMISSED_KEY = "jobviz_intro_dismissed";
const JOBVIZ_TOUR_WELCOME_DISMISSED_KEY = "jobviz_tour_intro_dismissed";

const JobVizSearchResults = ({
  metaDescription,
  unitName,
  jobTitleAndSocCodePairs,
  isGpPlusMember: isGpPlusMemberFromCookie,
}) => {
  const router = useRouter();
  const modalContext = useContext(ModalContext);
  if (!modalContext) {
    throw new Error("ModalContext is required for JobViz");
  }
  const [, setSelectedJob] = modalContext._selectedJob;
  const [, setIsJobModalOn] = modalContext._isJobModalOn;
  const [, setIsLoginModalDisplayed] = modalContext._isLoginModalDisplayed;
  const [, setJobvizReturnPath] = modalContext._jobvizReturnPath;
  const [, setJobvizSummaryModal] = modalContext._jobvizSummaryModal;
  const { user, token, status, isGpPlusMember: gpPlusCookie } = useSiteSession();
  const authorizationHeader =
    typeof token === "string" && token.startsWith("Bearer ")
      ? token
      : `Bearer ${token ?? ""}`;
  const {
    _isUserTeacher: [isUserTeacher],
    _isGpPlusMember: [isGpPlusMember],
  } = useUserContext();
  const userId = user?.userId ?? null;
  const isGpPlusCookieValue =
    gpPlusCookie === true || gpPlusCookie === "true";
  const hasGpPlusMembership =
    status === "authenticated" &&
    (isGpPlusMember || isGpPlusCookieValue || isGpPlusMemberFromCookie);
  const [showJobvizWelcome, setShowJobvizWelcome] = useState(false);
  const [showTourWelcome, setShowTourWelcome] = useState(false);
  const [tourLoadState, setTourLoadState] = useState({
    isLoading: false,
    error: null,
  });
  const [showTourUpgradeModal, setShowTourUpgradeModal] = useState(false);
  const [savedJobIds, setSavedJobIds] = useState(new Set());
  const [selectedTourJobs, setSelectedTourJobs] = useState(new Set());
  const [lastToggledSoc, setLastToggledSoc] = useState(null);
  const isTeacherEditMode = Boolean(
    typeof router.query?.edit === "string" &&
      ["1", "true", "edit"].includes(router.query.edit.toLowerCase()) &&
      hasGpPlusMembership
  );
  const {
    activeTour,
    assignmentAncestors,
    assignmentParams,
    assignmentSocCodes,
    hasAssignmentList,
    hierarchySlice,
    isStudentLinkView,
    isStudentMode,
    isTourPreviewMode,
    parsed,
    preservedJobvizQueryParams,
    previewLockedCount,
    resolvedJobTitleAndSocCodePairs,
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
    effectiveUnitName: preservedUnitName,
    handleAssignedToggleClick,
    handleSavedToggleClick,
    handleSortControlChange,
    chainNodes,
    closeSavedJobsUpsell,
    shouldRenderAssignment,
  } = useJobVizAssignmentState({
    assignmentQueryParamName: {
      socCodes: SOC_CODES_PARAM_NAME,
      unitName: UNIT_NAME_PARAM_NAME,
    },
    getSummaryModalSetter: () => setJobvizSummaryModal,
    hasGpPlusMembership,
    initialJobPairs: jobTitleAndSocCodePairs,
    isTeacherEditMode,
    preservedUnitName: unitName,
    router,
    selectedTourJobs,
    setSavedJobIds,
    setSelectedTourJobs,
    setTourLoadState,
    status,
    token,
    unitName,
    userAuthorizationHeader: authorizationHeader,
  });

  const toggleTourJob = useCallback((socCode) => {
    setSelectedTourJobs((prev) => {
      const next = new Set(prev);
      if (next.has(socCode)) {
        next.delete(socCode);
      } else {
        next.add(socCode);
      }
      return next;
    });
    setLastToggledSoc(socCode);
  }, []);

  const isTourJobSelected = useCallback(
    (socCode) => selectedTourJobs.has(socCode),
    [selectedTourJobs]
  );

  const scrollToBreadcrumb = useCallback(() => {
    if (typeof window === "undefined") return;
    window.requestAnimationFrame(() => {
      const el = document.getElementById(JOBVIZ_BREADCRUMB_ID);
      if (!el) return;
      const offset = 32;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    });
  }, []);
  const scrollToViewingHeader = useCallback(() => {
    if (typeof window === "undefined") return;
    window.requestAnimationFrame(() => {
      const target =
        document.getElementById(JOBVIZ_HIERARCHY_HEADING_ID) ??
        document.getElementById(JOBVIZ_CATEGORIES_ANCHOR_ID) ??
        document.getElementById(JOBVIZ_BREADCRUMB_ID);
      if (!target) return;
      const offset = 32;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    });
  }, []);
  const {
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
  } = useJobVizGridState({
    assignmentAncestors,
    assignmentParams,
    assignmentSocCodes,
    chainNodes,
    filteredSlice: hierarchySlice,
    hasAssignmentList,
    parsed,
    preservedJobvizQueryParams,
    previewLockedCount,
    router,
    savedJobIds,
    scheduleUpgradeModal: setShowTourUpgradeModal,
    scrollToBreadcrumb,
    scrollToViewingHeader,
    setIsJobModalOn,
    setJobvizReturnPath,
    setSelectedJob,
    showAssignmentOnly,
    showSavedJobsOnly,
    sortOptionId,
    status,
  });
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

  const assignmentJobCount =
    resolvedJobTitleAndSocCodePairs?.length ?? assignmentSocCodes?.size ?? 0;
  const baseHeroSubtitle =
    "A tool for grades 6 to adult to explore career possibilities!";
  const assignmentCountLabel = assignmentJobCount
    ? `${assignmentJobCount} career${assignmentJobCount === 1 ? "" : "s"}`
    : "a curated set of careers";
  const studentHeroSubtitle = isTourPreviewMode
    ? `Preview mode unlocks the first ${JOBVIZ_PREVIEW_LIMIT} jobs in this tour. Upgrade to GP+ to assign and edit the full experience.`
    : `This assignment spotlights ${assignmentCountLabel} with quick descriptions, wages, and growth stats so you can rate how interested you are. Feel free to explore related careers as you rate the selected jobs. Discover what's possible!`;
  const heroSubtitle = isStudentMode ? studentHeroSubtitle : baseHeroSubtitle;
  const heroTitle = isStudentMode
    ? "JobViz+ Career Tour Assignment"
    : "JobViz Career Explorer+";
  const isGpPlusHero = !!hasGpPlusMembership;
  const handleHeroStatAction = useHeroStatAction({
    onBrowseNavigate: ensureJobCategoriesLevel,
  });
  const heroEyebrow = isStudentLinkView
    ? "STUDENT LINK"
    : isTourPreviewMode
    ? "TOUR PREVIEW"
    : isStudentMode
    ? "STUDENT VIEW"
    : isGpPlusHero
      ? "Premium | GP+ Subscriber"
      : undefined;
  const heroSlot = !isStudentMode && !isGpPlusHero ? (
    <HeroForFreeUsers onStatAction={handleHeroStatAction} />
  ) : null;
  const showGpPlusUpsell = !hasGpPlusMembership && !isStudentMode;
  const handleDismissWelcome = useCallback((storageKey, setter, persist) => {
    if (persist && typeof window !== "undefined") {
      window.localStorage.setItem(storageKey, "true");
    }
    setter(false);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const didDismiss = window.localStorage.getItem(JOBVIZ_WELCOME_DISMISSED_KEY);
    if (!didDismiss) {
      setShowJobvizWelcome(true);
    }
  }, []);

  useEffect(() => {
    if (!tourIdParam || !activeTour?._id || typeof window === "undefined") return;
    const didDismiss = window.localStorage.getItem(
      JOBVIZ_TOUR_WELCOME_DISMISSED_KEY
    );
    if (!didDismiss) {
      setShowTourWelcome(true);
    }
  }, [activeTour?._id, tourIdParam]);

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
    showNav: true,
    showFooter: viewMode !== "student",
    structuredData: datasetStructuredData,
  };
  const isTourOwner =
    Boolean(activeTour?._id) && Boolean(userId) && activeTour?.userId === userId;
  const isTeacherLoggedIn = status === "authenticated" && isUserTeacher;
  const shouldShowTourActions =
    shouldRenderAssignment &&
    !isStudentLinkView &&
    !isTeacherEditMode &&
    !tourLoadState.isLoading &&
    (isTeacherLoggedIn || hasGpPlusMembership);
  const tourActionLabel =
    isTourOwner && hasGpPlusMembership ? "Edit tour" : "Copy and edit";

  const buildEditUrl = useCallback(
    ({ tourIdOverride } = {}) => {
      const params = new URLSearchParams();
      if (assignmentSocCodes?.size) {
        params.set(SOC_CODES_PARAM_NAME, Array.from(assignmentSocCodes).join(","));
      }
      if (preservedUnitName) {
        params.set(UNIT_NAME_PARAM_NAME, preservedUnitName);
      }
      const resolvedTourId = tourIdOverride ?? activeTour?._id;
      if (resolvedTourId) {
        params.set("tourId", resolvedTourId);
      }
      params.set("edit", "1");
      const queryString = params.toString();
      return queryString ? `/jobviz?${queryString}` : "/jobviz?edit=1";
    },
    [activeTour, assignmentSocCodes, preservedUnitName]
  );

  const handleTourActionClick = () => {
    if (!hasGpPlusMembership) {
      setShowTourUpgradeModal(true);
      return;
    }
    router.push(buildEditUrl());
  };
  const handleCopyStudentLink = async () => {
    const targetTourId = activeTour?._id ?? tourIdParam;
    if (!targetTourId || typeof window === "undefined") return;
    const shareUrl = buildStudentTourUrl(targetTourId, {
      host: window.location.host,
      protocol: window.location.protocol,
      preview: false,
    });
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Student view link copied.");
    } catch {
      toast.error("Unable to copy link. Please copy from your browser URL.");
    }
  };

  const {
    handleSaveTour,
    hasUnsavedChanges,
    saveErrors,
    selectedTourJobsArray,
    setTourForm,
    tourForm,
    unitOptions,
    isSavingTour,
  } = useJobTourEditor({
    activeTour,
    buildEditUrl,
    isTeacherEditMode,
    isTourOwner,
    preservedUnitName,
    replaceRoute: (url) => router.replace(url),
    selectedTourJobs,
    setSelectedTourJobs,
    sourceAssignmentSocCodes,
    token,
  });

  const assignmentBannerOverrides = useMemo(() => {
    const overrides = {};
    if (isTeacherEditMode) {
      const liveHeading = tourForm.heading.trim();
      const liveAssignment = tourForm.assignment.trim();
      if (liveHeading) {
        overrides.assignmentUnitLabelOverride = liveHeading;
      }
      overrides.assignmentCopyOverride =
        liveAssignment || DEFAULT_JOB_TOUR_ASSIGNMENT;
      return overrides;
    }
    if (activeTour?.heading) {
      overrides.assignmentUnitLabelOverride = activeTour.heading;
    }
    if (activeTour?.assignment) {
      overrides.assignmentCopyOverride = activeTour.assignment;
    }
    if (viewMode === "student" && !activeTour) {
      const unitLabel = preservedUnitName
        ? `Jobs connected to the "${preservedUnitName}" lesson`
        : "Jobs your teacher wants you to explore first";
      overrides.assignmentUnitLabelOverride = unitLabel;
      overrides.assignmentCopyOverride =
        "Explore each job, note how interested you are, and be ready to explain your rating using the data shown here.";
    }
    return Object.keys(overrides).length ? overrides : null;
  }, [
    activeTour,
    isTeacherEditMode,
    preservedUnitName,
    tourForm.assignment,
    tourForm.heading,
    viewMode,
  ]);

  const assignmentHeaderActions = shouldShowTourActions ? (
    <>
      <button
        type="button"
        className={editorStyles.tourActionButton}
        onClick={handleTourActionClick}
      >
        <img
          src="/plus/plus.png"
          alt="GP+"
          className={editorStyles.tourActionIcon}
        />
        {tourActionLabel}
      </button>
      {Boolean(activeTour?._id ?? tourIdParam) && (
        <button
          type="button"
          className={editorStyles.tourActionButton}
          onClick={handleCopyStudentLink}
        >
          Copy student link
        </button>
      )}
    </>
  ) : null;

  const editorFields = isTeacherEditMode ? (
    <JobTourEditorFields
      value={tourForm}
      unitOptions={unitOptions}
      onChange={setTourForm}
      onSave={handleSaveTour}
      isSaving={isSavingTour}
      isSaved={!hasUnsavedChanges}
      validationErrors={saveErrors}
      selectedJobsCount={selectedTourJobsArray.length}
      showSaveButton={false}
    />
  ) : null;
  const mobileEditNote = isTeacherEditMode ? (
    <p className={styles.jobvizHeroMobileNote}>
      Student preview unavailable on mobile.
    </p>
  ) : null;
  const mobileHeroAssignment = shouldRenderAssignment ? (
    <div className={styles.jobvizHeroMobileAssignment}>
      {mobileEditNote}
      <AssignmentBanner
        variant="mobile"
        unitName={preservedUnitName}
        jobs={resolvedJobTitleAndSocCodePairs}
        assignmentParams={assignmentParams}
        onJobClick={handleAssignmentJobClick}
        mode={isTeacherEditMode ? "tour-editor" : "assignment"}
        headerActions={assignmentHeaderActions}
        allowShare={!isTourPreviewMode}
        markerLabelOverride={
          isTourPreviewMode ? "JobViz+ | TOUR PREVIEW" : undefined
        }
        {...(assignmentBannerOverrides ?? {})}
      />
    </div>
  ) : mobileEditNote;
  const desktopPreviewBanner = isTeacherEditMode ? (
    <div className={editorStyles.assignmentStudentPreviewBanner}>
      <span className={editorStyles.assignmentStudentPreviewLabel}>
        Student Preview
      </span>
      <p>
        This side dock shows the assignment as students will see it on desktop.
      </p>
    </div>
  ) : null;

  return (
    <JobTourEditorProvider
      isEditing={isTeacherEditMode}
      selectedJobs={selectedTourJobs}
      toggleJob={toggleTourJob}
      isSelected={isTourJobSelected}
      lastToggled={lastToggledSoc}
    >
      <Layout {...layoutProps}>
        <div id="jobviz-mobile-modal-anchor" />
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
              heroMode={isTeacherEditMode ? "edit" : "default"}
              heroFooter={
                isTeacherEditMode ? editorFields : mobileHeroAssignment
              }
            >
              <JobVizNotices
                tourLoadError={tourLoadState.error}
                teacherEditDenied={teacherEditDenied}
                showUnitPreviewAssignmentBanner={showUnitPreviewAssignmentBanner}
                isTourPreviewMode={isTourPreviewMode}
                isStudentLinkView={isStudentLinkView}
                previewLimit={JOBVIZ_PREVIEW_LIMIT}
                previewLockedCount={previewLockedCount}
              />
              {showIntroHeading && (
                <h2 className={styles.jobvizSectionHeading}>{sectionHeading}</h2>
              )}
              <h3 className={styles.jobvizSearchAppeal}>
                Explore the true diversity of career opportunities.
              </h3>

              <JobVizSearch
                assignmentParams={assignmentParams}
                extraQueryParams={preservedJobvizQueryParams}
              />
              <div id={JOBVIZ_BRACKET_SEARCH_ID} />
              <div className={styles.jobvizContextZone}>
                <div
                  className={styles.jobvizGridWrap}
                  id={JOBVIZ_CATEGORIES_ANCHOR_ID}
                >
                  <JobVizGridHeader
                    isShowingAssignmentScope={isShowingAssignmentScope}
                    isShowingSavedScope={isShowingSavedScope}
                    breadcrumbs={breadcrumbs}
                    outgoingViewingHeader={outgoingViewingHeader}
                    activeViewingHeader={activeViewingHeader}
                    isViewingHeaderTransitioning={isViewingHeaderTransitioning}
                    hierarchyHeadingId={JOBVIZ_HIERARCHY_HEADING_ID}
                  />
                  <JobVizFilterBar
                    isShowingSavedScope={isShowingSavedScope}
                    isShowingAssignmentScope={isShowingAssignmentScope}
                    hasAssignmentList={hasAssignmentList}
                    isTourPreviewMode={isTourPreviewMode}
                    isStudentMode={isStudentMode}
                    status={status}
                    sortOptionId={sortOptionId}
                    sortOptions={JOBVIZ_SORT_OPTIONS}
                    onSavedToggleClick={handleSavedToggleClick}
                    onAssignedToggleClick={handleAssignedToggleClick}
                    onBackToAssignmentClick={() => setShowAssignmentOnly(true)}
                    onSortChange={handleSortControlChange}
                  />
                  <JobVizGrid
                    items={renderedGridItems}
                    onItemClick={handleGridItemClick}
                    navigationHint={navigationHint}
                    onExitComplete={handleGridExitComplete}
                  />
                </div>
                <JobVizSourceAndUpsell
                  dataSourceUrl={JOBVIZ_DATA_SOURCE}
                  activeNodeBlsLink={activeNode?.BLS_link}
                  showGpPlusUpsell={showGpPlusUpsell}
                />
              </div>
            </JobVizLayout>
          </div>
          {shouldRenderAssignment && (
            <AssignmentBanner
              variant="desktop"
              unitName={preservedUnitName}
              jobs={resolvedJobTitleAndSocCodePairs}
              assignmentParams={assignmentParams}
              onJobClick={handleAssignmentJobClick}
              mode={isTeacherEditMode ? "tour-editor" : "assignment"}
              headerActions={assignmentHeaderActions}
              allowShare={!isTourPreviewMode}
              markerLabelOverride={
                isTourPreviewMode ? "JobViz+ | TOUR PREVIEW" : undefined
              }
              previewBanner={desktopPreviewBanner}
              {...(assignmentBannerOverrides ?? {})}
            />
          )}
        </div>
      </Layout>
      <JobVizOverlays
        showSavedJobsUpsell={showSavedJobsUpsell}
        showJobvizWelcome={showJobvizWelcome}
        showTourWelcome={showTourWelcome}
        onOpenLogin={() => {
          closeSavedJobsUpsell();
          setIsLoginModalDisplayed(true);
        }}
        onCloseSavedJobsUpsell={closeSavedJobsUpsell}
        onDismissWelcomeForever={() =>
          handleDismissWelcome(
            JOBVIZ_WELCOME_DISMISSED_KEY,
            setShowJobvizWelcome,
            true
          )
        }
        onDismissWelcomeOnce={() =>
          handleDismissWelcome(
            JOBVIZ_WELCOME_DISMISSED_KEY,
            setShowJobvizWelcome,
            false
          )
        }
        onDismissTourWelcomeForever={() =>
          handleDismissWelcome(
            JOBVIZ_TOUR_WELCOME_DISMISSED_KEY,
            setShowTourWelcome,
            true
          )
        }
        onDismissTourWelcomeOnce={() =>
          handleDismissWelcome(
            JOBVIZ_TOUR_WELCOME_DISMISSED_KEY,
            setShowTourWelcome,
            false
          )
        }
      />
      <JobTourUpgradeModal
        show={showTourUpgradeModal}
        onClose={() => setShowTourUpgradeModal(false)}
      />
    </JobTourEditorProvider>
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
  const gpPlusCookie = req?.cookies?.["isGpPlusMember"];
  const isGpPlusMember =
    typeof gpPlusCookie === "string" ? gpPlusCookie === "true" : null;

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
      isGpPlusMember,
    },
  };
};

export default JobVizSearchResults;
