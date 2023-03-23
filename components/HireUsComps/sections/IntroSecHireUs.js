/* eslint-disable react/jsx-max-props-per-line */
import LetsTalkBtnContainer from '../buttons/LetsTalkBtnContainer';
// import Image from 'next/image';
import styles from '../../../pages/index.module.css';
import LayoutBackGroundImg from '../../../assets/img/1_northeast_merlot_darker.png';

const IntroSecHireUs = () => {
  return (
    <section className='d-flex flex-row parallax row introSecHireUsPg' style={{ backgroundImage: `url(${LayoutBackGroundImg.src})` }}>
      <section className="w-100 justify-content-center align-items-center d-none d-md-flex">
        <section className="d-none d-md-flex flex-column w-100 noMargin col-12 introSecAndLetTalksSec">
          <section className="d-flex flex-column w-100 justify-content-center align-items-center">
            <section className="w-100 ps-5">
              <h1 className={`${styles.shadow} headingHireUs`}>Easier, Classroom-Ready Outreach</h1>
            </section>
            <section className="w-100 ps-5 position-relative d-flex mt-lg-4 mt-lg-0 mb-4 mb-lg-0">
              <span className={`${styles.shadow} subTxtHeadingDesktop spanSubheader noMargin noPadding w-75`}>
                We translate your work so that non-experts can teach mind-opening lessons.
              </span>
            </section>
          </section>
          <section className="d-flex ps-md-5 letTalksMainBtnSec">
            <section className="introMainBtnInnerSec mt-3">
              <LetsTalkBtnContainer />
            </section>
          </section>
        </section>
      </section>
      <section className="d-flex d-md-none w-100 noMargin col-12 introSecAndLetTalksSec">
        <section className="w-100 d-flex justify-content-start align-items-stretch  flex-column justify-content-md-center align-items-md-center pt-4">
          <section className="headerSection">
            <h1 className={`${styles.shadow} headingHireUs noMargin`}>Easier,</h1>
            <h1 className={`${styles.shadow} headingHireUs noMargin`}>Classroom-ready</h1>
            <h1 className={`${styles.shadow} headingHireUs noMargin`}>Outreach</h1>
          </section>
          <section className="subTxtHeadingContainerHireUsPg w-75 ps-1 mt-2 mt-sm-4">
            <span className={`${styles.shadow} noMargin noPadding spanSubheader`}>
              We translate your work so that non-experts can teach mind-opening lessons.
            </span>
          </section>
          <section className="ps-0 ps-sm-1 pt-4 pt-md-5 letTalksMainBtnSec">
            <LetsTalkBtnContainer isMainBtn isNoUnderline />
          </section>
        </section>
      </section>
    </section>
  );
};

export default IntroSecHireUs;
