import React from 'react';

import styles from './Hero.module.css';

const Hero = ({
  imgSrc,
  children,
  className,
}) => {
  return (
    <div style={{ backgroundImage: `url(${imgSrc})` }} className={`${styles.hero} ${className}`}>
      <div className="container row mx-auto align-items-start">
        <div className='col col-md-8 col-lg-6'>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Hero;