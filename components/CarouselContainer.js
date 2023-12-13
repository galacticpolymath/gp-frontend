import { useState } from "react";

const CarouselContainer = ({ children, parentStylesClassName = 'shadow rounded p-0 display-flex flex-column justify-content-center autoCarouselContainer' }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    return (
        <div className={parentStylesClassName}>
            <section className='row mt-0'>
                <section
                    style={{ height: 'fit-content' }}
                    className="col-12 mt-0"
                >
                    <div
                        className="autoCarouselSlider mt-0"
                        style={{ transform: `translate3d(${-currentIndex * 100}%, 0, 0)` }}
                    >
                        {children}
                    </div>
                </section>
            </section>
        </div>
    )
};


export default CarouselContainer;