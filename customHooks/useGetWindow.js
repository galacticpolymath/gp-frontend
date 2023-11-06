import { useRouter } from "next/router";
import { useEffect } from "react";
import { useState } from "react"

const useGetWindow = () => {
    const router = useRouter();
    const [appWindow, setAppWindow] = useState({});

    useEffect(() => {
        setAppWindow({
            ...router,
            ...window.location
        });
    }, []);

    return appWindow;
};

export default useGetWindow;