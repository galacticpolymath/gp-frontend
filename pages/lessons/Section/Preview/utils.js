import React from 'react';

const getVideoThumb = link => {
  if (!link) {
    return '';
  }

  if (link.includes('youtube')) {
    const slug = link.split('/embed/')[1];
    return `https://i3.ytimg.com/vi/${slug}/hqdefault.jpg`;
  }
  return '';
};

const renderThumbs = items => {
  return items.map(({ props: { mainLink, title } }, i) =>
    (<img
      key={i}
      src={getVideoThumb(mainLink)}
      alt={title}
    />));
};

const renderArrowPrev = (clickHandler, hasPrev, label) =>null;
// (<IconButton
//   key="previous"
//   aria-label={label}
//   color="primary"
//   onClick={clickHandler}
//   disabled={!hasPrev}
// >
//   <PrevIcon />
// </IconButton>);

const renderArrowNext = (clickHandler, hasNext, label) =>null;
// (<IconButton
//   key="next"
//   aria-label={label}
//   color="primary"
//   onClick={clickHandler}
//   disabled={!hasNext}
// >
//   <NextIcon />
// </IconButton>);

export const customControls = {
  renderThumbs,
  renderArrowPrev,
  renderArrowNext,
};