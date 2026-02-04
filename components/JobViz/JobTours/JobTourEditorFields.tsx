import React from "react";
import styles from "../../../styles/jobvizBurst.module.scss";
import {
  CLASS_SUBJECT_OPTIONS,
  GRADE_LEVEL_OPTIONS,
} from "./jobTourConstants";
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
  onSave: () => void;
  isSaving?: boolean;
  validationErrors?: string[];
  selectedJobsCount: number;
}

const JobTourEditorFields: React.FC<JobTourEditorFieldsProps> = ({
  value,
  unitOptions,
  onChange,
  onSave,
  isSaving = false,
  validationErrors = [],
  selectedJobsCount,
}) => {
  const hasErrors = validationErrors.length > 0;
  const showCustomSubject = value.classSubject === "Other";
  return (
    <div className={styles.tourEditorFields}>
      <div className={styles.tourEditorMeta}>
        <div className={styles.tourEditorField}>
          <label htmlFor="tour-title">Title</label>
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
        <div className={styles.tourEditorField}>
          <label htmlFor="tour-subject">Class subject</label>
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
          <label htmlFor="tour-grade">Grade level</label>
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
          <label htmlFor="tour-context">Classroom Context</label>
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
        <div className={styles.tourEditorFieldFull}>
          <label htmlFor="tour-assignment">Assignment</label>
          <textarea
            id="tour-assignment"
            placeholder="Describe for students what you want them to do"
            value={value.assignment}
            onChange={(event) =>
              onChange({ ...value, assignment: event.target.value })
            }
          />
        </div>
        <div className={styles.tourEditorFieldFull}>
          <label>GP units associated</label>
          <div className={styles.tourEditorUnits}>
            {unitOptions.length ? (
              unitOptions.map((unit) => (
                <label key={unit.id} className={styles.tourEditorUnitOption}>
                  <input
                    type="checkbox"
                    checked={value.gpUnitsAssociated.includes(unit.id)}
                    onChange={(event) => {
                      const next = event.target.checked
                        ? [...value.gpUnitsAssociated, unit.id]
                        : value.gpUnitsAssociated.filter((id) => id !== unit.id);
                      onChange({ ...value, gpUnitsAssociated: next });
                    }}
                  />
                  <span>{unit.title}</span>
                </label>
              ))
            ) : (
              <p className={styles.tourEditorHelper}>
                Unit list is loading. You can still save your tour now.
              </p>
            )}
          </div>
        </div>
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
        <button
          type="button"
          className={styles.tourEditorSaveButton}
          onClick={onSave}
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save tour"}
        </button>
      </div>
    </div>
  );
};

export default JobTourEditorFields;
