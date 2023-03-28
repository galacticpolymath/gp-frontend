/* eslint-disable quotes */
/* eslint-disable no-console */
/* eslint-disable react/jsx-max-props-per-line */
import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import Accordion from './Accordion';

/**
 * A styled collapsible section of the Lesson Plan.
 */
const CollapsibleLessonSection = ({
  index,
  SectionTitle = '',
  className = '',
  children,
  initiallyExpanded = false,
  accordionId,
  _sectionDots,

}) => {
  const { ref, inView } = useInView({ threshold: .2 });
  const h2Id = SectionTitle.replace(/[\s!]/gi, '_').toLowerCase();
  const [sectionDots, setSectionDots] = _sectionDots;

  useEffect(() => {
    if (inView) {
      setSectionDots(sectionDots => sectionDots.map(sectionDot => {
        if ((sectionDot.sectionId === h2Id) && inView) {
          return {
            ...sectionDot,
            isInView: true,
          };
        }

        return {
          ...sectionDot,
          isInView: false,
        };
      }));
    }

  }, [inView]);

  return (
    <Accordion
      initiallyExpanded={initiallyExpanded}
      id={(accordionId || SectionTitle).replace(/[\s!]/gi, '_').toLowerCase()}
      className={`${className} collapsibleLessonSection`}
      buttonClassName="btn btn-primary-light w-100 text-left"
      button={(
        <div className='container mx-auto text-black d-flex justify-content-between align-items-center py-1'>
          <h2
            // ref={ref}
            // id={h2Id}
            className='m-0'
            style={{ width: '100%', overflowWrap: 'break-word' }}
          >
            {index && `${index}. `}{SectionTitle}
          </h2>
          <i className="fs-3 bi-chevron-down"></i>
          <i className="fs-3 bi-chevron-up"></i>
        </div>
      )}
    >
      {children}
    </Accordion>
  );
};

CollapsibleLessonSection.propTypes = {
  index: PropTypes.number,
  SectionTitle: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.object,
  initiallyExpanded: PropTypes.bool,
  accordionId: PropTypes.string,
};

export default CollapsibleLessonSection;
