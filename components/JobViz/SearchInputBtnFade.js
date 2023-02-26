/* eslint-disable react/jsx-indent */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable indent */
/* eslint-disable no-unused-vars */
/* eslint-disable object-curly-spacing */
/* eslint-disable curly */
/* eslint-disable quotes */
import React, { useEffect, useState } from "react";

// Fade for Go to search input field
// if the following elements are in view, then don't show the button
// the job viz hero
// jobCategoriesAndBracketSec

const SearchInputBtnFade = ({ showElement, children, containerId }) => {
    const [renderToggled, setRenderToggled] = useState(showElement);

    useEffect(() => {
        if (!showElement) setRenderToggled(true);

    }, [showElement]);

    const handleOnAnimationEnd = () => {
        if (!showElement) {
            document.getElementById(containerId).style.opacity = "0";
            setRenderToggled(false);
        }
    };

    useEffect(() => {
        if (!renderToggled && document?.getElementById("container")) {
            document.getElementById(containerId).style.opacity = "1";
        }
    }, [renderToggled]);

    return (
        renderToggled && (
            <div
                id={containerId}
                style={{ animation: `${showElement ? "fadeIn" : "fadeOut"} 1s` }}
                onAnimationEnd={handleOnAnimationEnd}
            >
                {children}
            </div>
        )
    );
};

export default SearchInputBtnFade;