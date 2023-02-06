/* eslint-disable no-console */
/* eslint-disable curly */
/* eslint-disable quotes */
/* eslint-disable semi */
/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unknown-property */
/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable object-curly-spacing */
/* eslint-disable indent */
/* eslint-disable react/jsx-indent */
import { useRef, useState } from 'react';
import useOnScroll from '../hooks/useOnScroll';
import Image from 'next/image'

// import { useRect } from '../hooks/useRect';
const clampVal = (num = 0, min = 0, max = 0) => {
    return Math.max(min, Math.min(num, max));
  };

const ParallaxImage = ({
  src = '',
  alt = '',
  height,
  children,
  isFixed = false,
  speed = 1,
  isClamp = false,
  debug = false,
}) => {
  const box = useRef(null);
  const img = useRef(null);
  const [ΔY, setΔY] = useState(0);

  // const [boxInitialized, boxRect] = useRect(box);
  // const [imgInitialized, imgRect] = useRect(img);

  useOnScroll((scrollY, winHeight) => {
    if (isFixed) return;
    if (!box.current) return;
    if (!img.current) return;
    // if (!boxInitialized.current || !box.current || !boxRect.current) return;
    // if (!imgInitialized.current || !img.current || !imgRect.current) return;

    const boxRect = box.current.getBoundingClientRect();

    const winBottom = scrollY + winHeight;
    const boxTop = boxRect.top + scrollY;
    const boxBottom = boxRect.bottom + scrollY;
    const boxHeight = boxRect.height;
    const pct = (clampVal(winBottom, boxTop, boxBottom + winHeight) - boxTop) / (boxHeight + winHeight);

    const imgHeight = img.current.offsetHeight;
    // const imgTop = img.current.getBoundingClientRect().y;
    // const imgHeight = img.current.innerHeight;
    // const imgBottom = imgTop + imgHeight;

    if (imgHeight < boxHeight) {
      console.warn(
        `parallax effect doesn't work if image is smaller than the bounding box. imgHeight=${imgHeight} boxHeight=${boxHeight}`,
      );
      return;
    }

    // calculate the distance that the image needs to traverse
    // speed: 2  >> start: -diff*2 end: diff
    // speed: 1  >> start: -diff   end: 0
    // speed: 0  >> start: -diff/2 end: -diff/2   <-- image is centered
    // speed: -1 >> start: 0       end: -diff
    // speed: -2 >> start: diff    end: -diff*2
    const diff = imgHeight - boxHeight;
    const deltaY =
      // starting offset
      (0 - diff - diff * speed) * 0.5 +
      // distance travelled to reach end
      diff * pct * speed;

    if (isClamp) {
      setΔY(clampVal(deltaY, -diff, 0));
    } else {
      setΔY(deltaY);
    }

    // const start = (-diff - diff * speed) / 2;
    // const distance = diff * pct * speed;

    // if (isClamp) {
    //   setΔY(clampVal(start + distance, -diff, 0));
    // } else {
    //   setΔY(start + distance);
    // }
    // prettier-ignore
    // setΔY(speed > 0
    //   ? isClamp(-diff * speed + diff * pct * speed, -diff, 0)
    //   : isClamp(diff * pct * speed, -diff, 0)
    // );

    // img.current.style.transform = `translate(0, ${ΔY}px)`;

    // prettier-ignore
    if (debug) console.log({
      pct,
      ΔY,
      // imgHeight,
      // boxHeight,
      // winBottom,
      // height,
      // boxTop,
      // boxBottom,
      // imgTop,
      // imgBottom,
      // 'isClamp()': isClamp(winBottom, boxTop, boxBottom),
    });
  });

  return (
    <div ref={box} className="img-background-container overflow-auto d-flex justify-content-center align-items-center" style={{ height: height || undefined }}>
      {isFixed ? (
        <div
          className="image-bg dark-overlay"
          style={{ backgroundImage: `url(${src})`, height: height || undefined }}
        />
      ) : (
        <img
          ref={img}
          className="image-behind position-relative noMargin noPadding"
          layout='fill'
          src={src}
          alt={alt}
          style={{
            transform: `translate(0, ${ΔY}px)`,
          }}
        />
      )}
      {!!children && <div className="image-content">{children}</div>}
    </div>
  );
};

export default ParallaxImage;