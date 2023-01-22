import Image from 'next/image';

import PdfIcon from '../../../assets/img/pdf.svg';

export const getMediaComponent = ({ type, mainLink }) => {
  if (type === 'video') {
    return (
      <iframe
        width="560"
        height="315"
        src={mainLink}
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  } else if (type === 'pdf') {
    return (
      <iframe
        src={mainLink}
        width="640"
        height="480"
        allow="autoplay"
      />
    );
  }
};

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
  return items.map(({ props: { mainLink, type, title } }, i) => {
    if (type === 'video') {
      return (
        <Image
          height={3}
          width={5}
          key={i}
          src={getVideoThumb(mainLink)}
          layout="responsive"
          alt={title}
        />
      );
    } else if (type === 'pdf') {
      return (
        <Image
          height={3}
          width={5}
          key={i}
          src={PdfIcon}
          layout="responsive"
          alt="PDF"
        />
      );
    }
  });
};

const renderArrowPrev = (clickHandler, hasPrev) => (
  <button
    onClick={clickHandler}
    disabled={!hasPrev}
  >Prev
  </button>
  // TODO: pretty arrow button
  // <IconButton
  //   key="previous"
  //   aria-label={label}
  //   color="primary"
  //   onClick={clickHandler}
  //   disabled={!hasPrev}
  // >
  //   <PrevIcon />
  // </IconButton>
);

const renderArrowNext = (clickHandler, hasNext) => (
  <button
    disabled={!hasNext}
    onClick={clickHandler}
  >
    Next
  </button>
);
// TODO: pretty arrow button
// <IconButton
//   key="next"
//   aria-label={label}
//   color="primary"
//   onClick={clickHandler}
//   disabled={!hasNext}
// >
//   <NextIcon/>
// </IconButton>

export const customControls = {
  renderThumbs,
  renderArrowPrev,
  renderArrowNext,
};