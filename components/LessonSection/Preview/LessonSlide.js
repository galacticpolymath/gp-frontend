/* eslint-disable no-console */
/* eslint-disable quotes */
import { getMediaComponent } from './utils';
import styles from './index.module.scss';

const LessonSlide = ({
  type,
  forLsn,
  title,
  lessonRelevance,
  by,
  byLink,
  mainLink,
}) => {
  return (
    <div className='autoCarouselItem onLessonsPg mb-1 rounded p-1 justify-content-center align-items-center '>
      <div className='px-1 pt-2 pb-0 rounded w-100'>
        <div
          className='px-1 justify-content-center d-flex'
          style={{ position: "relative", border: "1px solid lightgray", height: "50vh", width: "100%", objectFit: "contain" }}
        >
          {getMediaComponent({ type, mainLink })}
        </div>
        <div
          className={`${styles.SlideBody} mt-2 text-wrap lessonSlideBody px-1 px-md-3`}
          style={{ width: "100%" }}
        >
          {forLsn && (
            <div className='badge badge-pill bg-primary-light mb-1' style={{ color: 'gray' }}>for Part {forLsn}</div>
          )}
          <h6 className='m-0 mb-1 fw-bolder fst-italic'>{title}</h6>
          <div className="lessonRelevanceTxt mb-2 me-3">{lessonRelevance}</div>
          <span className=" d-block d-sm-inline w-100">by{' '}
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