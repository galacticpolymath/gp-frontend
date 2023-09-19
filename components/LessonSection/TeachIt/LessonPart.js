/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable no-console */
import PropTypes from 'prop-types';
import Accordion from '../../Accordion';
import LessonChunk from './LessonChunk';
import RichText from '../../RichText';
import { memo } from 'react';

// partNum
// partTitle,
// partPreface,

const LessonPart = ({
  lsnNum,
  lsnTitle,
  lsnPreface,
  chunks = [],
  resources,
}) => {
  const isOnAssessments = lsnTitle === 'Assessments';
  const durList = isOnAssessments ? null : (chunks && chunks.map(({ chunkDur }) => chunkDur));
  const has0Key = resources?.[0]?.parts ? '0' in resources[0].parts : false;
  const linkResources = isOnAssessments ? chunks : (resources?.[0]?.parts?.[has0Key ? (lsnNum - 1) : lsnNum]?.itemList || []);

  return (
    <Accordion
      buttonClassName='w-100 text-start border border-dark'
      key={lsnNum}
      id={`part_${lsnNum}`}
      button={(
        <div className='p-2'>
          <h3 className='fs-6 fw-semibold'>{isOnAssessments ? 'Assessments' : `Part ${lsnNum}: ${lsnTitle}`}</h3>
          <div><RichText content={lsnPreface} /></div>
        </div>
      )}
    >
      <>
        <ol className='mt-3'>
          {!!linkResources?.length && linkResources.map(item => {
            return (
              <li key={item.itemTitle} className='mb-0'>
                <strong><RichText content={item.itemTitle} /></strong>
                <div className='fst-italic mb-2' style={{ color: '#353637' }}>
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
                partInfo={resources?.parts?.[lsnNum - 1]}
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
  lsnNum: PropTypes.number,
  lsnTitle: PropTypes.string,
  lsnPreface: PropTypes.string,
  chunks: PropTypes.array,
  resources: PropTypes.oneOfType([
    PropTypes.array, PropTypes.object,
  ]),
};

export default memo(LessonPart);
