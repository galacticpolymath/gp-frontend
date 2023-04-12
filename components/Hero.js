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
  childrenContainerStyle,
  imgContainerStyle,
  childrenContainerClassName,
  className = '',
}) => {
  return (
    <div className={`${isStylesHereOn ? styles.hero : ''} ${className} position-relative`}>
      {(imgSrc && !isImgToTheSide) && <Image src={imgSrc} alt="Hero_Image_Galactic_Polymath" sizes="(max-width: 575px) 270px, (max-width: 767px) 767px, (max-width: 991px) 480px, (max-width: 1199px) 584px, 705px" fill priority style={{ objectFit: 'cover', zIndex: -1 }} />}
      {(imgSrc && isImgToTheSide) && (
        <div style={imgContainerStyle ?? {}} className='position-relative h-100 w-100 mb-2 me-md-3 me-lg-5'>
          <Image src={imgSrc} alt="Hero_Image_Galactic_Polymath" fill sizes="(max-width: 575px) 270px, (max-width: 767px) 767px, (max-width: 991px) 480px, (max-width: 1199px) 584px, 705px" priority style={{ objectFit: 'contain' }} />
        </div>
      )}
      <div style={childrenContainerStyle ?? {}} className={`container row ${childrenContainerClassName ?? 'mx-auto'} align-items-start`}>
        <div className='col offset-lg-0 col-lg-8 col-xl-6'>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Hero;