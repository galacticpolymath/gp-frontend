import Image from 'next/image';

const HireUsCardFirstSecMobile = ({ textsAndImg, isWhatWillYouGetSec, customCssClass, index }) => {
  const { boldedTxt, unBoldedText, imgPath } = textsAndImg;
  let imgSecClassName = 'pt-0 pt-sm-2 pt-md-0 d-flex justify-content-center align-items-center d-sm-block justify-sm-content-start align-sm-items-stretch';
  let parentClassName = 'd-flex flex-sm-row flex-column HireUsCardFirstSecMobile';
  let marginStartForTxtSec = (index !== 0) ? 'transformRightTxtSec' : '';

  if (customCssClass) {
    parentClassName += ` ${customCssClass}`;
  }

  return (
    <section className={parentClassName}>
      <section className={imgSecClassName}>
        <div style={{ width: 65, height: 65 }} className='position-relative'>
          <Image
            src={imgPath}
            fill
            alt="Galactic_PolyMath_First_Sec_Mobile_Info"
            style={{
              maxWidth: '100%',
              objectFit: 'contain',
            }}
          />
        </div>
      </section>
      <section className={`ms-sm-4 ms-md-0 mt-3 mt-sm-0 px-md-2 px-xl-0 ps-3 pe-3 ps-sm-0 pe-sm-0 ${marginStartForTxtSec}`}>
        <span className="d-flex flex-column flex-sm-row d-sm-inline-block hireUsCardFirstSecTxt responsiveInfoTxt text-center text-sm-start ps-xl-1">
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