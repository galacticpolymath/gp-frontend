import { useMemo, useEffect, useRef, useState } from 'react';
import { AiOutlineArrowLeft, AiOutlineArrowRight } from 'react-icons/ai';
import Button from './General/Button';

const DefaultDot = ({
  handleOnClick,
  backgroundColor = 'transparent',
  style = {
    width: '10px',
    height: '10px',
  },
}) => {
  return (
    <i
      onClick={handleOnClick}
      style={{ ...style, backgroundColor }}
      className="sectionNavDot pointer"
    />
  );
};

const CarouselContainer = ({
  children,
  parentStylesClassName = 'p-0 display-flex flex-column autoCarouselContainer',
  defaultArrowSize = 60,
  CustomDots = null,
  handleCustomRightArrowBtnClick,
  handleCustomLeftArrowBtnClick,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [wasTimerPaused, setWasTimerPaused] = useState(false);
  const timeoutCarouselScrollRef = useRef(null);
  const timeoutCarouselPauseRef = useRef(null);

  const dots = useMemo(() => {
    if (!CustomDots) {
      return new Array(children.length).fill();
    }
  }, []);

  const resetTimeout = () => {
    if (timeoutCarouselScrollRef.current) {
      clearTimeout(timeoutCarouselScrollRef.current);
    }
  };

  const pauseAutoScroll = () => {
    clearTimeout(timeoutCarouselPauseRef.current);
    resetTimeout();
    setWasTimerPaused(true);
    timeoutCarouselPauseRef.current = setTimeout(() => {
      setWasTimerPaused(false);
    }, 5000);
  };

  const getUpdatedCurrentIndexStateNum = currentIndex => (currentIndex === (children.length - 1)) ? 0 : currentIndex + 1;

  const handleRightArrowBtnClick = () => {
    pauseAutoScroll();
    setCurrentIndex(getUpdatedCurrentIndexStateNum);
  };

  const handleLeftArrowBtnClick = () => {
    pauseAutoScroll();
    setCurrentIndex(getUpdatedCurrentIndexStateNum);
  };

  const handleDotClick = index => () => {
    pauseAutoScroll();
    setCurrentIndex(index);
  };

  useEffect(() => {
    if (!wasTimerPaused) {
      resetTimeout();
      timeoutCarouselScrollRef.current = setTimeout(
        () => setCurrentIndex(getUpdatedCurrentIndexStateNum),
        3000
      );
    }
  }, [currentIndex, wasTimerPaused]);

  return (
    <div className={parentStylesClassName}>
      <div
        style={{ zIndex: 110 }}
        className="w-auto h-100 d-flex justify-content-center align-items-center position-absolute start-0"
      >
        <Button
          classNameStr='no-btn-styles'
          handleOnClick={handleCustomLeftArrowBtnClick ?? handleLeftArrowBtnClick}
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
          handleOnClick={handleCustomRightArrowBtnClick ?? handleRightArrowBtnClick}
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
      <section className='d-flex justify-content-center align-items-center'>
        {(dots?.length && !CustomDots)
          ?
          (
            dots.map((_, index) => (
              <DefaultDot
                key={index}
                handleOnClick={handleDotClick(index)}
                style={{ width: '20px', height: '20px' }}
                backgroundColor={(currentIndex === index) ? '#3283C3' : 'transparent'}
              />
            ))
          )
          :
          !!CustomDots && CustomDots
        }
      </section>
    </div>
  );
};

export default CarouselContainer;