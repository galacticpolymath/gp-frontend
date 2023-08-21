/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable no-console */
import PropTypes from 'prop-types';
import Accordion from '../../Accordion';
import LessonChunk from './LessonChunk';
import RichText from '../../RichText';

const LESSON_PART_H3_COLOR = '#2C83C3'

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
  let tags = resources?.[0]?.parts?.[partsIndexNum]?.tags ?? null;
  tags = (tags?.length && tags.some(tag => Array.isArray(tag))) ? tags.flat() : tags 

  return (
    <Accordion
      buttonClassName='w-100 text-start border bg-white'
      key={partNum}
      id={`part_${partNum}`}
      button={(
        <div className='p-2 bg-white'>
          <h3 style={{ color: LESSON_PART_H3_COLOR }} className='fs-6 fw-semibold'>{isOnAssessments ? 'Assessments' : `Part ${partNum}: ${partTitle}`}</h3>
          <div><RichText content={partPreface} /></div>
        </div>
      )}
    >
      <>
        <ol className='mt-3'>
          {!!linkResources?.length && linkResources.map(item => {
            return (
              <li key={item.itemTitle} className='mb-0'>
                <strong><RichText content={item.itemTitle} /></strong>
                <div className='fst-italic mb-2' style={{ color:'#353637' }}>
                  <RichText
                    content={item.itemDescription}
                    className='mb-5'
                    css={{ color: 'red' }}
                  />
                </div>
                <ul>
                  {item.links && (Array.isArray(item.links) ? item.links : [item.links]).map((link, i) => (
                    <li key={i}>
                      <a
                        href={link.url}
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        {link.linkText}
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
