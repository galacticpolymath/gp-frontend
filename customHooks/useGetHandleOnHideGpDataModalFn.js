 
 
 
import { useCallback, useEffect } from "react";


export const useGetHandleOnHidegpDataModalFn = (_isModalShown, setSelectedGpData) => {
    const [isModalShown, setIsModalShown] = _isModalShown;

    const handleOnHide = useCallback(() => {
        setIsModalShown(false);
    }, [setIsModalShown]);

    useEffect(() => {
        if (!isModalShown) {
            setTimeout(() => {
                setSelectedGpData(null);
            }, 250);
        }
    }, [isModalShown, setSelectedGpData]);

    useEffect(() => {
        const listenForEscKeyPress = window.addEventListener('keyup', event => {
            if (event.key === 'Escape') {
                handleOnHide();
            }
        });

        return () => {
            window.removeEventListener('keyup', listenForEscKeyPress);
        };
    }, [handleOnHide]);

    return handleOnHide;
};
