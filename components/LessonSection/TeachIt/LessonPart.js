/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable no-console */
import Image from 'next/image';
import PropTypes from 'prop-types';
import Accordion from '../../Accordion';
import LessonChunk from './LessonChunk';
import RichText from '../../RichText';
import { memo, useState } from 'react';
import Link from 'next/link';
import CopyableTxt from '../../CopyableTxt';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

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
  partsArr,
  chunks = [],
  resources,
  ForGrades,
  _numsOfLessonPartsThatAreExpanded,
}) => {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const [numsOfLessonPartsThatAreExpanded, setNumsOfLessonPartsThatAreExpanded] = _numsOfLessonPartsThatAreExpanded;
  const isOnAssessments = lsnTitle === 'Assessments';
  const durList = isOnAssessments ? null : (chunks && chunks.map(({ chunkDur }) => chunkDur));
  let _itemList = itemList;
  const targetLessonsResources = resources?.[0]?.[partsFieldName] ? Object.values(resources?.[0]?.[partsFieldName]).find(({ lsn }) => {
    if (lsn) {
      return lsnNum.toString() === lsn.toString();
    }
  }) ?? {} : {};
  let { tags: allTags, itemList: linkResources } = targetLessonsResources;
  _itemList = _itemList ?? linkResources;
  let previewTags = null;
  let restOfTags = null;
  const _accordionId = `part_${lsnNum}`;

  const handleClipBoardIconClick = () => {
    let url = window.location.href;
    const currentSectionInView = router.asPath.split('#').at(-1);

    if (!(currentSectionInView === _accordionId)) {
      url = `${window.location.origin}/lessons/${router.query.loc}/${router.query.id}#lesson_${_accordionId}`;
    }

    navigator.clipboard.writeText(url);
  };

  useEffect(() => {
    const lessonPartIdInUrl = window.location.href.split('#').at(-1);

    if (lessonPartIdInUrl === `lesson_${_accordionId}`) {
      const previousLessonPartNum = (lsnNum === 'last') ? (partsArr.length - 1) : (lsnNum - 1);

      setNumsOfLessonPartsThatAreExpanded(prevState => {
        if (!isExpanded) {
          return previousLessonPartNum ? [...prevState, previousLessonPartNum] : prevState;
        }

        return prevState.filter(num => num !== previousLessonPartNum);
      });
      setIsExpanded(true);
    }
  }, []);

  const handleOnClick = () => {
    const previousLessonPartNum = (lsnNum === 'last') ? (partsArr.length - 1) : (lsnNum - 1);

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
      buttonClassName="w-100 text-start bg-white border-0 p-0"
      key={lsnNum}
      id={_accordionId}
      accordionChildrenClasses='px-3 pb-2 w-100'
      style={accordionStyle}
      initiallyExpanded={isExpanded}
      button={(
        <div
          onClick={handleOnClick}
          className='px-3 position-relative pt-3 pb-2 w-100 bg-white d-flex'
        >
          <div
            style={{
              height: '10px',
              width: '100%',
              top: '-50%',
            }}
            className="position-absolute"
            id={`lesson_${_accordionId}`}
          />
          <div className='d-flex flex-column w-100'>
            <div className='d-flex justify-content-between w-100 position-relative'>
              <div
                className='d-flex flex-column justify-content-between w-100 align-items-stretch mt-0 pe-sm-3'
              >
                <div className='lessonPartHeaderContainer d-flex position-relative justify-content-between'>
                  <h3
                    style={{ color: LESSON_PART_BTN_COLOR }}
                    className='fs-5 fw-bold text-left px-sm-0'
                  >
                    {isOnAssessments ? 'Assessments' : `Lesson ${lsnNum}: ${lsnTitle}`}
                  </h3>
                  <div
                    className="rounded d-flex d-lg-none positive-absolute justify-content-center align-items-center"
                    style={{ width: 30, height: 30, border: `solid 2.3px ${isExpanded ? highlightedBorderColor : '#DEE2E6'}` }}
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
                {lessonTileUrl &&
                  <div className='w-100 d-flex justify-content-start align-items-stretch flex-column'>
                    <div style={{ width: 150, height: 150 }} className="d-flex my-3 my-lg-0 d-lg-none position-relative">
                      <Image
                        src={lessonTileUrl}
                        alt="lesson_tile"
                        fill
                        style={{ objectFit: 'contain' }}
                        sizes="130px"
                        className="rounded img-optimize"
                      />
                    </div>
                  </div>
                }
                <div className='d-flex mt-2'>
                  <RichText
                    className='text-start'
                    content={lsnPreface}
                  />
                </div>
                {!!previewTags?.length && (
                  <div
                    className='d-flex tagPillContainer flex-wrap'
                  >
                    {previewTags.map((tag, index) => (
                      <div
                        key={index}
                        style={{ border: `solid .5px ${LESSON_PART_BTN_COLOR}` }}
                        className='rounded-pill badge bg-white p-2 mt-2'
                      >
                        <span style={{ color: LESSON_PART_BTN_COLOR, fontWeight: 450 }}>
                          {tag}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className='d-none arrow-down-lesson-part-container d-lg-flex'>
                {lessonTileUrl &&
                  <div style={{ width: 150, height: 150 }} className="d-none d-lg-block position-relative me-4">
                    <Image
                      src={lessonTileUrl}
                      alt="lesson_tile"
                      fill
                      style={{ objectFit: 'contain' }}
                      sizes="130px"
                      className="rounded img-optimize"
                    />
                  </div>
                }
                <div className="h-100 d-none d-sm-block">
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
                  <div className='d-flex justify-content-center align-items-center mt-3'>
                    <CopyableTxt
                      additiveYCoord={-20}
                      copyTxtIndicator='Link to this lesson.'
                      txtCopiedIndicator='Lesson link copied ✅!'
                      implementLogicOnClick={handleClipBoardIconClick}
                      copyTxtModalDefaultStyleObj={{
                        position: 'fixed',
                        width: '150px',
                        backgroundColor: '#212529',
                        textAlign: 'center',
                      }}
                    >
                      <i className="bi bi-clipboard" style={{ fontSize: '30px', color: '#A2A2A2' }} />
                    </CopyableTxt>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    >
      <div className='p-0'>
        {!!restOfTags?.length && (
          <div className='d-flex mt-0 mt-md-1 justify-content-sm-start tagPillContainer flex-wrap'>
            {restOfTags.map((tag, index) => (
              <div
                key={index}
                style={{ border: `solid .5px ${LESSON_PART_BTN_COLOR}` }}
                className='rounded-pill badge bg-white p-2'
              >
                <span style={{ color: LESSON_PART_BTN_COLOR, fontWeight: 450 }}>
                  {tag}
                </span>
              </div>
            ))}
          </div>
        )}
        {learningObjectives &&
          <div className="mt-4">
            <h5 className='fw-bold'>Learning Objectives</h5>
            <p className='fw-semibold mb-0'>Students will able to...</p>
            <ol className='mt-0'>
              {learningObjectives.map((objectiveStr, index) => (
                <li key={index}>
                  <RichText content={objectiveStr} />
                </li>
              ))}
            </ol>
          </div>
        }

        <div className='mt-4'>
          <h5 className="fw-bold">Materials for Grades {ForGrades}</h5>
          <ol className='mt-2'>
            {!!_itemList?.length && _itemList.map(item => {
              const { itemTitle, itemDescription, links } = item;
              const _links = links ? (Array.isArray(links) ? links : [links]) : null;

              return (
                <li key={itemTitle} className='mt-2 mb-0'>
                  <strong><RichText content={itemTitle} /></strong>
                  <div className='fst-italic mb-1' style={{ color: '#353637' }}>
                    <RichText
                      content={itemDescription}
                      css={{ color: 'red' }}
                    />
                  </div>
                  <ul>
                    {!!_links && _links.map(({ url, linkText }, index) => (
                      <li className='mb-0' key={index}>
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
            <h5 className= 'fw-bold mb-1 mb-lg-3'>Steps &amp; Flow </h5>
            {chunks.map((chunk, i) => (
              <LessonChunk
                key={i}
                chunkNum={i}
                chunkDur={durList[i]}
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
      </div>
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