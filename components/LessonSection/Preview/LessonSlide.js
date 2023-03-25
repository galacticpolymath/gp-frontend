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
    <div className='autoCarouselItem onLessonsPg rounded px-5 py-1 px-lg-1 py-lg-1 justify-content-center align-items-center' style={{ 'width': '100%' }}>
      <div className='bg-white p-4 p-lg-3 rounded' style={{ maxWidth: 785 }}>
        <div className='justify-content-center d-flex align-items-center'>
          {getMediaComponent({ type, mainLink })}
        </div>
        <div className={`${styles.SlideBody} mt-4`}>
          <h5 style={{ maxWidth: "90%", whiteSpace: 'pre-line' }} className='text-left'>{title}</h5>
          <p style={{ maxWidth: '90%', whiteSpace: 'pre-line' }} className="text-left">{lessonRelevance}</p>
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