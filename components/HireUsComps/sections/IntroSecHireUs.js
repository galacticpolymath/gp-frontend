/* eslint-disable no-multiple-empty-lines */
/* eslint-disable quotes */
/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable no-console */
/* eslint-disable react/jsx-first-prop-new-line */
/* eslint-disable react/jsx-closing-bracket-location */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable semi */
/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unknown-property */
/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable object-curly-spacing */
/* eslint-disable indent */
/* eslint-disable react/jsx-indent */

import LetsTalkBtnContainer from "../buttons/LetsTalkBtnContainer"
import styles from '../../../pages/index.module.css';
import LayoutBackGroundImg from '../../../assets/img/1_northeast_merlot_darker.png';

const IntroSecHireUs = () => {
    return (
        <section className='d-flex flex-row parallax row introSecHireUsPg' style={{ backgroundImage: `url(${LayoutBackGroundImg.src})` }}>
            <section className="w-100 d-flex justify-content-center align-items-center d-none d-md-flex">
                <section className="d-none d-md-flex w-100 noMargin col-12 introSecAndLetTalksSec">
                    <section className="d-flex flex-column w-100 justify-content-center align-items-center">
                        <section className="w-100 ps-5">
                            <h1 className={`${styles.shadow} display-1 headingHireUs`}>Easier, Classroom-Ready Outreach</h1>
                        </section>
                        <section className="w-100 ps-5 position-relative d-flex mt-4">
                            <span className={`${styles.shadow} display-6 noMargin noPadding w-75 subTxtHeadingDesktop`}>
                                We translate your work so that non-experts can teach mind-opening lessons.
                            </span>
                            <LetsTalkBtnContainer isMainBtn isAbsolute cssClasses='mainBtnAboveMobile d-none d-md-flex' />
                        </section>
                    </section>
                    <section className="d-flex d-md-none align-items-end justify-content-end letTalksMainBtnSec">
                        <LetsTalkBtnContainer isMainBtn />
                    </section>
                </section>
            </section>
            {/* for mobile */}
            <section className="d-flex d-md-none w-100 noMargin col-12 introSecAndLetTalksSec">
                <section className="w-100 d-flex flex-column align-items-center pt-4">
                    <section className="headerSection">
                        <h1 className={`${styles.shadow} display-1 headingHireUs noMargin`}>Easier,</h1>
                        <h1 className={`${styles.shadow} display-1 headingHireUs noMargin`}>Classroom-ready</h1>
                        <h1 className={`${styles.shadow} display-1 headingHireUs noMargin`}>Outreach</h1>
                    </section>
                    <section className="subTxtHeadingContainerHireUsPg w-75 ps-1 mt-4">
                        <span className={`${styles.shadow} display-6 noMargin noPadding`}>
                            We translate your work so that non-experts can teach mind-opening lessons.
                        </span>
                    </section>
                    <section className="ps-0 ps-sm-1 pt-4 pt-sm-5">
                        <LetsTalkBtnContainer isMainBtn isNoUnderline />
                    </section>
                </section>
            </section>
        </section>
    )
}

export default IntroSecHireUs;

