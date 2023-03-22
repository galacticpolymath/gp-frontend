import { Parallax } from 'react-parallax';
import LetsTalkBtnContainer from './buttons/LetsTalkBtnContainer';
import ClassRoom2 from '../../public/imgs/classroom2.jpg';

const ReadyToInspireSec = () => {
  return (
    <section className='readyToInspireParentSec mt-5'>
      <div className="readyToInspireSec pt-5 d-lg-flex flex-lg-row-reverse">
        <section className="mt-2 d-flex d-md-block readyToInspireImgSec">
          <Parallax
            bgImage={ClassRoom2.src}
            className="readyToInspireImg"
            contentClassName='classRoom2ContentStyles position-relative'
          />
        </section>
        <section className="readyToInspireTxtsSec pt-md-2 pt-sm-0 pt-4 d-md-flex justify-content-md-center align-items-md-center flex-md-column pe-lg-3 pe-xl-0">
          <section className="ps-sm-5 ps-md-0 mt-3 mt-sm-4 mt-md-2 mt-lg-0 d-flex flex-column readyInspireSec">
            <span className="fs-24 d-block fw700 d-none d-sm-inline d-md-none">Ready to inspire students with</span>
            <span className="fs-24 d-block fw700 d-none d-sm-inline d-md-none">your work?</span>
            <span className="fs-24 d-block fw700 d-none d-md-inline-flex justify-content-md-center align-items-md-center text-center text-lg-start d-lg-inline">Ready to inspire students with your work?</span>
            <span className="fs-24 d-block fw700 d-inline d-sm-none text-center text-lg-start ps-2 pe-2">Ready to inspire students with your work?</span>
          </section>
          <section className="ps-sm-5 ps-md-0 mt-4 d-flex flex-column orderLaCarteSec">
            <span className="d-none fw249 d-sm-inline d-md-inline-flex justify-content-md-center text-md-center text-lg-start align-items-md-center d-lg-none">Order <span className="fst-italic mx-md-2 mx-lg-0">à la carte</span> or customize a package.</span>
            <span className="d-none fw249 d-sm-inline d-md-inline-flex justify-content-md-center align-items-md-center d-lg-none">Let us know how we can help!</span>
            <span className="fw249 d-none d-lg-inline text-center text-lg-start ps-5 ps-sm-0 pe-5 pe-sm-0">Order <span className="fst-italic">à la carte</span> or customize a package. Let us know how we can help!</span>
            <span className="d-block fw249 d-sm-none text-center text-lg-start ps-5 ps-sm-0 pe-5 pe-sm-0">Let us know how we can help! Order <span className="fst-italic">à la carte</span> or customize a package.</span>
          </section>
          <section className="d-none d-lg-flex mt-5 letsTalkBtnSec">
            <LetsTalkBtnContainer />
          </section>
        </section>
        <section className="mt-4 mb-4 d-flex d-sm-block justify-content-center align-items-center justify-content-sm-start align-items-sm-stretch ps-sm-5 ps-md-0 d-md-flex d-lg-none pb-5 justify-content-md-center align-items-md-center ps-lg-5">
          <LetsTalkBtnContainer />
        </section>
      </div>
    </section>
  );
};

export default ReadyToInspireSec;