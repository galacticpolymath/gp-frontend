import { useEffect } from 'react';
import throttle from "lodash.throttle";

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
    const percentage = Math.round(distance / ((viewportHeight + elementHeight) / 100));

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

const useScrollHandler = rerenderComp => {
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
        // when you're scrolling up you want the nearest previous top.... find index - 1
        const removeBelow = elemOffsets.filter(function (x) {
            return x < cursorTop + window.innerHeight / 4;
        });
        const index = removeBelow.length > 0 ? removeBelow.length - 1 : 0;

        // activateDot(index, elemIds);
    };

    const scrollAction = function () {
        const scrollElems = Array.prototype.slice.call(
            document.querySelectorAll(".SectionHeading")
        );

        let viewPortPercentOfElems = scrollElems.map(elem => {
            let liNavDotId;

            if (elem.classList[elem.classList.length - 1] === 'lessonTitleId') {
                liNavDotId = 'lessonTitleId'
            }

            for(let index = 0; index < elem.classList.length; index++){
                const className = elem.classList[index];
                if(/\d+\./.test(className)){
                    liNavDotId = className
                    break
                }
            }

            // liNavDotId = elem.classList.find(className => /\d+\./.test(className))
            
            const percent = getPercentageSeen(elem);
            const _percentageInViewPort = (percent === 100) || (percent === 0) ? 0 : percent
            return { percentageInViewPort: _percentageInViewPort, elemId: elem.id, sectionDotId: `sectionDot-${liNavDotId}` }
        })

        viewPortPercentOfElems = viewPortPercentOfElems.filter(({ percentageInViewPort }) => ((percentageInViewPort > 0) && (percentageInViewPort < 100)))
        viewPortPercentOfElems = viewPortPercentOfElems.filter(({ elemId }) => elemId)
                



        // if(!viewPortPercentOfElems.length){
        //     const targetElem = document.getElementById('sectionDot-lessonTitleId' )
        //     console.log('targetElem: ', targetElem)
        //     targetElem.classList.add('active-dot')
        //     rerenderComp()
        //     return        
        // }
        // console.log("viewPortPercentOfElems: ", viewPortPercentOfElems)
        // const indexOfElemInView = viewPortPercentOfElems.findIndex((elem, index, self) => {
        //     const { percentageInViewPort: currentSecViewPortPercent, elemId: currentSecElemId } = elem;
        //     const previousSection = self[index - 1]
        //     const { percentageInViewPort: prevSecViewportPercent, elemId: prevSecId } = previousSection ?? {};

        //     // if((self.length === 3) && (index === 1)){
        //     //     return true
        //     // }

        //     // if(self.length === 3){
        //     //     return false
        //     // }

        //     // if there two sections in the view, and the current section is less than the previous section but its percent is over 25, then return that section 

        //     if(previousSection && ((currentSecViewPortPercent < prevSecViewportPercent) && (currentSecViewPortPercent > 25))){
        //         return true
        //     }

        //     if((self.length === 2) && index === 0){
        //         return false
        //     }

        //     return (currentSecViewPortPercent > 0) && (currentSecViewPortPercent < 100)
        // })

        const sectionInView = viewPortPercentOfElems.reduce((acc, curr) => {
            if (curr.percentageInViewPort > acc) {
                return curr;
            } else {
                return acc;
            }
        });
        const navDotElemIds = new Set(viewPortPercentOfElems.map(({ sectionDotId }) => sectionDotId).filter(sectionDotId => sectionDotId !== sectionInView.sectionDotId))

        
        // const sectionInView = viewPortPercentOfElems.find(({ percentageInViewPort }) => percentageInViewPort === percentOfSectionInView)
        if (sectionInView?.sectionDotId) {
            // targetElem.classList.add('active-dot')
            // GOAL: update all of the class names for all of the nav dot elements
            // all class names for the nav dot elements were updated 
            // the navDot for the section that is not in view is changed to grey (the active-dot was removed)
            // if navDot does not correspond with the section that is in view, then remove the active-dot.
            // if the navDot does correspond with the secftion that is in view, then add the active-dot
            // loop through all of the classNames of all of the navDots 
            // navDotElemIds.forEach(navDotId => {
            //     const targetElem = document.getElementById(navDotId)
                
            //     if(navDotId === sectionInView.sectionDotId){
            //         targetElem.classList.add('active-dot')   
            //         console.log('targetElem.classList: ', targetElem.classList)
            //         rerenderComp()                 
            //         debugger
            //     }

            //     if(targetElem.classList.contains('active-dot')){
            //         targetElem.classList.remove('active-dot')
            //         rerenderComp()
            //     }
            // })
            const targetElem = document.getElementById(sectionInView?.sectionDotId)
            targetElem.classList.add('active-dot')
        }

        // ABLE TO REMOVE BLUE FOR DOTS THAT ARE NOT THE FIRST SECTION

        // for all other elements, remove the active-dot class name
        // filter out the sectionINView.sectionDotId from navDotElemIds
        navDotElemIds.forEach(navDotId => {
            const targetElem = document.getElementById(navDotId)
            console.log("targetElem.classList.contains('active-dot'): ", targetElem.classList.contains('active-dot'))
            if(targetElem.classList.contains('active-dot')){
                console.log('removing active-dot class name')
                targetElem.classList.remove('active-dot')
            }
        })
        
        rerenderComp()



        // console.log("viewPortPercentOfElems: ", viewPortPercentOfElems)

        // console.log('indexOfElemInView: ', indexOfElemInView)
        // console.log(viewPortPercentOfElems[indexOfElemInView])
        // viewPortPercentOfElems.splice(viewPortPercentOfElems.findIndex(elem => elem.elemId), 1)

        // console.log('viewPortPercentOfElems: ', viewPortPercentOfElems)

        // let elemOffsets = [];
        // let elemIds = [];

        // // get the percentage of how much the element is taking up the viewport 

        // scrollElems.forEach((el) => {
        //   elemIds.push(el.id.replace("&", "\\&"));
        //   elemOffsets.push(getOffset(el));
        // });

        // const cursorTop = window.pageYOffset;
        // const cursorBottom = window.pageYOffset + window.innerHeight;

        // console.log('elemOffsets: ', elemOffsets)

        if (window.pageYOffset < lastOffset) {

            //   scrollUp(cursorTop, elemOffsets, elemIds);
        } else {
            //   scrollDown(cursorBottom, elemOffsets, elemIds);
        }
        lastOffset = window.pageYOffset;
    };

    useEffect(() => {
        scrollAction()
        window.addEventListener("scroll", throttle(() => scrollAction(), 100));
        return () => {
            window.removeEventListener("scroll", throttle(() => scrollAction(), 100));
        };
    }, []);


}

export default useScrollHandler