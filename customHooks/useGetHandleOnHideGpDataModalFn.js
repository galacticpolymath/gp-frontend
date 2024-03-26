/* eslint-disable quotes */
/* eslint-disable indent */
/* eslint-disable no-multiple-empty-lines */
import { useEffect } from "react";


export const useGetHandleOnHidegpDataModalFn = (_isModalShown, setSelectedGpData) => {
    const [isModalShown, setIsModalShown] = _isModalShown;

    const handleOnHide = () => {
        setIsModalShown(false);
    };

    useEffect(() => {
        if (!isModalShown) {
            setTimeout(() => {
                setSelectedGpData(null);
            }, 250);
        }
    }, [isModalShown]);

    useEffect(() => {
        const listenForEscKeyPress = window.addEventListener('keyup', event => {
            if (event.key === 'Escape') {
                handleOnHide();
            }
        });

        return () => {
            window.removeEventListener('keyup', listenForEscKeyPress);
        };
    }, []);

    return handleOnHide;
};