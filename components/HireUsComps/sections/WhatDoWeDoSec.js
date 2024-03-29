import infoTxtsFirstSec from '../../../data/HireUsPg/infoTxtsFirstSec.json';
import HireUsCardFirstSecMobile from '../HireUsCardFirstSecMobile';

const WhatDoWeDoSec = () => {
  return (
    <section className="d-flex flex-column mb-5 whatDoWeDoParentSec">
      <section className="d-flex ps-sm-5 pe-sm-5">
        <h3 className="text-center text-sm-start w-100 text-sm-nowrap">
          What do we do?
        </h3>
      </section>
      <section className="pb-sm-4 pb-md-0 mt-3 ps-sm-5 pe-sm-5">
        <span className='d-sm-none bolder text-wrap text-dark text-center w-100 d-block responsiveInfoTxt'>
          We mobilize knowledge
        </span>
        <span className="hireUsCardIntroTxt d-inline-block text-center text-sm-start ps-3 pe-3 ps-sm-0 pe-sm-1">
          <span className='bolder text-sm-nowrap d-none d-sm-inline-block'>
            We mobilize knowledge
          </span>
          <span className='ms-2 fwtHireUsCard txtOnHireUsPg'>
            by turning our clients&apos; outreach goals into rich, open-access learning experiences.
          </span>
        </span>
      </section>
      <section className="d-none d-xl-block ps-5 pe-5 mt-2 mt-md-4">
        <div className="d-flex flex-row whatDoWeDoSec ps-3 pe-3">
          {infoTxtsFirstSec.map((textsAndImg, index) => (
            <HireUsCardFirstSecMobile
              key={index}
              textsAndImg={textsAndImg}
              customCssClass='weMobileKnowledgeSec'
              index={index}
            />
          ))}
        </div>
      </section>
      <section className="d-none d-md-block d-xl-none ps-5 pe-5 mt-md-4 mt-lg-5">
        <div className="d-flex justify-content-center flex-column whatDoWeDoSec align-items-center ps-3 pe-3">
          <section className="d-flex flex-column">
            <section className="w-100 d-flex justify-content-center align-items-center position-relative">
              {infoTxtsFirstSec.slice(0, 2).map((textsAndImg, index) => (
                <HireUsCardFirstSecMobile
                  key={index}
                  textsAndImg={textsAndImg}
                  customCssClass='weMobileKnowledgeSec topLevel'
                />
              ))}
            </section>
            <section className="w-100 d-flex justify-content-center align-items-center mt-md-5 mt-lg-3">
              <HireUsCardFirstSecMobile textsAndImg={infoTxtsFirstSec[2]} customCssClass='weMobileKnowledgeSec lastSec' />
            </section>
          </section>
        </div>
      </section>
      <section className="d-flex mt-4 d-md-none justify-content-center align-items-center mt-0 mt-md-5">
        <div className="d-flex d-md-none flex-column ps-sm-5 pe-sm-5 ms-4 me-4 ms-sm-5 me-sm-5 whatDoWeDoSec pb-5">
          {infoTxtsFirstSec.map((textsAndImg, index) => (
            <HireUsCardFirstSecMobile
              key={index}
              textsAndImg={textsAndImg}
              index={index}
            />
          ))}
        </div>
      </section>
    </section>
  );
};

export default WhatDoWeDoSec;
