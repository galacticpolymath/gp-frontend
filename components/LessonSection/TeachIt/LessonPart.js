/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable no-console */
import Image from 'next/image';
import PropTypes from 'prop-types';
import Accordion from '../../Accordion';
import LessonChunk from './LessonChunk';
import RichText from '../../RichText';
import { useState } from 'react';

const LESSON_PART_BTN_COLOR = '#2C83C3';
const TEST_TILE_IMG_URL = 'https://gp-catalog.vercel.app/lessons/FemalesSing_en-US/sponsor_logo_41be63750b.png';

// determine how many parts are there in the lesson

const LessonPart = ({
  partNum,
  partTitle,
  partPreface,
  chunks = [],
  resources,
  totalPartsNum,
  _numsOfLessonPartsThatAreExpanded
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [numsOfLessonPartsThatAreExpanded, setNumsOfLessonPartsThatAreExpanded] = _numsOfLessonPartsThatAreExpanded;
  const isOnAssessments = partTitle === 'Assessments';
  const durList = isOnAssessments ? null : (chunks && chunks.map(({ chunkDur }) => chunkDur));
  const has0Key = resources?.[0]?.parts ? ('0' in resources[0].parts) : false;
  console.log('resources?.[0]?.parts: ', resources?.[0]?.parts)
  const partsIndexNum = has0Key ? (partNum - 1) : partNum;
  const linkResources = isOnAssessments ? chunks : (resources?.[0]?.parts?.[partsIndexNum]?.itemList || []);
  // const lessonTileUrl = resources?.[0]?.parts?.[partsIndexNum]?.lessonTile ?? TEST_TILE_IMG_URL;
  const lessonTileUrl = resources?.[0]?.parts?.[partsIndexNum]?.lessonTile;
  let allTags = resources?.[0]?.parts?.[partsIndexNum]?.tags ?? null;
  let previewTags = null;
  let restOfTags = null;

  const handleOnClick = () => {
    const previousLessonPartNum = partNum - 1;
    setNumsOfLessonPartsThatAreExpanded(prevState => {
      if (!isExpanded) {
        return previousLessonPartNum ? [...prevState, previousLessonPartNum] : prevState;
      }

      return prevState.filter(num => num !== previousLessonPartNum);
    })
    setIsExpanded(!isExpanded);
  }

  if (allTags?.length && Array.isArray(allTags)) {
    allTags = allTags.flat().filter(tag => tag)

    // FOR TESTINGS PURPOSES, BELOW
    allTags = [...allTags, allTags[0]]
    // FOR TESTIING PURPOSES, ABOVE

    previewTags = (allTags?.length > 3) ? allTags.slice(0, 3) : allTags
    restOfTags = (allTags?.length > 3) ? allTags.slice(3) : []
  }

  const defaultBorderColor = 'solid 2.5px rgb(222, 226, 230)';
  const highlighlightedBorderColor = 'solid 2.5px #3987C5'; 
  let _borderTop = 'none'

  if (isExpanded && (partNum === 1)) {
    _borderTop = highlighlightedBorderColor
  }

  if (!isExpanded && (partNum === 1)) {
    _borderTop = defaultBorderColor
  }

  const _borderBottom = (numsOfLessonPartsThatAreExpanded.find(num => num === partNum) || isExpanded) ? highlighlightedBorderColor : defaultBorderColor
  const accordionStyle = {
    borderLeft: isExpanded ? highlighlightedBorderColor : defaultBorderColor,
    borderRight: isExpanded ? highlighlightedBorderColor : defaultBorderColor,
    borderTop: _borderTop,
    borderBottom: _borderBottom
  }

  return (
    <Accordion
      buttonClassName={`w-100 text-start bg-white border-0`}
      key={partNum}
      id={`part_${partNum}`}
      accordionChildrenClasses='px-3 w-100'
      style={accordionStyle}
      button={(
        <div onClick={handleOnClick} className='p-2 bg-white d-flex'>
          <div className={`d-flex flex-column ${lessonTileUrl ? 'w-75' : 'w-100'}`} >
            <h3 style={{ color: LESSON_PART_BTN_COLOR }} className='fs-6 fw-semibold'>{isOnAssessments ? 'Assessments' : `Part ${partNum}: ${partTitle}`}</h3>
            <div><RichText content={partPreface} /></div>
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
              <div style={{ width: 200, height: 200 }} className="position-relative">
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
              partInfo={resources?.parts?.[partNum - 1]}
              {...chunk}
            />
          ))}
        </>
      }
    </Accordion>
  );
};

LessonPart.propTypes = {
  partNum: PropTypes.number,
  partTitle: PropTypes.string,
  partPreface: PropTypes.string,
  chunks: PropTypes.array,
  resources: PropTypes.oneOfType([
    PropTypes.array, PropTypes.object,
  ]),
};

export default LessonPart;
