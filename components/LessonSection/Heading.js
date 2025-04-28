/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable quotes */
/* eslint-disable no-console */
import PropTypes from 'prop-types';
import { useRef } from 'react';
import useLessonElementInView from '../../customHooks/useLessonElementInView';
import CopyableTxt from '../CopyableTxt';
import { useRouter } from 'next/router';
import { UNITS_URL_PATH } from '../../shared/constants';

const Heading = ({ SectionTitle, _sectionDots, isAvailLocsMoreThan1 }) => {
  const ref = useRef();
  const router = useRouter();
  const { h2Id } = useLessonElementInView(_sectionDots, SectionTitle, ref, isAvailLocsMoreThan1);

  const copyLessonUrlWithAnchorTag = () => {
    let url = window.location.href;
    const currentSectionInView = router.asPath.split("#").at(-1);

    if (!(currentSectionInView === h2Id)) {
      url = `${window.location.origin}/${UNITS_URL_PATH}/${router.query.loc}/${router.query.id}#${h2Id}`;
    }

    navigator.clipboard.writeText(url);
  };

  return (
    <div
      ref={ref}
      className='lessonsStandardsSec text-left bg-primary-light mb-4'
    >
      <div>
        <div className='position-relative'>
          <h2
            className="mb-0"
          >
            <div className='container mx-auto text-black d-flex justify-content-between align-items-center'>
              {SectionTitle}
              <CopyableTxt
                implementLogicOnClick={copyLessonUrlWithAnchorTag}
                copyTxtIndicator='Copy link.'
                txtCopiedIndicator='Link copied ✅!'
                copyTxtModalDefaultStyleObj={{
                  position: 'fixed',
                  width: '130px',
                  height: "30px",
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: '#212529',
                  textAlign: 'center',
                }}
                additiveYCoord={-20}
                txtStyleObj={{ fontSize: 12 }}
              >
                <i className="bi bi-clipboard ms-4" style={{ fontSize: "25px" }} />
              </CopyableTxt>
            </div>
          </h2>
          <div id={h2Id} style={{ height: 30, width: 30, transform: 'translateY(-180px)' }} className='position-absolute' />
        </div>
      </div>
    </div>
  );
};

Heading.propTypes = {
  index: PropTypes.number,
  SectionTitle: PropTypes.string,
};

export default Heading;