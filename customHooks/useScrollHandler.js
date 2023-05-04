import { useEffect } from 'react';
import throttle from "lodash.throttle";
import { useState } from 'react';

const getOffset = function (element) {
    let top = 0;
    do {
        top += element.offsetTop || 0;
        element = element.offsetParent;
    } while (element);

    return top;
};

const getPercentageSeen = element => {
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


const scrollDown = function (cursorBottom, elemOffsets, elemIds) {
    // you have the offset tops. find nearest one above current position by..
    // filtering out the ones below it and taking the last elem
    // filter:
    const removeBelow = elemOffsets.filter(function (x) {
        return x < cursorBottom - window.innerHeight / 4;
    });
    const index = removeBelow.length > 0 ? removeBelow.length - 1 : 0;

    console.log('index: ', index)

    console.log('elemIds: ', elemIds)

    // activateDot(index, elemIds);
};

const useScrollHandler = setSectionDots => {
    const [isScrollListenerOn, setIsScrollListenerOn] = useState(true);
    let lastOffset = typeof window !== 'undefined' ? window.pageYOffset : 0;


    const activateDot = function (index, elemIds) {
        const activeNodeid = elemIds[index];

        console.log('activeNodeid: ', activeNodeid)

        // const activeNode = document.querySelector(`.${activeNodeid}`);

        // if (!activeNode || !activeNode.classList.contains("activeDot")) {
        //   activeNode && activeNode.classList.add("activeDot");
        // }

        // let notActive = elemIds.slice();
        // notActive.splice(index, 1);
        // notActive.forEach((id) => {
        //   let div = document.querySelector(`.${id}`);
        //   div && div.classList.remove("activeDot");
        // });
    };



    const scrollUp = function (cursorTop, elemOffsets, elemIds) {
        const removeBelow = elemOffsets.filter(function (x) {
            return x < cursorTop + window.innerHeight / 4;
        });
        const index = removeBelow.length > 0 ? removeBelow.length - 1 : 0;

    };

    const scrollAction = throttle(() => {
        const scrollElems = Array.prototype.slice.call(
            document.querySelectorAll(".SectionHeading")
        );
        
        if(scrollElems.length === 0){
            return
        }


        let viewPortPercentOfElems = scrollElems.map(elem => {
            let liNavDotId;

            if (elem.classList[elem.classList.length - 1] === 'lessonTitleId') {
                liNavDotId = 'lessonTitleId'
            }

            for (let index = 0; index < elem.classList.length; index++) {
                const className = elem.classList[index];
                if (/\d+\./.test(className)) {
                    liNavDotId = className
                    break
                }
            }


            const percent = getPercentageSeen(elem);
            const _percentageInViewPort = (percent === 100) || (percent === 0) ? 0 : percent
            return { percentageInViewPort: _percentageInViewPort, elemId: elem.id, sectionDotId: `sectionDot-${liNavDotId}` }
        })

        viewPortPercentOfElems = viewPortPercentOfElems.filter(({ percentageInViewPort }) => ((percentageInViewPort > 0) && (percentageInViewPort < 100)))
        const elemsThatAreInView = viewPortPercentOfElems.filter(({ elemId }) => elemId)
        console.log('elemsThatAreInView: ', elemsThatAreInView)
        console.log('viewPortPercentOfElems: ', viewPortPercentOfElems)
        const elemTakingUpMostOfViewport = elemsThatAreInView.reduce((prev, curr) => (prev.percentageInViewPort > curr.percentageInViewPort) ? prev : curr)
        setSectionDots(sectionDots => {
            return {
                ...sectionDots,
                dots: sectionDots.dots.map(dot => {
                    if(dot.sectionDotId === elemTakingUpMostOfViewport.sectionDotId){
                        return {
                            ...dot,
                            isInView: true
                        }
                    }

                    return {
                        ...dot,
                        isInView: false
                    }
                })
            }
        })
    }, 100);

    const handleScroll = () => {
        console.log('scrolling')
        scrollAction()
        // throttle(() => scrollAction(), 100)
    }

    const [wasRendered, setWasRendered] = useState(false);

    // when the user clicks on the dot, remove the event listener
    useEffect(() => {
        if(isScrollListenerOn){
            window.addEventListener("scroll", handleScroll);
            console.log('scroll listener was added.')
        }

        if(!isScrollListenerOn){
            window.removeEventListener("scroll", handleScroll);
            console.log('scroll listener was removed.')
        }

        return () => {
            window.removeEventListener("scroll", handleScroll);
            console.log('event listener was removed.')
        };
    }, [isScrollListenerOn]);

    return [isScrollListenerOn, setIsScrollListenerOn];


}

export default useScrollHandler