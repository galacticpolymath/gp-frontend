import Image from "next/legacy/image";

const HireUsCardFirstSecMobile = ({ textsAndImg, isWhatWillYouGetSec, customCssClass }) => {
  const { boldedTxt, unBoldedText, imgPath } = textsAndImg;
  let imgSecClassName = 'pt-0 pt-sm-2 pt-md-0 mt-sm-2 mt-sm-0 d-flex justify-content-center align-items-center d-sm-block justify-sm-content-start align-sm-items-stretch';
  // ${(index === 2) ? "pe-4 pe-sm-0" : ""}
  let parentClassName = 'd-flex flex-sm-row flex-column HireUsCardFirstSecMobile';

  if (customCssClass) {
    parentClassName += ` ${customCssClass}`;
  }

  return (
    <section className={parentClassName}>
      <section className={imgSecClassName}>
        <Image
          src={imgPath}
          width={75}
          height={75}
          alt="Galactic_PolyMath_First_Sec_Mobile_Info"
        />
      </section>
      <section className="ms-sm-4 ms-md-1 mt-3 mt-sm-0 ps-3 pe-3 ps-sm-0 pe-sm-0">
        <span className="d-flex flex-column flex-sm-row d-sm-inline-block hireUsCardFirstSecTxt responsiveInfoTxt text-center text-sm-start pe-lg-2">
          <span className='bolder text-dark fst-italic hireUsCardBoldedTxt'>
            {boldedTxt}
          </span>{' '}
          {isWhatWillYouGetSec ? <span className='text-dark fwtHireUsCard d-flex d-sm-inline flex-column flex-row'><span className="hyphen">&#x2015;&#x2015;</span> <span className="whatWillYouGetTxtUnBolded">{unBoldedText}</span></span> : <span className='text-dark fwtHireUsCard'>{unBoldedText}</span>}
        </span>
      </section>
    </section>
  );
};

export default HireUsCardFirstSecMobile;