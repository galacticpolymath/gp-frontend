import React from 'react';
import { MonitorPlay } from 'lucide-react';
import LessonsCarousel from '../../../LessonSection/Preview/LessonsCarousel';
import styles from '../UnitMaterials.module.css';

type TFeaturedMediaPreviewProps = {
  hasFeaturedMedia: boolean;
  activeLessonFeaturedMedia: any[];
};

const FeaturedMediaPreview: React.FC<TFeaturedMediaPreviewProps> = ({
  hasFeaturedMedia,
  activeLessonFeaturedMedia,
}) => {
  return (
    <article className={styles.lessonPreviewItem}>
      <header className={styles.lessonPreviewHeader}>
        <h3 className={styles.lessonCardHeading}>
          <MonitorPlay size={16} aria-hidden="true" />
          <span>Featured Media</span>
        </h3>
      </header>
      {hasFeaturedMedia ? (
        <div className={`${styles.previewCarousel} ${styles.featuredMediaViewport}`}>
          <LessonsCarousel mediaItems={[...activeLessonFeaturedMedia]} />
        </div>
      ) : (
        <p className={styles.unitMutedText}>No featured media is linked to this lesson yet.</p>
      )}
    </article>
  );
};

export default FeaturedMediaPreview;
