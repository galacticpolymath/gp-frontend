/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable no-console */
import PropTypes from 'prop-types';
import Accordion from '../../Accordion';
import LessonChunk from './LessonChunk';
import RichText from '../../RichText';

const LessonPart = ({
  partNum,
  partTitle,
  partPreface,
  chunks = [],
  resources,
}) => {
  const isOnLastPart = partTitle === 'Assessments';
  const durList = isOnLastPart ? null : (chunks && chunks.map(({ chunkDur }) => chunkDur));
  const linkResources = isOnLastPart ? chunks : (resources?.[0]?.parts?.[partNum - 1]?.itemList || []);

  return (
    <Accordion
      buttonClassName='w-100 text-start border border-dark'
      key={partNum}
      id={`part_${partNum}`}
      button={(
        <div className='p-2'>
          <h3 className='fs-6 fw-semibold'>{isOnLastPart ? 'Assessments' : `Part ${partNum}: ${partTitle}`}</h3>
          <div><RichText content={partPreface} /></div>
        </div>
      )}
    >
      <>
        <ol className='mt-3'>
          {linkResources?.length && linkResources.map(item => {
            console.log('item: ', item);
            return (
              <li key={item.itemTitle} className='mb-0'>
                <strong><RichText content={item.itemTitle} /></strong>
                <div className='fst-italic mb-2' style={{ color:'#353637' }}>
                  <RichText
                    content={item.itemDescription}
                    className='mb-n5'
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

        {(!isOnLastPart && durList && chunks) &&
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
