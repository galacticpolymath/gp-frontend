/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable indent */
import React from 'react';
import Image from 'next/image';
import styles from './Hero.module.css';

const Hero = ({
  imgSrc,
  isImgToTheSide,
  isStylesHereOn = true,
  children,
  className = '',
}) => {
  return (
    <div className={`${isStylesHereOn ? styles.hero : ''} ${className} position-relative`}>
      {(imgSrc && !isImgToTheSide) && <Image src={imgSrc} alt="Hero_Image_Galactic_Polymath" fill priority style={{ objectFit: 'cover', zIndex: -1 }} />}
      {(imgSrc && isImgToTheSide) && (
        <div className="position-relative h-100 w-100 mb-2 me-md-3">
          <Image src={imgSrc} alt="Hero_Image_Galactic_Polymath" fill priority style={{ objectFit: 'contain' }} />
        </div>
      )}
      <div className="container row mx-auto align-items-start">
        <div className='col offset-lg-0 col-lg-8 col-xl-6'>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Hero;