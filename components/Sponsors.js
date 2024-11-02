import Marquee from 'react-marquee-slider';
import sponsors from '../data/HireUsPg/clientFundingSourcesPics.json';
import Image from 'next/image';

const _sponsors = [...sponsors].map((sponsorObj, index) => {
  if (index === 3) {
    return {
      ...sponsorObj,
      width: 291,
      height: 150,
    };
  }

  if (index === 4) {
    return {
      ...sponsorObj,
      width: 95,
      height: 150,
    };
  }

  return {
    ...sponsorObj,
    width: 150,
    height: 150,
  };
});

const computeDimension = (dimension, decimal) => {
  return Math.floor(dimension - (dimension * decimal));
};

const SponsorsMarquee = ({ velocityNum = 45, decimal = 0, parentContainerCss = 'd-flex justify-content-center align-items-center' }) => {
  return (
    <Marquee velocity={velocityNum}>
      {_sponsors.map((sponsorObj, index) => {
        let _style = (index === 3) ?
          { width: computeDimension(sponsorObj.width, decimal), height: computeDimension(sponsorObj.height, decimal) }
          :
          { width: computeDimension(sponsorObj.width, decimal), height: computeDimension(sponsorObj.height, decimal) };

        return (
          <div
            key={index}
            className={parentContainerCss}
          >
            <div
              style={{ ..._style }}
              className="position-relative me-5"
            >
              <Image
                alt={sponsorObj.alt}
                src={sponsorObj.path}
                fill
              />
            </div>
          </div>
        );
      }
      )}
    </Marquee>
  );
};

export default SponsorsMarquee;