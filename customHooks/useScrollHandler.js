import { useEffect } from 'react';
import throttle from 'lodash.throttle';
import { useState } from 'react';

export const getPercentageSeen = element => {
  // Get the relevant measurements and positions
  const viewportHeight = window.innerHeight;
  const scrollTop = window.scrollY;
  const elementOffsetTop = element.offsetTop;
  const elementHeight = element.offsetHeight;

  // Calculate percentage of the element that's been seen
  const distance = scrollTop + (viewportHeight - elementOffsetTop);
  const percentage = (100 - Math.round(distance / ((viewportHeight + elementHeight) / 100)));

  // Restrict the range to between 0 and 100
  return Math.min(100, Math.max(0, percentage));
};

const useScrollHandler = setSectionDots => {
  const [isScrollListenerOn, setIsScrollListenerOn] = useState(true);

  const scrollAction = throttle(() => {
    const scrollElems = Array.prototype.slice.call(
      document.querySelectorAll('.SectionHeading')
    );

    if (scrollElems.length === 0) {
      return;
    }

    let viewPortPercentOfElems = scrollElems.map(elem => {
      let liNavDotId;

      if (elem.classList[elem.classList.length - 1] === 'lessonTitleId') {
        liNavDotId = 'lessonTitleId';
      }

      for (let index = 0; index < elem.classList.length; index++) {
        const className = elem.classList[index];
        if (/\d+\./.test(className)) {
          liNavDotId = className;
          break;
        }
      }

      const percent = getPercentageSeen(elem);
      const _percentageInViewPort = ((percent === 100) || (percent === 0)) ? 0 : percent;
      return { percentageInViewPort: _percentageInViewPort, elemId: elem.id, sectionDotId: `sectionDot-${liNavDotId}` };
    });

    viewPortPercentOfElems = viewPortPercentOfElems.filter(({ percentageInViewPort }) => ((percentageInViewPort > 0) && (percentageInViewPort < 100)));
    const elemsThatAreInView = viewPortPercentOfElems.filter(({ elemId }) => elemId);
    const elemTakingUpMostOfViewport = elemsThatAreInView.reduce((prev, curr) => (prev.percentageInViewPort > curr.percentageInViewPort) ? prev : curr);

    setSectionDots(sectionDots => {
      return {
        ...sectionDots,
        dots: sectionDots.dots.map(dot => {
          if (dot.sectionDotId === elemTakingUpMostOfViewport.sectionDotId) {
            return {
              ...dot,
              isInView: true,
            };
          }

          return {
            ...dot,
            isInView: false,
          };
        }),
      };
    });
  }, 100);

  const handleScroll = () => {
    scrollAction();
  };

  useEffect(() => {
    if (isScrollListenerOn) {
      window.addEventListener('scroll', handleScroll);
      console.log('scroll listener was added.');
    }

    if (!isScrollListenerOn) {
      window.removeEventListener('scroll', handleScroll);
      console.log('scroll listener was removed.');
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      console.log('event listener was removed.');
    };
  }, [isScrollListenerOn]);

  return [isScrollListenerOn, setIsScrollListenerOn];
};

export default useScrollHandler;