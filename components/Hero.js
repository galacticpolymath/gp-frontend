/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable indent */
import React from 'react';
import Image from 'next/image';
import styles from './Hero.module.css';

const Hero = ({
  imgSrc,
  children,
  className = '',
}) => {
  return (
    <div className={`${styles.hero} ${className} position-relative`}>
      {imgSrc && <Image src={imgSrc} alt="Hero_Image_Galactic_Polymath" fill priority style={{ objectFit: 'cover', zIndex: -1 }} />}
      <div className="container row mx-auto align-items-start">
        <div className='col offset-lg-0 col-lg-8 col-xl-6'>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Hero;