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
            <div className="readyToInspireSec pt-5">
                <section className="mt-2 d-flex d-md-none">
                    <Parallax bgImage={ClassRoom2.src} className="img-background-container" contentClassName='classRoom2ContentStyles position-relative' />
                </section>
                <section className="ps-sm-5 mt-5 mt-sm-4 d-flex flex-column d-md-none">
                    <span className="fs-24 d-block fw700 d-none d-sm-inline">Ready to inspire students with</span>
                    <span className="fs-24 d-block fw700 d-none d-sm-inline">your work?</span>
                    <span className="fs-24 d-block fw700 d-inline d-sm-none text-center ps-2 pe-2">Ready to inspire students with your work?</span>
                </section>
                <section className="ps-sm-5 mt-4 d-flex flex-column d-md-none">
                    <span className="fs-med d-block fw249 d-none d-sm-inline">Order à la carte or customize a package.</span>
                    <span className="fs-med d-block fw249 d-none d-sm-inline">Let us know how we can help!</span>
                    <span className="fs-med d-block fw249 d-inline d-sm-none text-center ps-5 ps-sm-0 pe-5 pe-sm-0">Let us know how we can help! Order à la carte or customize a package.</span>
                </section>
                <section className="mt-4 mb-4 d-flex d-sm-block justify-content-center align-items-center justify-content-sm-start align-items-sm-stretch ps-sm-5 d-flex d-md-none pb-5">
                    <LetsTalkBtnContainer isInReadyToInspireSec />
                </section>
            </div>
        </section>
    )
}


export default ReadyToInspireSec;