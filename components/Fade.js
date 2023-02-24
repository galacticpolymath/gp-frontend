/* eslint-disable no-unused-vars */
/* eslint-disable object-curly-spacing */
/* eslint-disable curly */
/* eslint-disable quotes */
import React, { useEffect, useState } from "react";

// if the search input field is in view, then don't show the button 
// if the jobViz hero comp is in view, then don't show the button 

const Fade = ({ showElement, children, containerId }) => {
  const [renderToggled, setRenderToggled] = useState(showElement);

  useEffect(() => {
    if (showElement) setRenderToggled(true);
  }, [showElement]);

  const handleOnAnimationEnd = () => {
    if (!showElement){
      document.getElementById(containerId).style.opacity = "0";
      setRenderToggled(false);
    }
  };

  useEffect(() => {
    if(!renderToggled && document?.getElementById(containerId)){
      document.getElementById(containerId).style.opacity = "1";
    }
  },[renderToggled]);

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

export default Fade;