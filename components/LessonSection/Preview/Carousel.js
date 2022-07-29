import { Carousel as RRCarousel } from 'react-responsive-carousel';
import PropTypes from 'prop-types';

import Slide from './Slide';
import { customControls } from './utils';

import styles from './index.module.scss';

const Carousel = ({
  items,
}) => {
  return items && (
    <RRCarousel
      showStatus={false}
      className={`${styles.Carousel} bg-light-gray rounded p-3`}
      {...customControls}
    >
      {items.sort((a, b) => a.order - b.order).map((item, i) => <Slide key={i} {...item} />)}
    </RRCarousel>
  );
};

Carousel.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({
    order: PropTypes.number,
  })),
};

export default Carousel;