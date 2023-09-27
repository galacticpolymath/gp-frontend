/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable no-console */
import Image from 'next/image';
import PropTypes from 'prop-types';
import Accordion from '../../Accordion';
import LessonChunk from './LessonChunk';
import RichText from '../../RichText';
import { memo, useState } from 'react';

const LESSON_PART_BTN_COLOR = '#2C83C3';
const TEST_TILE_IMG_URL = 'https://gp-catalog.vercel.app/lessons/FemalesSing_en-US/sponsor_logo_41be63750b.png';


const LessonPart = ({
  lsnNum,
  lsnTitle,
  lsnPreface,
  learningObjectives,
  lessonTileUrl,
  partsFieldName,
  chunks = [],
  resources,
  _numsOfLessonPartsThatAreExpanded
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [numsOfLessonPartsThatAreExpanded, setNumsOfLessonPartsThatAreExpanded] = _numsOfLessonPartsThatAreExpanded;
  const isOnAssessments = lsnTitle === 'Assessments';
  const durList = isOnAssessments ? null : (chunks && chunks.map(({ chunkDur }) => chunkDur));
  let has0Key = false;

  if (partsFieldName === 'parts') {
    has0Key = '0' in resources[0].parts;
  }

  const partsIndexNum = has0Key ? (lsnNum - 1) : (partsFieldName === 'lessons') ? (lsnNum - 1) : lsnNum;
  const linkResources = isOnAssessments ? chunks : (resources?.[0]?.[partsFieldName]?.[partsIndexNum]?.itemList || []);
  let allTags = resources?.[0]?.[partsFieldName]?.[partsIndexNum]?.tags ?? null;
  let previewTags = null;
  let restOfTags = null;

  const handleOnClick = () => {
    const previousLessonPartNum = lsnNum - 1;
    setNumsOfLessonPartsThatAreExpanded(prevState => {
      if (!isExpanded) {
        return previousLessonPartNum ? [...prevState, previousLessonPartNum] : prevState;
      }

      return prevState.filter(num => num !== previousLessonPartNum);
    })
    setIsExpanded(!isExpanded);
  }

  console.log('allTags: ', allTags)

  if (allTags?.length && Array.isArray(allTags)) {
    allTags = allTags.flat().filter(tag => !!tag)

    console.log('allTags after filter: ', allTags)

    // FOR TESTINGS PURPOSES, BELOW
    // allTags = allTags.length ? [...allTags, allTags[0]] : allTags;
    // FOR TESTIING PURPOSES, ABOVE

    previewTags = (allTags?.length > 3) ? allTags.slice(0, 3) : allTags
    restOfTags = (allTags?.length > 3) ? allTags.slice(3) : []
  }


  const defaultBorderColor = 'solid 2.5px rgb(222, 226, 230)';
  const highlighlightedBorderColor = 'solid 2.5px #3987C5';
  let _borderTop = 'none'

  if (isExpanded && (lsnNum === 1)) {
    _borderTop = highlighlightedBorderColor
  }

  if (!isExpanded && (lsnNum === 1)) {
    _borderTop = defaultBorderColor
  }

  const _borderBottom = (numsOfLessonPartsThatAreExpanded.find(num => num === lsnNum) || isExpanded) ? highlighlightedBorderColor : defaultBorderColor
  const accordionStyle = {
    borderLeft: isExpanded ? highlighlightedBorderColor : defaultBorderColor,
    borderRight: isExpanded ? highlighlightedBorderColor : defaultBorderColor,
    borderTop: _borderTop,
    borderBottom: _borderBottom
  }

  return (
    <Accordion
      buttonClassName={`w-100 text-start bg-white border-0`}
      key={lsnNum}
      id={`part_${lsnNum}`}
      accordionChildrenClasses='px-3 w-100'
      style={accordionStyle}
      button={(
        <div onClick={handleOnClick} className='p-2 bg-white d-flex'>
          <div className={`d-flex flex-column ${lessonTileUrl ? 'w-75' : 'w-100'}`} >
            <div className='d-flex align-items-center'>
              <div className='d-flex align-items-center pb-1'>
                <i style={{ color: '#DEE2E6' }} className="fs-3 bi-chevron-down"></i>
                <i className="fs-3 bi-chevron-up"></i>
              </div>
              <div className='d-flex align-items-center'>
                <h3 style={{ color: LESSON_PART_BTN_COLOR }} className='fs-6 fw-semibold'>{isOnAssessments ? 'Assessments' : `Part ${lsnNum}: ${lsnTitle}`}</h3>
              </div>
            </div>
            <div><RichText content={lsnPreface} /></div>
            {!!previewTags?.length && (
              <div style={{ top: 10 }} className='mt-2 d-flex w-75 tagPillContainer flex-wrap'>
                {previewTags.map((tag, index) => (
                  <div key={index} style={{ border: `solid .5px ${LESSON_PART_BTN_COLOR}` }} className='rounded-pill badge bg-white p-2 my-1'>
                    <span style={{ color: LESSON_PART_BTN_COLOR, fontWeight: 450 }} >
                      {tag}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          {lessonTileUrl &&
            <div className='w-25 d-flex justify-content-center align-items-center'>
              <div style={{ width: 125, height: 125 }} className="position-relative">
                <Image
                  src={lessonTileUrl}
                  alt="lesson_tile"
                  fill
                  style={{ objectFit: 'contain' }}
                  sizes="130px"
                  className="rounded"
                />
              </div>
            </div>
          }
        </div>
      )}
    >
      {!!restOfTags?.length && (
        <div style={{ top: 10 }} className=''>
          {restOfTags.map((tag, index) => (
            <div key={index} style={{ border: `solid .5px ${LESSON_PART_BTN_COLOR}` }} className='rounded-pill badge bg-white p-2 my-1'>
              <span style={{ color: LESSON_PART_BTN_COLOR, fontWeight: 450 }} >
                {tag}
              </span>
            </div>
          ))}
        </div>
      )}
      {learningObjectives &&
        <ol className='mt-3'>
          <h3>Learning Objectives</h3>
          {learningObjectives.map(objectiveStr => (
            <li>
              {objectiveStr}
            </li>
          ))}
        </ol>
      }
      <ol className='mt-3'>
        {!!linkResources?.length && linkResources.map(item => {
          const { itemTitle, itemDescription, links } = item;
          const _links = links ? (Array.isArray(links) ? links : [links]) : null;
          return (
            // put the leaning objectie for the lesson part here
            <li key={itemTitle} className='mb-0'>
              <strong><RichText content={itemTitle} /></strong>
              <div className='fst-italic mb-2' style={{ color: '#353637' }}>
                <RichText
                  content={itemDescription}
                  className='mb-5'
                  css={{ color: 'red' }}
                />
              </div>
              <ul>
                {!!_links && _links.map(({ url, linkText }, index) => (
                  <li key={index}>
                    <a
                      href={url}
                      target='_blank'
                      rel='noopener noreferrer'
                    >
                      {linkText}
                    </a>
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ol>

      {(!isOnAssessments && durList && chunks) &&
        <>
          <h4>Steps &amp; Flow</h4>
          {chunks.map((chunk, i) => (
            <LessonChunk
              key={i}
              chunkNum={i}
              durList={durList}
              partInfo={resources?.[partsFieldName]?.[lsnNum - 1]}
              {...chunk}
            />
          ))}
        </>
      }
    </Accordion>
  );
};

LessonPart.propTypes = {
  lsnNum: PropTypes.number,
  lsnTitle: PropTypes.string,
  lsnPreface: PropTypes.string,
  chunks: PropTypes.array,
  resources: PropTypes.oneOfType([
    PropTypes.array, PropTypes.object,
  ]),
};

export default memo(LessonPart);