 

import React from 'react';
import Image from 'next/image';
import styles from './Hero.module.css';

const Hero = ({
  imgSrc,
  isImgToTheSide,
  isStylesHeroOn = true,
  children,
  childrenContainerStyle,
  imgContainerStyle,
  childrenContainerClassName,
  customChildrenContainerClassName,
  className = '',
  heroContainerStyle = {},
}) => {
  let _childrenContainerClassName = `container row ${childrenContainerClassName ?? 'mx-auto'} align-items-start`

  if (typeof customChildrenContainerClassName === 'string') {
    _childrenContainerClassName = customChildrenContainerClassName
  }


  return (
    <div
      style={heroContainerStyle}
      className={`${isStylesHeroOn ? styles.hero : ''} ${className} position-relative`}
    >
      {(imgSrc && !isImgToTheSide) && (
        <Image
          src={imgSrc} alt="Hero_Image_Galactic_Polymath"
          fill
          priority
          style={{ objectFit: 'cover', zIndex: -1 }}
        />
      )}
      {(imgSrc && isImgToTheSide) && (
        <div style={imgContainerStyle ?? {}} className='position-relative mb-2 me-md-3 me-lg-5'>
          <Image
            src={imgSrc} alt="Hero_Image_Galactic_Polymath"
            priority style={{ objectFit: 'contain', height: '100%', width: '100%' }}
          />
        </div>
      )}
      <div style={childrenContainerStyle ?? {}} className={_childrenContainerClassName}>
        <div className='col offset-lg-0 col-lg-8 col-xl-6'>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Hero;