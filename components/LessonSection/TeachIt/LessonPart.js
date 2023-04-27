/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable semi */
/* eslint-disable no-console */
/* eslint-disable quotes */
import PropTypes from 'prop-types';
import Accordion from '../../Accordion';
import LessonChunk from './LessonChunk';

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

  // const handleLinkClick = url => {
  //   window.open(url, '_blank');
  // };

  return (
    <Accordion
      buttonClassName='w-100 text-start'
      key={partNum}
      id={`part_${partNum}`}
      button={(
        <div>
          <h3>{isOnLastPart ? 'Assessments' : `Part ${partNum}: ${partTitle}`}</h3>
          <div>{partPreface}</div>
        </div>
      )}
    >
      <>
        <ol className='mt-3'>
          {linkResources.map(item => (
            <li key={item.itemTitle} className='mb-2'>
              <strong>{item.itemTitle}</strong>
              <ul>
                {item.links && (Array.isArray(item.links) ? item.links : [item.links]).map((link, i) => {
                  return (
                    <li key={i}>
                      <a
                        className='text-primary underline-on-hover'
                        href={link.url}
                        target='_blank'
                      >
                        {link.linkText}
                      </a>
                    </li>
                  )
                })}
              </ul>
            </li>
          ))}
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