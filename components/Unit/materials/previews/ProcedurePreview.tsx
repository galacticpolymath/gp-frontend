import React from 'react';
import {
  Apple,
  BookA,
  Clock3,
  Lightbulb,
  Printer,
  Split,
  SquareArrowOutUpRight,
} from 'lucide-react';
import RichText from '../../../RichText';
import ChunkGraph from '../../../LessonSection/TeachIt/ChunkGraph';
import styles from '../../UnitPage.module.css';
import { IItemForUI, INewUnitLesson } from '../../../../backend/models/Unit/types/teachingMaterials';

type TProcedurePreviewProps = {
  activeLesson: INewUnitLesson<IItemForUI> | null;
  chunkDurations: number[];
  onPrint: () => void;
  onOpenInNewTab: () => void;
  showLinkOutAction?: boolean;
  showPanelHeading?: boolean;
  panelClassName?: string;
};

const getStepDuration = (step: {
  StepDur?: number | string | null;
  StepDuration?: number | string | null;
  stepDur?: number | string | null;
}) => {
  const candidates = [step.StepDur, step.StepDuration, step.stepDur];
  for (const candidate of candidates) {
    if (typeof candidate === 'number' && Number.isFinite(candidate) && candidate > 0) {
      return candidate;
    }
    if (typeof candidate === 'string') {
      const parsed = Number.parseFloat(candidate);
      if (!Number.isNaN(parsed) && parsed > 0) {
        return parsed;
      }
    }
  }
  return null;
};

const ProcedurePreview: React.FC<TProcedurePreviewProps> = ({
  activeLesson,
  chunkDurations,
  onPrint,
  onOpenInNewTab,
  showLinkOutAction = true,
  showPanelHeading = true,
  panelClassName,
}) => {
  const prep = activeLesson?.lsnPrep;
  const prepTitle = prep?.prepTitle;
  const prepDur = prep?.prepDur;
  const prepQuickDescription = prep?.prepQuickDescription;
  const prepDetails = prep?.prepDetails;
  const prepTeachingTips = prep?.prepTeachingTips;
  const prepVariantNotes = prep?.prepVariantNotes;
  const hasPrepContent = Boolean(
    prep &&
      (prepTitle ||
        prepDur != null ||
        prepQuickDescription ||
        prepDetails ||
        prepTeachingTips ||
        prepVariantNotes)
  );

  return (
    <div
      className={
        panelClassName
          ? `${styles.lessonProcedureInPreview} ${panelClassName}`
          : styles.lessonProcedureInPreview
      }
    >
      <div className={styles.lessonProcedureHeader}>
        {(showPanelHeading || showLinkOutAction) && (
          <div className={styles.lessonProcedureHeaderTop}>
            {showPanelHeading ? (
              <h3 className={styles.lessonCardHeading}>
                <Apple size={16} aria-hidden="true" />
                <span>Lesson Procedure</span>
              </h3>
            ) : (
              <span />
            )}
            {showLinkOutAction && (
              <div className={styles.lessonPreviewHeaderActions}>
                <button
                  type="button"
                  className={styles.procedureLinkOutBtn}
                  onClick={onPrint}
                >
                  <span>Print</span>
                  <Printer size={13} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className={styles.procedureLinkOutBtn}
                  onClick={onOpenInNewTab}
                >
                  <span>Open in New Tab</span>
                  <SquareArrowOutUpRight size={13} aria-hidden="true" />
                </button>
              </div>
            )}
          </div>
        )}
        {showPanelHeading && (
          <span>Chunk-by-chunk guidance with vocab and teacher notes.</span>
        )}
      </div>
      <div className={styles.lessonProcedureContent}>
        {hasPrepContent && (
          <section className={styles.lessonPrepSection}>
            <div className={styles.lessonPrepHeader}>
              <Clock3 size={16} aria-hidden="true" />
              {prepDur != null && (
                <span className={styles.lessonPrepDuration}>
                  {prepDur} min
                </span>
              )}
              <h4>{prepTitle ?? 'Prep'}</h4>
            </div>
            {prepQuickDescription && (
              <div className={styles.lessonStepQuickDescription}>
                <RichText content={prepQuickDescription} />
              </div>
            )}
            {prepDetails && (
              <div className={styles.lessonStepDetails}>
                <RichText content={prepDetails} />
              </div>
            )}
            <aside className={styles.lessonPrepAside}>
              {!!prepTeachingTips && (
                <div
                  className={`${styles.stepInfoBlock} ${styles.stepInfoBlockTeachingTips}`}
                >
                  <h6 className={styles.stepInfoHeading}>
                    <Lightbulb size={14} aria-hidden="true" />
                    <span>Teaching tips</span>
                  </h6>
                  <RichText content={prepTeachingTips} />
                </div>
              )}
              {!!prepVariantNotes && (
                <div
                  className={`${styles.stepInfoBlock} ${styles.stepInfoBlockVariantNotes}`}
                >
                  <h6 className={styles.stepInfoHeading}>
                    <Split size={14} aria-hidden="true" />
                    <span>Variant notes</span>
                  </h6>
                  <RichText content={prepVariantNotes} />
                </div>
              )}
            </aside>
          </section>
        )}
        {activeLesson?.chunks?.map((chunk, index) => (
          <article
            key={`${chunk.chunkTitle}-${index}`}
            className={styles.lessonChunk}
          >
            <div className={styles.lessonChunkTimeline}>
              <div
                className={`${styles.lessonChunkHeader} ${
                  chunkDurations.length
                    ? styles.lessonChunkHeaderOverGraph
                    : ''
                }`}
              >
                {typeof chunk.chunkDur === 'number' ? (
                  <span className={styles.lessonChunkDuration}>
                    <Clock3 size={12} aria-hidden="true" />
                    <span>{chunk.chunkDur} min:</span>
                  </span>
                ) : null}
                <h5 className={styles.lessonChunkTitle}>
                  {chunk.chunkTitle ?? 'Lesson segment'}
                </h5>
              </div>
              {!!chunkDurations.length && (
                <ChunkGraph
                  className={styles.lessonChunkGraph}
                  durList={chunkDurations}
                  chunkNum={index}
                />
              )}
            </div>
            {chunk.steps?.map((step, idx) => {
              const rawStep = (
                step as { Step?: number | string | null }
              ).Step;
              const stepNumber =
                typeof rawStep === 'number'
                  ? rawStep
                  : typeof rawStep === 'string'
                  ? Number.parseInt(rawStep.replace(/[^\d-]/g, ''), 10)
                  : Number.NaN;
              const safeStepNumber =
                Number.isFinite(stepNumber) && stepNumber > 0
                  ? stepNumber
                  : idx + 1;
              const stepDuration = getStepDuration(
                step as {
                  StepDur?: number | string | null;
                  StepDuration?: number | string | null;
                  stepDur?: number | string | null;
                }
              );
              const hasStepAsideContent = Boolean(
                step.Vocab || step.TeachingTips || step.VariantNotes
              );

              return (
                <div
                  key={`${step.StepTitle}-${idx}`}
                  className={`${styles.lessonStep} ${
                    hasStepAsideContent
                      ? styles.lessonStepWithAside
                      : styles.lessonStepFullWidth
                  }`}
                >
                  <div className={styles.lessonStepMain}>
                    <div className={styles.lessonStepTitleRow}>
                      <strong>
                        {step.StepTitle
                          ? `${safeStepNumber}. ${step.StepTitle}`
                          : `${safeStepNumber}.`}
                      </strong>
                      {stepDuration != null && (
                        <span className={styles.lessonStepDuration}>
                          {stepDuration} min
                        </span>
                      )}
                    </div>
                    {step.StepQuickDescription && (
                      <div className={styles.lessonStepQuickDescription}>
                        <RichText content={step.StepQuickDescription} />
                      </div>
                    )}
                    {step.StepDetails && (
                      <div className={styles.lessonStepDetails}>
                        <RichText content={step.StepDetails} />
                      </div>
                    )}
                  </div>
                  {hasStepAsideContent && (
                    <aside className={styles.lessonStepAside}>
                      {!!step.Vocab && (
                        <div className={styles.stepInfoBlock}>
                          <h6 className={styles.stepInfoHeading}>
                            <BookA size={14} aria-hidden="true" />
                            <span>Vocabulary</span>
                          </h6>
                          <RichText content={step.Vocab} />
                        </div>
                      )}
                      {!!step.TeachingTips && (
                        <div
                          className={`${styles.stepInfoBlock} ${styles.stepInfoBlockTeachingTips}`}
                        >
                          <h6 className={styles.stepInfoHeading}>
                            <Lightbulb size={14} aria-hidden="true" />
                            <span>Teaching tips</span>
                          </h6>
                          <RichText content={step.TeachingTips} />
                        </div>
                      )}
                      {!!step.VariantNotes && (
                        <div
                          className={`${styles.stepInfoBlock} ${styles.stepInfoBlockVariantNotes}`}
                        >
                          <h6 className={styles.stepInfoHeading}>
                            <Split size={14} aria-hidden="true" />
                            <span>Variant notes</span>
                          </h6>
                          <RichText content={step.VariantNotes} />
                        </div>
                      )}
                    </aside>
                  )}
                </div>
              );
            })}
          </article>
        ))}
        {!activeLesson?.chunks?.length && (
          <p className={styles.unitMutedText}>
            Detailed steps will appear here once added.
          </p>
        )}
        <p className={styles.procedureEndMarker}>End</p>
      </div>
    </div>
  );
};

export default ProcedurePreview;
