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
      <div className='bg-white pb-3 pe-3 pe-sm-0 ps-3 ps-sm-0 pt-4 pt-0 p-sm-4 p-lg-3 rounded' style={{ maxWidth: 785 }}>
        <div className='justify-content-center d-flex align-items-center'>
          {getMediaComponent({ type, mainLink })}
        </div>
        <div className={`${styles.SlideBody} mt-4 lessonSlideBody`}>
          <h5 style={{ whiteSpace: 'pre-line' }} className='text-center pb-4 pb-sm-0 p-sm-0 p-sm-4 mb-0 mb-sm-1 text-sm-start '>{title}</h5>
          <p style={{ whiteSpace: 'pre-line' }} className="text-center pb-4 pb-sm-0 p-sm-0 p-sm-4 mb-0 mb-sm-1 text-sm-start">{lessonRelevance}</p>
          <span style={{ whiteSpace: 'pre-line' }} className="text-center p-sm-4 text-sm-start d-block d-sm-inline w-100">by{' '}
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