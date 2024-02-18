/* eslint-disable quotes */
/* eslint-disable no-console */
/* eslint-disable indent */

import { useEffect, useRef } from "react";

export const useScrollCardIntoView = cardObj => {
    const cardRef = useRef();

    useEffect(() => {
        if (cardObj.willScrollIntoView) {
            cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, []);

    return cardRef;
};
