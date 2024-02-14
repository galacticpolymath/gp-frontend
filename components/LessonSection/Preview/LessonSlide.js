/* eslint-disable no-console */
/* eslint-disable quotes */
import { getMediaComponent } from './utils';
import styles from './index.module.scss';
import RichText from '../../RichText';
import { FiExternalLink } from 'react-icons/fi';
import Link from 'next/link';

const LessonSlide = ({
  type,
  forLsn,
  title,
  lessonRelevance,
  by,
  byLink,
  mainLink,
  webAppPreviewImg,
  webAppImgAlt,
  iframeClassName = 'lesson-media',
}) => {
  return (
    <div className='autoCarouselItem onLessonsPg mb-1 rounded p-1 justify-content-center align-items-center '>
      <div className='px-1 pb-0 rounded w-100'>
        <div className='px-1 mediaItemContainer'>
          {getMediaComponent({ type, mainLink, webAppPreviewImg, webAppImgAlt, iframeClassName })}
          {(type === "web-app") && (
            <Link
              href={mainLink}
              target='_blank'
              style={{
                bottom: "30px",
                left: 0,
                fontWeight: 499,
              }}
              className='position-absolute text-white d-flex justify-content-evenly px-2 py-1 align-items-center bg-dark d-flex'
            >
              <p className='text-white mb-0 d-flex justify-content-center h-100 openAppTxt'>Open app</p>
              <FiExternalLink
                size={25}
                fontWeight={499}
                color='white'
                className='ms-2'
              />
            </Link>
          )}
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
};

export default LessonSlide;