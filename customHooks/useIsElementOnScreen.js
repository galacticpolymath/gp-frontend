/* eslint-disable semi */
/* eslint-disable indent */
/* eslint-disable no-undef */
export const useIsElementOnScreen = ref => {
    const [isElementOnScreen, setIsElementOnScreen] = useState(false);

    const observer = useMemo(() => new IntersectionObserver(
        ([entry]) => setIsElementOnScreen(entry.isElementOnScreen)
    ), [ref, IntersectionObserver])

    useEffect(() => {
        observer.observe(ref.current)
        return () => observer.disconnect()
    }, [])

    return isElementOnScreen;
}

export default useIsElementOnScreen;