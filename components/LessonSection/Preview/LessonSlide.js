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
    <div className='autoCarouselItem rounded justify-content-center align-items-center ms-1 me-1' style={{ 'width': '100%' }}>
      <div className='bg-white p-3'>
        {getMediaComponent({ type, mainLink })}
        <div className={`${styles.SlideBody}`}>
          <h5 style={{ maxWidth: "350px", whiteSpace: 'pre-line' }} className='text-left'>{title}</h5>
          <p style={{ maxWidth: '200px', whiteSpace: 'pre-line' }} className="border">{lessonRelevance}</p>
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