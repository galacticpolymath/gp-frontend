 
 
 

import { useState, useMemo, useEffect } from "react";

export const useIsElementOnScreen = ref => {
    const [isElementOnScreen, setIsElementOnScreen] = useState(false);

    const observer = useMemo(() => new IntersectionObserver(
        ([entry]) => setIsElementOnScreen(entry.isElementOnScreen)
    ), [])

    useEffect(() => {
        observer.observe(ref.current)
        return () => observer.disconnect()
    }, [observer, ref])

    return isElementOnScreen;
}

export default useIsElementOnScreen;
