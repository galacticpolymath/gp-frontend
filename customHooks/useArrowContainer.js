 
 
import throttle from "lodash.throttle";
import { useState } from "react";

export const useArrowContainer = (throttleMs = 200, fadeOutArrowContainerTimeoutMs = 3500) => {
    const [arrowContainer, setArrowContainer] = useState({ isInView: true, canTakeOffDom: false });
    let timer;

    const handleElementVisibility = inViewPort => (throttle(() => {
        clearTimeout(timer);

        if (inViewPort) {
            setArrowContainer(state => ({ ...state, isInView: true }));

            timer = setTimeout(() => {
                setArrowContainer(state => ({ ...state, isInView: false }));
            }, fadeOutArrowContainerTimeoutMs);
        }
    }, throttleMs))();

    return { _arrowContainer: [arrowContainer, setArrowContainer], handleElementVisibility };
};