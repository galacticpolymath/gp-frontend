import RenderArrowNext from './RenderArrowNext';

/* eslint-disable no-console */
export const getMediaComponent = ({ type, mainLink }) => {
  if (type === 'video') {
    return (
      <iframe
        width="560"
        height="315"
        src={mainLink}
        style={{ minWidth: '170px' }}
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
        <img
          key={i}
          src={getVideoThumb(mainLink)}
          alt={title}
        />
      );
    } else if (type === 'pdf') {
      return (
        <i
          key={i}
          className="bi-filetype-pdf fs-2"
        >

        </i>
      );
    }
  });
};

const renderArrowPrev = (clickHandler, hasPrev) => (
  <button
    onClick={clickHandler}
    disabled={!hasPrev}
    className='btn bg-transparent m-0 p-1'
  >
    <i className="fs-1 text-black bi-arrow-left-circle-fill lh-1 d-block"></i>
  </button>
);

const renderArrowNext = (showNextItem, hasNext) => {
  return <RenderArrowNext showNextItem={showNextItem} hasNext={hasNext} />;
};

export const customControls = {
  renderThumbs,
  renderArrowPrev,
  renderArrowNext,
};