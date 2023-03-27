/* eslint-disable no-console */
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

  return (
    <Accordion
      buttonClassName='w-100 text-start'
      key={partNum}
      id={`part_${partNum}`}
      button={(
        <div>
          <h3>Part {partNum}: {partTitle}</h3>
          <div>{partPreface}</div>
        </div>
      )}
    >
      <>
        <ol className='mt-3'>
          {(resources?.[0]?.parts?.[partNum - 1]?.itemList || []).map(item => (
            <li key={item.itemTitle} className='mb-2'>
              <strong>{item.itemTitle}</strong>
              <ul>
                {/* TODO: DATA: always want an array */}
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
          ))}
        </ol>

        <h4>Steps &amp; Flow</h4>
        {chunks.map((chunk, i) => (
          <LessonChunk
            key={i}
            chunkNum={i}
            durList={chunks.map(({ chunkDur }) => chunkDur)}
            partInfo={resources?.parts?.[partNum - 1]}
            {...chunk}
          />
        ))}
      </>
    </Accordion>
  );
};

LessonPart.propTypes = {
  partNum: PropTypes.number.isRequired,
  partTitle: PropTypes.string.isRequired,
  partPreface: PropTypes.string.isRequired,
  chunks: PropTypes.array.isRequired,
  resources: PropTypes.oneOfType([
    PropTypes.array, PropTypes.object,
  ]),
};

export default LessonPart;