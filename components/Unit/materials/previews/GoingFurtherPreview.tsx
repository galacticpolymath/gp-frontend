import React from 'react';
import { BowArrow, SquareArrowOutUpRight } from 'lucide-react';
import styles from '../UnitMaterials.module.css';

type TGoingFurtherPreviewProps = {
  hasGoingFurther: boolean;
  activeLessonGoingFurther: any[];
};

const GoingFurtherPreview: React.FC<TGoingFurtherPreviewProps> = ({
  hasGoingFurther,
  activeLessonGoingFurther,
}) => {
  return (
    <article className={`${styles.lessonPreviewItem} ${styles.goingFurtherPreviewItem}`}>
      <header className={styles.lessonPreviewHeader}>
        <h3 className={styles.lessonCardHeading}>
          <BowArrow size={16} aria-hidden="true" />
          <span>Going Further</span>
        </h3>
      </header>
      <p className={styles.goingFurtherSubheading}>
        Resources to expand this learning experience
      </p>
      {hasGoingFurther ? (
        <div className={styles.goingFurtherList}>
          {activeLessonGoingFurther.map((entry, idx) => {
            const title = entry.itemTitle?.trim() || `Resource ${idx + 1}`;
            const description = entry.itemDescription?.trim();
            const href = entry.itemLink?.trim() ?? '';
            const canOpen = href.length > 0;

            return (
              <article key={`${title}-${idx}`} className={styles.goingFurtherItem}>
                {canOpen ? (
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.goingFurtherLink}
                  >
                    <span>{title}</span>
                    <SquareArrowOutUpRight size={13} aria-hidden="true" />
                  </a>
                ) : (
                  <strong>{title}</strong>
                )}
                {description ? <p>{description}</p> : null}
              </article>
            );
          })}
        </div>
      ) : (
        <p className={styles.unitMutedText}>Going Further links will appear here once added.</p>
      )}
    </article>
  );
};

export default GoingFurtherPreview;
