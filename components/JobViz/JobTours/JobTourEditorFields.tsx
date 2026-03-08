import React, { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "react-hot-toast";
import styles from "./JobTourEditorFields.module.scss";
import { LucideIcon } from "../LucideIcon";
import {
  CLASS_SUBJECT_OPTIONS,
  GRADE_LEVEL_OPTIONS,
} from "./jobTourConstants";
import { buildStudentTourUrl } from "./tourAccess";
import type { JobTourVisibility } from "./jobTourTypes";

export interface JobTourEditorFormState {
  heading: string;
  whoCanSee: JobTourVisibility;
  classSubject: string;
  classSubjectCustom: string;
  gradeLevel: string;
  tags: string;
  gpUnitsAssociated: string[];
  explanation: string;
  assignment: string;
}

export interface JobTourEditorFieldsProps {
  value: JobTourEditorFormState;
  unitOptions: { id: string; title: string }[];
  onChange: (next: JobTourEditorFormState) => void;
  onSave: () => void | Promise<boolean | void>;
  isSaving?: boolean;
  validationErrors?: string[];
  saveAttemptedAt?: number;
  tourId?: string | null;
  selectedJobsCount: number;
  isSaved?: boolean;
  showSaveButton?: boolean;
}

const JobTourEditorFields: React.FC<JobTourEditorFieldsProps> = ({
  value,
  unitOptions,
  onChange,
  onSave,
  isSaving = false,
  validationErrors = [],
  saveAttemptedAt = 0,
  tourId = null,
  selectedJobsCount,
  isSaved = false,
  showSaveButton = true,
}) => {
  const hasErrors = validationErrors.length > 0;
  const showCustomSubject = value.classSubject === "Other";
  const requiresClassDetails = value.whoCanSee === "everyone";
  const [isUnitsOpen, setIsUnitsOpen] = useState(false);
  const [showScrollTopHelper, setShowScrollTopHelper] = useState(false);
  const [floatingSaveContext, setFloatingSaveContext] = useState<string | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [didCopyShareLink, setDidCopyShareLink] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const formRootRef = React.useRef<HTMLDivElement | null>(null);
  const formTopSentinelRef = React.useRef<HTMLDivElement | null>(null);
  const selectedUnits = useMemo(
    () =>
      unitOptions.filter((unit) => value.gpUnitsAssociated.includes(unit.id)),
    [unitOptions, value.gpUnitsAssociated]
  );

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  React.useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const syncModalState = () => {
      setIsModalOpen(document.body.classList.contains("modal-open"));
    };
    syncModalState();
    const observer = new MutationObserver(syncModalState);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const sentinel = formTopSentinelRef.current;
    if (!sentinel) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowScrollTopHelper(!entry.isIntersecting);
      },
      {
        root: null,
        threshold: 0,
        rootMargin: "-80px 0px 0px 0px",
      }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const handleScrollToFormTop = React.useCallback(() => {
    if (typeof window === "undefined" || !formRootRef.current) return;
    const navOffsetRaw = getComputedStyle(document.documentElement)
      .getPropertyValue("--portal-nav-offset")
      .trim();
    const navOffset = Number.parseFloat(navOffsetRaw) || 0;
    const top = Math.max(
      0,
      window.scrollY + formRootRef.current.getBoundingClientRect().top - navOffset - 12
    );
    window.scrollTo({ top, behavior: "smooth" });
  }, []);

  const getFieldIdForError = React.useCallback((error: string) => {
    const value = error.toLowerCase();
    if (value.includes("title")) return "tour-title";
    if (value.includes("job")) return "tour-title";
    if (value.includes("subject")) return "tour-subject";
    if (value.includes("grade")) return "tour-grade";
    if (value.includes("assignment")) return "tour-assignment";
    if (value.includes("context") || value.includes("explanation")) return "tour-context";
    if (value.includes("who can see") || value.includes("visibility")) return "tour-visibility";
    return null;
  }, []);

  const scrollToEditingArea = React.useCallback(
    (targetFieldId?: string | null) => {
      handleScrollToFormTop();
      if (typeof window === "undefined" || !targetFieldId) return;
      window.setTimeout(() => {
        const target = document.getElementById(targetFieldId);
        if (!target) return;
        target.scrollIntoView({ behavior: "smooth", block: "center" });
        if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) {
          target.focus({ preventScroll: true });
        }
      }, 220);
    },
    [handleScrollToFormTop]
  );

  React.useEffect(() => {
    if (!saveAttemptedAt) return;
    if (!validationErrors.length) {
      setFloatingSaveContext(null);
      return;
    }
    const topErrors = validationErrors.slice(0, 2).join(" · ");
    setFloatingSaveContext(topErrors);
    const targetFieldId = getFieldIdForError(validationErrors[0]);
    scrollToEditingArea(targetFieldId);
  }, [getFieldIdForError, saveAttemptedAt, scrollToEditingArea, validationErrors]);

  const handleSaveClick = React.useCallback(() => {
    void Promise.resolve(onSave());
  }, [onSave]);

  const shareUrl = React.useMemo(() => {
    if (!tourId) return null;
    const rawUrl =
      typeof window === "undefined"
        ? buildStudentTourUrl(tourId, { preview: false })
        : buildStudentTourUrl(tourId, {
      preview: false,
      host: window.location.host,
      protocol: window.location.protocol,
    });
    if (typeof window === "undefined") return rawUrl;
    try {
      const parsed = new URL(rawUrl, window.location.origin);
      parsed.searchParams.delete("preview");
      return parsed.toString();
    } catch {
      return rawUrl;
    }
  }, [tourId]);

  const handleCopyShareLink = React.useCallback(async () => {
    if (!shareUrl || typeof navigator === "undefined") return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setDidCopyShareLink(true);
      toast.success("Link copied to clipboard.");
      window.setTimeout(() => setDidCopyShareLink(false), 1200);
    } catch {
      toast.error("Could not copy link.");
    }
  }, [shareUrl]);

  const handleOpenStudentView = React.useCallback(() => {
    if (!shareUrl || typeof window === "undefined") return;
    window.open(shareUrl, "_blank", "noopener,noreferrer");
  }, [shareUrl]);

  const hasAttemptedSave = saveAttemptedAt > 0;
  const hasBlockingErrors = hasAttemptedSave && hasErrors;
  const saveButtonVariant = isSaving
    ? "saving"
    : hasBlockingErrors
      ? "error"
      : isSaved
        ? "saved"
        : "dirty";
  const saveButtonLabel = isSaving
    ? "Saving..."
    : hasBlockingErrors
      ? "Fix to Save"
      : isSaved
        ? "Saved"
        : "Click to Save";

  return (
    <div className={styles.tourEditorFields} ref={formRootRef}>
      <div ref={formTopSentinelRef} aria-hidden="true" />
      <div className={styles.tourEditorMeta}>
        <section className={styles.tourEditorSection}>
          <div className={styles.tourEditorSectionHeader}>
            <LucideIcon name="PencilLine" className={styles.tourEditorSectionIcon} />
            <span>Student-facing fields</span>
          </div>
          <div className={styles.tourEditorSectionFields}>
            <div className={styles.tourEditorField}>
              <label htmlFor="tour-title">
                Title <span className={styles.tourEditorRequired}>*</span>
              </label>
              <input
                id="tour-title"
                type="text"
                placeholder="What is this job tour?"
                value={value.heading}
                onChange={(event) =>
                  onChange({ ...value, heading: event.target.value })
                }
              />
            </div>
            <div className={styles.tourEditorFieldFull}>
              <label htmlFor="tour-assignment">
                Assignment{" "}
                {requiresClassDetails && (
                  <span className={styles.tourEditorRequired}>*</span>
                )}
              </label>
              <textarea
                id="tour-assignment"
                placeholder="Describe for students what you want them to do"
                value={value.assignment}
                onChange={(event) =>
                  onChange({ ...value, assignment: event.target.value })
                }
              />
            </div>
          </div>
        </section>

        <section className={styles.tourEditorSection}>
          <div className={styles.tourEditorSectionHeader}>
            <LucideIcon
              name="GraduationCap"
              className={styles.tourEditorSectionIcon}
            />
            <span>Details and classroom integration</span>
          </div>
          <div className={styles.tourEditorSectionFields}>
            <div className={styles.tourEditorField}>
              <label htmlFor="tour-subject">
                Class subject{" "}
                {requiresClassDetails && (
                  <span className={styles.tourEditorRequired}>*</span>
                )}
              </label>
              <select
                id="tour-subject"
                value={value.classSubject}
                onChange={(event) =>
                  onChange({ ...value, classSubject: event.target.value })
                }
              >
                <option value="">Select a subject</option>
                {CLASS_SUBJECT_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
                <option value="Other">Other</option>
              </select>
              {showCustomSubject && (
                <input
                  type="text"
                  placeholder="Custom subject"
                  value={value.classSubjectCustom}
                  onChange={(event) =>
                    onChange({ ...value, classSubjectCustom: event.target.value })
                  }
                />
              )}
            </div>
            <div className={styles.tourEditorField}>
              <label htmlFor="tour-grade">
                Grade level{" "}
                {requiresClassDetails && (
                  <span className={styles.tourEditorRequired}>*</span>
                )}
              </label>
              <select
                id="tour-grade"
                value={value.gradeLevel}
                onChange={(event) =>
                  onChange({ ...value, gradeLevel: event.target.value })
                }
              >
                <option value="">Select grade band</option>
                {GRADE_LEVEL_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.tourEditorFieldFull}>
              <label htmlFor="tour-context">
                Classroom Context{" "}
                {requiresClassDetails && (
                  <span className={styles.tourEditorRequired}>*</span>
                )}
              </label>
              <textarea
                id="tour-context"
                placeholder="(Optional) When in the school year or how might this be useful to implement?"
                value={value.explanation}
                onChange={(event) =>
                  onChange({ ...value, explanation: event.target.value })
                }
              />
            </div>
            <div className={styles.tourEditorFieldFull}>
              <label htmlFor="tour-tags">Tags</label>
              <input
                id="tour-tags"
                type="text"
                placeholder="Add tags, separated by commas"
                value={value.tags}
                onChange={(event) =>
                  onChange({ ...value, tags: event.target.value })
                }
              />
            </div>
          </div>
        </section>

        <section className={styles.tourEditorSection}>
          <div className={styles.tourEditorSectionHeader}>
            <LucideIcon name="Link2" className={styles.tourEditorSectionIcon} />
            <span>GP Unit Connections</span>
          </div>
          <p className={styles.tourEditorSectionSubhead}>
            Link this custom tour to one of our units
          </p>
          <div className={styles.tourEditorSectionFields}>
            <div className={styles.tourEditorFieldFull}>
              <label>Associated GP Units</label>
              {unitOptions.length ? (
                <>
                  <div className={styles.tourEditorDropdown}>
                    <button
                      type="button"
                      className={styles.tourEditorDropdownButton}
                      onClick={() => setIsUnitsOpen((prev) => !prev)}
                      aria-expanded={isUnitsOpen}
                    >
                      {selectedUnits.length
                        ? `${selectedUnits.length} unit${
                            selectedUnits.length === 1 ? "" : "s"
                          } selected`
                        : "Select GP units"}
                      <span className={styles.tourEditorDropdownCaret} />
                    </button>
                    {isUnitsOpen && (
                      <div className={styles.tourEditorDropdownMenu}>
                        {unitOptions.map((unit) => (
                          <label
                            key={unit.id}
                            className={styles.tourEditorUnitOption}
                          >
                            <input
                              type="checkbox"
                              checked={value.gpUnitsAssociated.includes(unit.id)}
                              onChange={(event) => {
                                const next = event.target.checked
                                  ? [...value.gpUnitsAssociated, unit.id]
                                  : value.gpUnitsAssociated.filter(
                                      (id) => id !== unit.id
                                    );
                                onChange({ ...value, gpUnitsAssociated: next });
                              }}
                            />
                            <span>{unit.title}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                  {selectedUnits.length ? (
                    <div className={styles.tourEditorSelectedUnits}>
                      {selectedUnits.map((unit) => (
                        <span
                          key={unit.id}
                          className={styles.tourEditorSelectedUnit}
                        >
                          {unit.title}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </>
              ) : (
                <p className={styles.tourEditorHelper}>
                  Unit list is loading. You can still save your tour now.
                </p>
              )}
            </div>
          </div>
        </section>

        <section className={styles.tourEditorSection}>
          <div className={styles.tourEditorSectionHeader}>
            <LucideIcon name="Share2" className={styles.tourEditorSectionIcon} />
            <span>Community Sharing</span>
          </div>
          <p className={styles.tourEditorSectionSubhead}>
            Choose &quot;Everyone&quot; to make this tour discoverable by other
            teachers in search
          </p>
          <div className={styles.tourEditorSectionFields}>
            <div className={styles.tourEditorField}>
              <label htmlFor="tour-visibility">Who can see</label>
              <select
                id="tour-visibility"
                value={value.whoCanSee}
                onChange={(event) =>
                  onChange({
                    ...value,
                    whoCanSee: event.target.value as JobTourVisibility,
                  })
                }
              >
                <option value="me">Only me</option>
                <option value="just-teachers">Teachers only</option>
                <option value="everyone">Everyone</option>
              </select>
            </div>
          </div>
        </section>

        <p className={styles.tourEditorRequiredNote}>
          <span className={styles.tourEditorRequired}>*</span> Required fields.
          Classroom details are required only when visibility is &quot;Everyone.&quot;
        </p>
      </div>
      <div className={styles.tourEditorFooter}>
        <div className={styles.tourEditorStatus}>
          <span>{selectedJobsCount} jobs selected</span>
          {hasErrors && (
            <span className={styles.tourEditorError}>
              {validationErrors.join(" · ")}
            </span>
          )}
        </div>
        {showSaveButton && (
          <button
            type="button"
            className={styles.tourEditorSaveButton}
            onClick={onSave}
            disabled={isSaving || isSaved}
            data-variant={isSaved ? "saved" : "default"}
          >
            {isSaving ? "Saving..." : isSaved ? "Saved" : "Save tour"}
          </button>
        )}
      </div>
      {isClient && !isModalOpen && !showSaveButton
        ? createPortal(
            <div className={styles.tourEditorFloatingActions}>
              {showScrollTopHelper ? (
                <button
                  type="button"
                  className={styles.tourEditorScrollTop}
                  onClick={handleScrollToFormTop}
                >
                  <LucideIcon name="ArrowUp" aria-hidden="true" />
                  <span>Scroll to top</span>
                </button>
              ) : null}
              {isSaved && shareUrl ? (
                <button
                  type="button"
                  className={styles.tourEditorFloatingShare}
                  onClick={() => setIsShareModalOpen(true)}
                >
                  <LucideIcon name="Share2" aria-hidden="true" />
                  <span>Share</span>
                </button>
              ) : null}
              <button
                type="button"
                className={styles.tourEditorFloatingSave}
                onClick={handleSaveClick}
                disabled={isSaving}
                data-variant={saveButtonVariant}
              >
                {saveButtonLabel}
              </button>
              {floatingSaveContext ? (
                <p className={styles.tourEditorFloatingContext}>{floatingSaveContext}</p>
              ) : null}
            </div>,
            document.body
          )
        : null}
      {isClient && isShareModalOpen
        ? createPortal(
            <div
              className={styles.tourEditorShareOverlay}
              role="dialog"
              aria-modal="true"
              aria-labelledby="tour-editor-share-title"
            >
              <div className={styles.tourEditorShareCard}>
                <button
                  type="button"
                  className={styles.tourEditorShareClose}
                  onClick={() => setIsShareModalOpen(false)}
                  aria-label="Close share dialog"
                >
                  <LucideIcon name="X" />
                </button>
                <h3 id="tour-editor-share-title">Share this career tour!</h3>
                <p>
                  Recipients will not need to log in to open the tour.
                </p>
                <div className={styles.tourEditorShareActions}>
                  <button
                    type="button"
                    className={styles.tourEditorShareButton}
                    data-copied={didCopyShareLink ? "true" : "false"}
                    onClick={() => {
                      void handleCopyShareLink();
                    }}
                  >
                    <LucideIcon name="Copy" aria-hidden="true" />
                    Copy Link to Clipboard
                  </button>
                  <button
                    type="button"
                    className={styles.tourEditorShareButton}
                    onClick={handleOpenStudentView}
                  >
                    <LucideIcon name="SquareArrowOutUpRight" aria-hidden="true" />
                    Open Student View in New Tab
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </div>
  );
};

export default JobTourEditorFields;
