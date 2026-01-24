 
 
 

import { useEffect, useRef } from "react";

export const useScrollCardIntoView = willScrollCardIntoView => {
    const cardRef = useRef();

    useEffect(() => {
        if (willScrollCardIntoView) {
            cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, []);

    return cardRef;
};
