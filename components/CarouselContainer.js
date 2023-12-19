import { useState } from 'react';
import { AiOutlineArrowLeft, AiOutlineArrowRight } from 'react-icons/ai';
import Button from './General/Button';
import { useMemo } from 'react';

// BRAIN DUMP NOTES:
// when the user clicks on a dot, take the user to that specific 
// element on the carousel, 
// have each dot be a number
// when it is clicked, update the currentIndex state
// each dot is render onto the UI, the Dot component
// is used to render the dot
// when a dot is clicked, update the currentIndex state with that dot's number? 
// how many dots should be rendered? 
// should be based on the length of the children
// get the length of the children 
// create an array that contains nulls
// map the array onto the dom using the Dot component
// for each render, get their corresponding index
// pass it as a prop for the Dot component 
// for the handleOnClick function, get the corresponding index
// and update currentIndex state 

const DefaultDot = ({
  handleOnClick,
  backgroundColor = "transparent",
  style = {
    width: "10px",
    height: "10px"
  },
}) => {
  return (
    <i
      onClick={handleOnClick}
      style={{ ...style, backgroundColor }}
      className="sectionNavDot pointer"
    />
  )
}


const CarouselContainer = ({
  children,
  parentStylesClassName = 'p-0 display-flex flex-column autoCarouselContainer',
  defaultArrowSize = 60,
  CustomDots = null

}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const dots = useMemo(() => {
    if (!CustomDots) {
      return new Array(children.length).fill();
    };
  }, []);

  const handleRightArrowBtnClick = () => {
    setCurrentIndex(prevState => prevState + 1);
  };

  const handleLeftArrowBtnClick = () => {
    setCurrentIndex(prevState => prevState - 1);
  };

  const handleDotClick = index => () => {
    setCurrentIndex(index);
  }


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
      <section className='d-flex justify-content-center align-items-center'>
        {(dots?.length && !CustomDots)
          ?
          (
            dots.map((_, index) => (
              <DefaultDot
                key={index}
                handleOnClick={handleDotClick(index)}
                style={{ width: "20px", height: "20px" }}
                backgroundColor={(currentIndex === index) ? "#3283C3" : "transparent"}
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