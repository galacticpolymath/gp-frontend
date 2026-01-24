 
 
 

import { useState, useMemo, useEffect } from "react";

export const useIsElementOnScreen = ref => {
    const [isElementOnScreen, setIsElementOnScreen] = useState(false);

    const observer = useMemo(() => new IntersectionObserver(
        ([entry]) => setIsElementOnScreen(entry.isElementOnScreen)
    ), [ref])

    useEffect(() => {
        observer.observe(ref.current)
        return () => observer.disconnect()
    }, [])

    return isElementOnScreen;
}

export default useIsElementOnScreen;