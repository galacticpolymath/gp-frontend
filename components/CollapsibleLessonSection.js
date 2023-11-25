/* eslint-disable quotes */
/* eslint-disable no-console */
/* eslint-disable react/jsx-max-props-per-line */
import PropTypes from 'prop-types';
import { useRef } from 'react';
import useLessonElementInView from '../customHooks/useLessonElementInView';
import Accordion from './Accordion';
import CopyableTxt from './CopyableTxt';
import { useRouter } from 'next/router';

/**
 * A styled collapsible section of the Lesson Plan.
 */
const CollapsibleLessonSection = ({
  SectionTitle = '',
  className = '',
  children,
  initiallyExpanded = false,
  accordionId,
  _sectionDots,
  isAvailLocsMoreThan1,
  highlighted = false,
  scrollToTranslateVal = 'translateY(-150px)',
}) => {
  const ref = useRef();
  const router = useRouter();
  const { h2Id } = useLessonElementInView(_sectionDots, SectionTitle, ref, isAvailLocsMoreThan1);
  const _h2Id = SectionTitle.toLowerCase().replace(/[0-9.]/g, "").trim().replace(/ /g, "-");
  const _accordionId = (accordionId || SectionTitle).replace(/[\s!]/gi, '_').toLowerCase();

  console.log("_accordionId: ", _accordionId);
  console.log("_h2Id: ", _h2Id);
  console.log("h2Id: ", h2Id)

  const copyLessonUrlWithAnchorTag = () => {
    let url = window.location.href;
    const currentSectionInView = router.asPath.split("#").at(-1);

    if (!(currentSectionInView === _accordionId)) {
      url = `${window.location.origin}/lessons/${router.query.loc}/${router.query.id}#${h2Id}`;
    }

    navigator.clipboard.writeText(url);
  };

  return (
    <Accordion
      initiallyExpanded={initiallyExpanded}
      id={_accordionId}
      className={`SectionHeading ${SectionTitle.replace(/[\s!]/gi, '_').toLowerCase()} ${className} collapsibleLessonSection`}
      buttonClassName={`btn ${highlighted ? '' : 'btn-primary-light'} w-100 text-left`}
      highlighted={highlighted}
      button={(
        <div className={`SectionHeading ${SectionTitle.replace(/[\s!]/gi, '_').toLowerCase()} container position-relative text-black d-flex justify-content-between align-items-center py-1`}>
          <h2
            ref={ref}
            className='m-0'
            style={{ width: '100%', overflowWrap: 'break-word' }}
          >
            {SectionTitle}
          </h2>
          <div className='d-flex'>
            <i className="fs-3 bi-chevron-down" style={{ fontSize: "25px" }} />
            <i className="fs-3 bi-chevron-up" style={{ fontSize: "25px" }} />
            <CopyableTxt
              implementLogicOnClick={copyLessonUrlWithAnchorTag}
              copyTxtIndicator='Copy link.'
              txtCopiedIndicator='Link copied ✅!'
              copyTxtModalDefaultStyleObj={{
                position: 'fixed',
                width: '130px',
                backgroundColor: '#212529',
                textAlign: 'center',
              }}
              parentClassName='pointer d-flex justify-content-center align-items-center'
              txtClassName='text-white w-100 h-100 d-inline-flex justify-content-center align-items-center p-0 m-0 text-transform-default'
              additiveYCoord={-20}
            >
              <i className="bi bi-clipboard ms-2 ms-sm-4" style={{ fontSize: "25px" }} />
            </CopyableTxt>
          </div>
          <div id={h2Id} style={{ height: 30, width: 30, transform: scrollToTranslateVal }} className='position-absolute' />
          <div id={_h2Id} style={{ height: 30, width: 30, transform: scrollToTranslateVal }} className='position-absolute' />
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
