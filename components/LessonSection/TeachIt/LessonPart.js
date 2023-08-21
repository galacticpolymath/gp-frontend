/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable no-console */
import PropTypes from 'prop-types';
import Accordion from '../../Accordion';
import LessonChunk from './LessonChunk';
import RichText from '../../RichText';

const LESSON_PART_BTN_COLOR = '#2C83C3';
const TEST_TILE_IMG_URL = 'https://gp-catalog.vercel.app/lessons/FemalesSing_en-US/sponsor_logo_41be63750b.png';

const LessonPart = ({
  partNum,
  partTitle,
  partPreface,
  chunks = [],
  resources,
}) => {
  const isOnAssessments = partTitle === 'Assessments';
  const durList = isOnAssessments ? null : (chunks && chunks.map(({ chunkDur }) => chunkDur));
  const has0Key = resources?.[0]?.parts ? '0' in resources[0].parts : false;
  const partsIndexNum = has0Key ? (partNum - 1) : partNum;
  const linkResources = isOnAssessments ? chunks : (resources?.[0]?.parts?.[partsIndexNum]?.itemList || []);
  const lessonTileUrl = resources?.[0]?.parts?.[partsIndexNum]?.lessonTile ?? TEST_TILE_IMG_URL;
  let tags = resources?.[0]?.parts?.[partsIndexNum]?.tags ?? null;

  if (tags?.length && Array.isArray(tags)) {
    tags = tags.flat()
    tags = tags?.length > 3 ? tags.slice(0, 3) : tags
  }

  return (
    <Accordion
      buttonClassName='w-100 text-start border bg-white'
      key={partNum}
      id={`part_${partNum}`}
      button={(
        <div className='p-2 bg-white'>
          <h3 style={{ color: LESSON_PART_BTN_COLOR }} className='fs-6 fw-semibold'>{isOnAssessments ? 'Assessments' : `Part ${partNum}: ${partTitle}`}</h3>
          <div><RichText content={partPreface} /></div>
          {tags?.length && (
            <div className='mt-2 tagPillContainer d-flex justify-content-between flex-wrap'>
              {tags.map((tag, index) => (
                <div key={index} style={{ border: `solid .5px ${LESSON_PART_BTN_COLOR}` }} className={`rounded-pill badge bg-white p-2 my-1`}>
                  <span style={{ color: LESSON_PART_BTN_COLOR, fontWeight: 450 }} >
                    {tag}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    >
      <>
        <ol className='mt-3'>
          {!!linkResources?.length && linkResources.map(item => {
            const { itemTitle, itemDescription, links } = item;
            const _links = links ? (Array.isArray(links) ? links : [links]) : null;

            return (
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
      </>
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
