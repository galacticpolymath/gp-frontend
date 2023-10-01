/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable no-console */
import Image from 'next/image';
import PropTypes from 'prop-types';
import Accordion from '../../Accordion';
import LessonChunk from './LessonChunk';
import RichText from '../../RichText';
import { memo, useState } from 'react';
import Link from 'next/link';

const LESSON_PART_BTN_COLOR = '#2C83C3';

const LessonPart = ({
  lsnNum,
  lsnTitle,
  lsnPreface,
  lsnExt,
  itemList,
  learningObjectives,
  lessonTileUrl,
  partsFieldName,
  chunks = [],
  resources,
  ForGrades,
  _numsOfLessonPartsThatAreExpanded,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [numsOfLessonPartsThatAreExpanded, setNumsOfLessonPartsThatAreExpanded] = _numsOfLessonPartsThatAreExpanded;
  const isOnAssessments = lsnTitle === 'Assessments';
  const durList = isOnAssessments ? null : (chunks && chunks.map(({ chunkDur }) => chunkDur));
  let has0Key = false;

  if (partsFieldName === 'parts') {
    has0Key = '0' in resources[0].parts;
  }

  console.log('resources?.[0]?.[partsFieldName]: ', resources?.[0]?.[partsFieldName])
  console.log("Object.values(resources?.[0]?.[partsFieldName]): ", Object.values(resources?.[0]?.[partsFieldName]))

  const targetLessonsResources = resources?.[0]?.[partsFieldName] ? Object.values(resources?.[0]?.[partsFieldName]).find(({ lsn }) => {
    if (lsn) {
      return lsnNum.toString() === lsn.toString()
    }
  }) ?? {} : {};
  console.log('targetLessonsResources: ', targetLessonsResources)
  let { tags: allTags } = targetLessonsResources;
  let previewTags = null;
  let restOfTags = null;

  const handleOnClick = () => {
    const previousLessonPartNum = lsnNum === 'last' ? (resources?.[0]?.[partsFieldName]?.length - 1) : (lsnNum - 1);

    setNumsOfLessonPartsThatAreExpanded(prevState => {
      if (!isExpanded) {
        return previousLessonPartNum ? [...prevState, previousLessonPartNum] : prevState;
      }

      return prevState.filter(num => num !== previousLessonPartNum);
    });
    setIsExpanded(!isExpanded);
  };

  if (allTags?.length && Array.isArray(allTags)) {
    allTags = allTags.flat().filter(tag => !!tag);
    previewTags = (allTags?.length > 3) ? allTags.slice(0, 3) : allTags;
    restOfTags = (allTags?.length > 3) ? allTags.slice(3) : [];
  }

  const defaultBorderColor = 'solid 2.5px rgb(222, 226, 230)';
  const highlightedBorderColor = '#3987C5';
  const highlighlightedBorder = `solid 2.5px ${highlightedBorderColor}`;
  let _borderTop = 'none';

  if (isExpanded && (lsnNum == 1)) {
    _borderTop = highlighlightedBorder;
  }

  if (!isExpanded && (lsnNum == 1)) {
    _borderTop = defaultBorderColor;
  }

  const _borderBottom = (numsOfLessonPartsThatAreExpanded.find(num => num == lsnNum) || isExpanded) ? highlighlightedBorder : defaultBorderColor;
  const accordionStyle = {
    borderLeft: isExpanded ? highlighlightedBorder : defaultBorderColor,
    borderRight: isExpanded ? highlighlightedBorder : defaultBorderColor,
    borderTop: _borderTop,
    borderBottom: _borderBottom,
  };

  return (
    <Accordion
      buttonClassName="w-100 text-start bg-white border-0"
      key={lsnNum}
      id={`part_${lsnNum}`}
      accordionChildrenClasses='px-3 w-100 pb-4'
      style={accordionStyle}
      button={(
        <div
          onClick={handleOnClick}
          className='p-2 w-100 bg-white d-flex'
        >
          <div className='d-flex flex-column w-100'>
            <div className='d-flex justify-content-between w-100 position-relative'>
              <div className='d-flex w-100 align-items-stretch ms-sm-2 mt-3 pb-2'>
                <h3
                  style={{ color: LESSON_PART_BTN_COLOR }}
                  className='fs-6 fw-semibold text-center d-flex justify-content-center align-items-center d-sm-block justify-content-sm-start align-items-sm-stretch px-5 px-sm-0 w-max-sm-100'
                >
                  {isOnAssessments ? 'Assessments' : `Lesson ${lsnNum}: ${lsnTitle}`}
                </h3>
              </div>
              <div className='d-flex align-items-center arrow-down-lesson-part-container'>
                {lessonTileUrl &&
                  <div style={{ width: 145, height: 145 }} className="d-none d-sm-block position-relative me-4">
                    <Image
                      src={lessonTileUrl}
                      alt="lesson_tile"
                      fill
                      style={{ objectFit: 'contain' }}
                      sizes="130px"
                      className="rounded"
                    />
                  </div>
                }
                <div className="h-100">
                  <div
                    className="rounded d-flex justify-content-center align-items-center"
                    style={{ width: 35, height: 35, border: `solid 2.3px ${isExpanded ? highlightedBorderColor : '#DEE2E6'}` }}
                  >
                    <i
                      style={{ color: '#DEE2E6' }}
                      className="fs-4 bi-chevron-down"
                    />
                    <i
                      style={{ color: highlightedBorderColor }}
                      className="fs-4 bi-chevron-up"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="d-flex justify-content-center align-items-center d-sm-none">
              {lessonTileUrl &&
                <div style={{ width: 145, height: 145 }} className="position-relative me-sm-4">
                  <Image
                    src={lessonTileUrl}
                    alt="lesson_tile"
                    fill
                    style={{ objectFit: 'contain' }}
                    sizes="130px"
                    className="rounded"
                  />
                </div>
              }
            </div>
            <div className='mt-4 mb-2'><RichText className='text-center text-sm-start' content={lsnPreface} /></div>
            {!!previewTags?.length && (
              <div style={{ top: 10 }} className='mt-2 d-flex justify-content-center justify-content-sm-start tagPillContainer flex-wrap'>
                {previewTags.map((tag, index) => (
                  <div
                    key={index}
                    style={{ border: `solid .5px ${LESSON_PART_BTN_COLOR}` }}
                    className='rounded-pill badge bg-white p-2 my-1'
                  >
                    <span style={{ color: LESSON_PART_BTN_COLOR, fontWeight: 450 }}>
                      {tag}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    >
      {!!restOfTags?.length && (
        <div>
          {restOfTags.map((tag, index) => (
            <div
              key={index}
              style={{ border: `solid .5px ${LESSON_PART_BTN_COLOR}` }}
              className='rounded-pill badge bg-white p-2 my-1'
            >
              <span style={{ color: LESSON_PART_BTN_COLOR, fontWeight: 450 }}>
                {tag}
              </span>
            </div>
          ))}
        </div>
      )}
      {learningObjectives &&
        <div className="mt-3">
          <h5 className='fw-bold'>Learning Objectives</h5>
          <p className='fw-semibold'>Students will able to...</p>
          <ol className='mt-3'>
            {learningObjectives.map((objectiveStr, index) => (
              <li key={index}>
                {objectiveStr}
              </li>
            ))}
          </ol>
        </div>
      }

      <div className='mt-4'>
        <h5 className="fw-bold">Materials for Grades {ForGrades}</h5>
        <ol className='mt-3'>
          {!!itemList?.length && itemList.map(item => {
            const { itemTitle, itemDescription, links } = item;
            const _links = links ? (Array.isArray(links) ? links : [links]) : null;

            return (
              <li key={itemTitle} className='mb-0'>
                <strong><RichText content={itemTitle} /></strong>
                <div className='fst-italic mb-2' style={{ color: '#353637' }}>
                  <RichText
                    content={itemDescription}
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
      </div>

      {(!isOnAssessments && durList && chunks) &&
        <>
          <h5>Steps &amp; Flow</h5>
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
      {!!lsnExt?.length &&
        <div>
          <div>
            <h5 className='fw-bold'>Going Further</h5>
            <RichText content="Ideas and resources for deepening learning on this topic." />
          </div>
          <ol className='mt-2'>
            {lsnExt.map(({ itemTitle, itemDescription, item, itemLink }) => {
              return (
                <li key={item} style={{ color: '#4397D5' }}>
                  <h6 style={{ color: '#4397D5' }} className='fw-bold'>
                    <Link href={itemLink} target='_blank'>
                      {itemTitle}
                    </Link>
                  </h6>
                  <p className='text-dark'>{itemDescription}</p>
                </li>
              );
            })}
          </ol>
        </div>
      }
    </Accordion>
  );
};

LessonPart.propTypes = {
  lsnNum: PropTypes.number,
  lsnTitle: PropTypes.string,
  lsnPreface: PropTypes.string,
  lsnExt: PropTypes.arrayOf(PropTypes.string),
  chunks: PropTypes.array,
  resources: PropTypes.oneOfType([
    PropTypes.array, PropTypes.object,
  ]),
};

export default memo(LessonPart);