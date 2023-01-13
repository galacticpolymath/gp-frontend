import React from 'react';
import Accordion from '../../Accordion';

const LessonPart = ({
  partNum,
  partTitle,
  partDur,
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
          <h5>Part {partNum}: {partTitle}</h5>
          <div>{partPreface}</div>
        </div>
      )}
    >
      <ol className='mt-3'>
        {(resources.parts[partNum - 1].itemList || []).map(item => (
          <li key={item.itemTitle} className='mb-2'>
            <strong>{item.itemTitle}</strong>
            <ul>
              {/* TODO: DATA: always want an array */}
              {item.links && (Array.isArray(item.links) ? item.links : [item.links]).map((link, i) => (
                <li key={i}>
                  <a href={link.url}>
                    {link.linkText}
                  </a>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
      <h6>Steps &amp; Flow</h6>
    </Accordion>
  );
};

export default LessonPart;