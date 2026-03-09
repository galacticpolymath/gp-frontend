import React from 'react';
import Image from 'next/image';
import { BrainCog } from 'lucide-react';
import RichText from '../../RichText';
import styles from './UnitMaterials.module.css';
import { IItemForUI, INewUnitLesson } from '../../../backend/models/Unit/types/teachingMaterials';

type TLessonSummaryCardProps = {
  activeLesson: INewUnitLesson<IItemForUI>;
  activeLessonIndex: number;
  lessonTileFallbackSrc: string;
  getLessonIdentifier: (lesson: INewUnitLesson<IItemForUI>, index: number) => number;
  isAssessmentLesson: (lesson: INewUnitLesson<IItemForUI>, index: number) => boolean;
  setActiveLessonPreviewMode: (mode: 'procedure') => void;
  onTagSearchClick: (tag: string) => void;
  onShare: () => void;
};

const LessonSummaryCard: React.FC<TLessonSummaryCardProps> = ({
  activeLesson,
  activeLessonIndex,
  lessonTileFallbackSrc,
  getLessonIdentifier,
  isAssessmentLesson,
  setActiveLessonPreviewMode,
  onTagSearchClick,
  onShare,
}) => {
  return (
    <div className={styles.lessonSummaryCard}>
      <div className={styles.lessonSummaryMain}>
        {!isAssessmentLesson(activeLesson, activeLessonIndex) && (
          <div className={styles.lessonEyebrowRow}>
            <p className={styles.lessonEyebrow}>
              Lesson {getLessonIdentifier(activeLesson, activeLessonIndex)}
            </p>
            {typeof activeLesson.lsnDur === 'number' && (
              <button
                type="button"
                className={styles.lessonDurationPill}
                onClick={() => setActiveLessonPreviewMode('procedure')}
                aria-label="Open lesson procedure preview"
              >
                <i className="bi bi-clock-history" aria-hidden="true" />
                {activeLesson.lsnDur} min
              </button>
            )}
          </div>
        )}
        <div className={styles.lessonTitleMarkdown}>
          <RichText content={activeLesson.title ?? 'Untitled lesson'} />
        </div>
        {activeLesson.lsnPreface && (
          <RichText
            className={styles.lessonPreface}
            content={activeLesson.lsnPreface}
          />
        )}
        {!!activeLesson.learningObj?.length && (
          <div className={styles.lessonObjectives}>
            <h4 className={styles.lessonObjectivesLead}>
              <BrainCog size={16} aria-hidden="true" />
              Students will be able to:
            </h4>
            <ul>
              {activeLesson.learningObj.map((item, idx) => (
                <li key={`${item}-${idx}`}>
                  <RichText content={item} />
                </li>
              ))}
            </ul>
          </div>
        )}
        {!!(activeLesson.lsnTags ?? activeLesson.tags ?? []).length && (
          <div className={styles.lessonTileTags}>
            {(activeLesson.lsnTags ?? activeLesson.tags ?? []).map((tag, tagIndex) => (
              <span key={`${tag}-${tagIndex}`} className={styles.lessonTileTagWrap}>
                <button
                  type="button"
                  className={styles.lessonTileTag}
                  title="Search for related resources"
                  aria-label={`Search for related resources: ${tag}`}
                  onClick={() => onTagSearchClick(tag)}
                >
                  {tag}
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
      <div className={styles.lessonSummaryMeta}>
        <div className={styles.lessonTileMediaLarge} aria-hidden="true">
          <Image
            src={activeLesson.tile || lessonTileFallbackSrc}
            alt={`${activeLesson.title ?? 'Lesson'} tile`}
            width={180}
            height={180}
          />
        </div>
        {activeLesson.status &&
          ['beta', 'upcoming'].includes(activeLesson.status.toLowerCase()) && (
            <span
              className={`${styles.lessonStatusPill} ${
                activeLesson.status.toLowerCase() === 'beta'
                  ? styles.lessonStatusPillBeta
                  : styles.lessonStatusPillUpcoming
              }`}
            >
              {activeLesson.status}
            </span>
          )}
        <button
          type="button"
          className={styles.lessonSummaryShareAction}
          onClick={onShare}
        >
          <i className="bi bi-share" aria-hidden="true" />
          Share
        </button>
      </div>
    </div>
  );
};

export default LessonSummaryCard;
