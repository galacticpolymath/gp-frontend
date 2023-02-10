/* eslint-disable no-multi-spaces */
/* eslint-disable react/jsx-first-prop-new-line */
/* eslint-disable react/jsx-closing-bracket-location */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable semi */
/* eslint-disable react/jsx-closing-tag-location */
/* eslint-disable prefer-template */
/* eslint-disable comma-dangle */
/* eslint-disable quotes */
/* eslint-disable no-multiple-empty-lines */
/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unknown-property */
/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable object-curly-spacing */
/* eslint-disable indent */
/* eslint-disable react/jsx-indent */
import { Parallax } from 'react-parallax';
import LetsTalkBtnContainer from "./buttons/LetsTalkBtnContainer"
import ClassRoom2 from '../../public/imgs/classroom2.jpg';

const ReadyToInspireSec = () => {
    return (
        <section className='readyToInspireParentSec mt-5'>
            <div className="readyToInspireSec pt-5 d-lg-flex flex-lg-row-reverse">
                <section className="mt-2 d-flex d-md-block readyToInspireImgSec">
                    <Parallax bgImage={ClassRoom2.src} className="readyToInspireImg" contentClassName='classRoom2ContentStyles position-relative' />
                </section>
                <section className="readyToInspireTxtsSec pt-md-2 pt-sm-0 pt-4">
                    <section className="ps-sm-5 ps-md-0 mt-3 mt-sm-4 mt-md-2 mt-lg-0 d-flex flex-column readyInspireSec">
                        <span className="fs-24 d-block fw700 d-none d-sm-inline d-md-none">Ready to inspire students with</span>
                        <span className="fs-24 d-block fw700 d-none d-sm-inline d-md-none">your work?</span>
                        <span className="fs-24 d-block fw700 d-none d-md-inline text-start">Ready to inspire students with your work?</span>
                        <span className="fs-24 d-block fw700 d-inline d-sm-none text-center ps-2 pe-2">Ready to inspire students with your work?</span>
                    </section>
                    <section className="ps-sm-5 ps-md-0 mt-4 d-flex flex-column orderLaCarteSec">
                        <span className="fs-med d-none fw249 d-sm-inline d-lg-none">Order <span className="fst-italic">à la carte</span> or customize a package.</span>
                        <span className="fs-med d-none fw249 d-sm-inline d-lg-none">Let us know how we can help!</span>
                        <span className="fs-med fw249 d-none d-lg-inline text-center ps-5 ps-sm-0 pe-5 pe-sm-0">Order <span className="fst-italic">à la carte</span> or customize a package. Let us know how we can help!</span>
                        <span className="fs-med d-block fw249 d-sm-none text-center ps-5 ps-sm-0 pe-5 pe-sm-0">Let us know how we can help! Order <span className="fst-italic">à la carte</span> or customize a package.</span>
                    </section>
                    <section className="d-none d-lg-flex mt-5">
                        <LetsTalkBtnContainer />
                    </section>
                </section>
                <section className="mt-4 mb-4 d-flex d-sm-block justify-content-center align-items-center justify-content-sm-start align-items-sm-stretch ps-sm-5 d-flex d-lg-none pb-5">
                    <LetsTalkBtnContainer />
                </section>
            </div>
        </section>
    )
}


export default ReadyToInspireSec;