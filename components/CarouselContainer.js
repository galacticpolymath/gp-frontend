import { useState } from 'react';
import { AiOutlineArrowLeft, AiOutlineArrowRight } from 'react-icons/ai';
import Button from './General/Button';


const CarouselContainer = ({
  children,
  parentStylesClassName = 'p-0 display-flex flex-column autoCarouselContainer',
  defaultArrowSize = 60

}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleRightArrowBtnClick = () => {
    setCurrentIndex(prevState => prevState + 1);
  };

  const handleLeftArrowBtnClick = () => {
    setCurrentIndex(prevState => prevState - 1);
  };

  return (
    <div className={parentStylesClassName}>
      <div
        style={{ zIndex: 110 }}
        className="w-auto h-100 d-flex justify-content-center align-items-center position-absolute start-0"
      >
        <Button
          classNameStr='no-btn-styles'
          handleOnClick={handleLeftArrowBtnClick}
        >
          <AiOutlineArrowLeft size={defaultArrowSize} />
        </Button>
      </div>
      <div
        style={{ zIndex: 110 }}
        className="w-auto h-100 d-flex justify-content-center align-items-center position-absolute end-0"
      >
        <Button
          classNameStr='no-btn-styles'
          handleOnClick={handleRightArrowBtnClick}
        >
          <AiOutlineArrowRight size={defaultArrowSize} />
        </Button>
      </div>
        <section className='row mt-0'>
          <section
            style={{ height: 'fit-content' }}
            className="col-12 mt-0 px-4"
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
  );
};

export default CarouselContainer;