import Marquee from 'react-marquee-slider';
import sponsors from '../data/HireUsPg/clientFundingSourcesPics.json';
import Image from 'next/image';

const _sponsors = [...sponsors].map((sponsorObj, index) => {
    if (index === 3) {
        return {
            ...sponsorObj,
            width: 280,
            height: 200,
        };
    };

    return {
        ...sponsorObj,
        width: 150,
        height: 150,
    };
});

const SponsorsMarquee = () => {
    return (
        <Marquee velocity={45}>
            {_sponsors.map((sponsorObj, index) => {
                const _style = (index === 3) ? { width: sponsorObj.width, height: sponsorObj.height, transform: 'translateY(25px)' } : { width: sponsorObj.width, height: sponsorObj.height };

                return (
                    <div key={index} className='h-100 d-flex justify-content-center align-items-center'>
                        <div
                            style={_style}
                            className="me-5 position-relative"
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