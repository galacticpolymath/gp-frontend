/* eslint-disable quotes */
/* eslint-disable no-console */
/* eslint-disable react/jsx-max-props-per-line */
import PropTypes from 'prop-types';
import { useMemo, useRef } from 'react';
import useLessonElementInView from '../customHooks/useLessonElementInView';
import Accordion from './Accordion';
import CopyableTxt from './CopyableTxt';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { Collapse } from 'react-bootstrap';

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
  scrollToTranslateVal = 'translateY(-90px)',
  accordionStyleObj = {},
}) => {
  const ref = useRef();
  const router = useRouter();
  const [isAccordionContentOpen, setIsAccordionContentOpen] = useState(true);
  const { h2Id } = useLessonElementInView(_sectionDots, SectionTitle, ref, isAvailLocsMoreThan1);
  const _h2Id = SectionTitle.toLowerCase().replace(/[0-9.]/g, "").trim().replace(/ /g, "-");
  const _accordionId = (accordionId || SectionTitle).replace(/[\s!]/gi, '_').toLowerCase();

  const copyLessonUrlWithAnchorTag = () => {
    let url = window.location.href;
    const currentSectionInView = router.asPath.split("#").at(-1);

    if (!(currentSectionInView === _accordionId)) {
      url = `${window.location.origin}/lessons/${router.query.loc}/${router.query.id}#${_h2Id}`;
    }

    navigator.clipboard.writeText(url);
  };

  const checkIfElementClickedWasClipboard = parentElement => {
    if (parentElement.nodeName.toLowerCase() === 'body') {
      console.log("Clip board icon wasn't clicked...");
      return false;
    }

    if (parentElement.id === 'clipboardIconWrapper') {
      console.log('clip board icon was clicked...');
      return true;
    }

    return checkIfElementClickedWasClipboard(parentElement.parentElement);
  };

  const handleAccordionBtnClick = event => {
    const wasClipboardIconClicked = checkIfElementClickedWasClipboard(event.target);

    if (wasClipboardIconClicked) {
      return;
    }

    setIsAccordionContentOpen(isAccordionContentOpen => !isAccordionContentOpen);
  };

  const cssSectionClassName = useMemo(() => SectionTitle.split(" ").filter((_, index) => index !== 0).join("_"), []);

  return (
    <Accordion
      initiallyExpanded={initiallyExpanded}
      id={_accordionId}
      className={`SectionHeading ${cssSectionClassName} ${SectionTitle.replace(/[\s!]/gi, '_').toLowerCase()} ${className} collapsibleLessonSection`}
      buttonClassName={`btn ${highlighted ? '' : 'btn-primary-light'} w-100 text-left`}
      highlighted={highlighted}
      dataBsToggle={{}}
      ariaExpanded={isAccordionContentOpen}
      handleOnClick={handleAccordionBtnClick}
      style={accordionStyleObj}
      button={(
        <div
          className={`SectionHeading ${SectionTitle.replace(/[\s!]/gi, '_').toLowerCase()} container position-relative text-black d-flex justify-content-between align-items-center py-1`}
        >
          <h2
            ref={ref}
            className='m-0'
            style={{ width: '100%', overflowWrap: 'break-word' }}
          >
            {SectionTitle}
          </h2>
          <div className='d-flex'>
            {isAccordionContentOpen ?
              <i className="fs-3 bi-chevron-up" style={{ fontSize: "25px", display: 'block' }} />
              :
              <i className="fs-3 bi-chevron-down" style={{ fontSize: "25px", display: 'block' }} />
            }
            <div id='clipboardIconWrapper' className='ms-2 ms-sm-4 d-flex justify-content-center align-items-center'>
              <CopyableTxt
                implementLogicOnClick={copyLessonUrlWithAnchorTag}
                copyTxtIndicator='Copy link to section.'
                txtCopiedIndicator='Link copied ✅!'
                copyTxtModalDefaultStyleObj={{
                  position: 'fixed',
                  width: '140px',
                  backgroundColor: '#212529',
                  textAlign: 'center',
                  zIndex: 100000,
                }}
                modalClassNameStr='position-fixed rounded p-0 m-0'
                parentClassName='pointer d-flex justify-content-center align-items-center'
                txtClassName='text-white w-100 h-100 d-inline-flex justify-content-center align-items-center p-0 m-0 text-transform-default'
                additiveYCoord={-25}
              >
                <i className="bi bi-clipboard" style={{ fontSize: "25px" }} />
              </CopyableTxt>
            </div>
          </div>
          <div id={h2Id} style={{ height: 30, width: 30, transform: scrollToTranslateVal }} className='position-absolute' />
          <div id={_h2Id} style={{ height: 30, width: 30, transform: scrollToTranslateVal }} className='position-absolute' />
        </div>
      )}
    >
      <Collapse in={isAccordionContentOpen}>
        {children}
      </Collapse>
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
