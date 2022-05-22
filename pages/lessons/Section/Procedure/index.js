import React, { Fragment } from 'react';
import PropTypes from 'prop-types';

import RichText from '../../../components/RichText';
import CollapsibleSection from '../CollapsibleSection';
import LessonPart from './LessonPart';

const Procedure = ({ index, SectionTitle, Data }) => {
  return (
    <CollapsibleSection
      className="Procedure"
      index={index}
      SectionTitle={SectionTitle}
      initiallyExpanded
    >
      <div className="container">
        <Fragment>
          <div className="procLessonPreface">
            <h4>
              {/* <TimerIcon className={classes.inlineIcon} /> */}
              {'  '}
              {Data.lessonDur}
            </h4>
            <RichText content={Data.lessonPreface} />
          </div>
          {Data.parts.map((part, i) => (
            <LessonPart key={i} {...part} />
          ))}
        </Fragment>
      </div>
    </CollapsibleSection>
  );
};

Procedure.propTypes = {
  index: PropTypes.number,
  SectionTitle: PropTypes.string,
  Data: PropTypes.object,
};

export default Procedure;
