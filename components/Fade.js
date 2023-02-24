/* eslint-disable no-unused-vars */
/* eslint-disable object-curly-spacing */
/* eslint-disable curly */
/* eslint-disable quotes */
import React, { useEffect, useState } from "react";

const Fade = ({ showElement, children, containerId }) => {
  const [renderToggled, setRenderToggled] = useState(showElement);

  useEffect(() => {
    if (showElement) setRenderToggled(true);
  }, [showElement]);

  const onAnimationEnd = () => {
    if (!showElement){
      setRenderToggled(false);
      document.getElementById(containerId).style.opacity = "0";
    }
  };

  useEffect(() => {
    if(!renderToggled && document?.getElementById("container")){
      document.getElementById(containerId).style.opacity = "1";
    }
  },[renderToggled]);

  return (
    renderToggled && (
      <div
        id={containerId}
        style={{ animation: `${showElement ? "fadeIn" : "fadeOut"} 1s` }}
        onAnimationEnd={onAnimationEnd}
      >
        {children}
      </div>
    )
  );
};

export default Fade;