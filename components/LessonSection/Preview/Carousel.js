import { Carousel as RRCarousel } from 'react-responsive-carousel';

import Slide from './Slide';
import { customControls } from './utils';

import styles from './index.module.scss';

const Carousel = ({
  items,
}) => {
  return (
    <RRCarousel
      showStatus={false}
      className={styles.Carousel}
      {...customControls}
    >
      {items.sort((a, b) => a.order - b.order).map((item, i) => <Slide key={i} {...item} />)}
    </RRCarousel>
  );
};

export default Carousel;