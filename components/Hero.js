import React from 'react';

import styles from './Hero.module.css';

const Hero = ({
  imgSrc,
  children,
  className = '',
}) => {
  return (
    <div style={imgSrc ? { backgroundImage: `url(${imgSrc})` } : {}} className={`${styles.hero} ${className}`}>
      <div className="container row mx-auto align-items-start">
        <div className='col offset-lg-0 col-lg-8 col-xl-6'>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Hero;