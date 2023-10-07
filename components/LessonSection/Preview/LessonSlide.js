/* eslint-disable no-console */
/* eslint-disable quotes */
import { getMediaComponent } from './utils';
import styles from './index.module.scss';
import RichText from '../../RichText';

// NOTES: 
// 1) get the image preview for the given web-app 
// -get the image preview on the server



// 2) create a new conditional render for the getMediaComponent when the item is a web-app 

const LessonSlide = ({
  type,
  forLsn,
  title,
  lessonRelevance,
  by,
  byLink,
  mainLink,
  webAppPreviewImg
}) => (
  <div className='autoCarouselItem onLessonsPg mb-1 rounded p-1 justify-content-center align-items-center '>
    <div className='px-1 pt-2 pb-0 rounded w-100'>
    {/* border: "1px solid lightgray" */}
      <div
        className='px-1 justify-content-center d-flex border mediaItemContainer'
        style={{ position: "relative", border: "1px solid lightgray",  height: "65vh", width: "100%", objectFit: "contain" , maxHeight: "470px" }}
      >
        {getMediaComponent({ type, mainLink, webAppPreviewImg })}
      </div>
      <div
        className={`${styles.SlideBody} mt-2 text-wrap lessonSlideBody px-1 px-md-3`}
        style={{ width: "100%" }}
      >
        {forLsn && (
          <div className='badge badge-pill bg-primary-light mb-1' style={{ color: 'gray' }}>For Lesson {forLsn}</div>
        )}
        <h6 className='m-0 mb-1 fw-bolder fst-italic'>{title}</h6>
        <RichText className='lessonRelevanceTxt mb-2 me-3' content={lessonRelevance} />
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

export default LessonSlide;