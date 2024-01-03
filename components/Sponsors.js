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
    };

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

const SponsorsMarquee = ({ velocityNum = 45 }) => {
    return (
        <Marquee velocity={velocityNum} >
            {_sponsors.map((sponsorObj, index) => {
                let _style = (index === 3) ? { width: sponsorObj.width, height: sponsorObj.height } : { width: sponsorObj.width, height: sponsorObj.height };

                return (
                    <div key={index} className='d-flex justify-content-center align-items-center'>
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
    )
};

export default SponsorsMarquee