/* eslint-disable no-console */
/* eslint-disable quotes */
import { getMediaComponent } from './utils';

import styles from './index.module.scss';

const LessonSlide = ({
  type,
  title,
  lessonRelevance,
  by,
  byLink,
  mainLink,
}) => {
  return (
    <div className='bg-white autoCarouselItem rounded p-3' style={{ 'width': '100%' }}>
      <div>
        {getMediaComponent({ type, mainLink })}
        <div className={`${styles.SlideBody}`}>
          <h5>{title}</h5>
          <p>{lessonRelevance}</p>
          <span className="text-left">by{' '}
            <a
              href={byLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              {by}
            </a>
          </span>
        </div>
      </div>
    </div>
  );
};

export default LessonSlide;