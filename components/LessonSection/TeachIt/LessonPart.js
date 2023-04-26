/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable no-console */
import PropTypes from 'prop-types';
import Accordion from '../../Accordion';
import LessonChunk from './LessonChunk';
import { useEffect } from 'react';

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

  useEffect(() => {
    console.log('linkResources: ', linkResources);
  });

  const handleLinkClick = url => {
    console.log('link was clicked!!!!')
    console.log('url: ', url)
    window.open(url, '_blank');
  };

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
                {item.links && (Array.isArray(item.links) ? item.links : [item.links]).map((link, i) => (
                  <li key={i}>
                    <div
                      className='text-primary underline-on-hover'
                      onClick={() => handleLinkClick(link.url)}
                      // href={link.url}
                      // target='_blank'
                      // rel='noopener noreferrer'
                    >
                      {link.linkText}
                    </div>
                  </li>
                ))}
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