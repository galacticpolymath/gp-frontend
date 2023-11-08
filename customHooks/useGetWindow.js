import { useRouter } from "next/router";
import { useEffect } from "react";
import { useState } from "react"

const useGetWindow = () => {
    const router = useRouter();
    const [appWindow, setAppWindow] = useState({});

    useEffect(() => {
        const appWindow = {
            ...router,
            ...window.location
        };
        console.group('appWindow: ', appWindow)
        setAppWindow(appWindow);
    }, []);

    return appWindow;
};

export default useGetWindow;