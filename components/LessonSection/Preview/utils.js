import Image from 'next/image';
import RenderArrowNext from './RenderArrowNext';
import Link from 'next/link';

export const getMediaComponent = ({ type, mainLink, webAppPreviewImg }) => {
  if (type === 'video') {
    return (
      <iframe
        src={mainLink}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        className='lesson-media'
      />
    );
  } else if (type === 'pdf') {
    return (
      <iframe
        src={mainLink}
        width="200"
        height="500"
        style={{ zIndex: 11100, position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
        allow="autoplay"
        className='pdf-media'
      />
    );
  } else if ((type === 'web-app') && webAppPreviewImg) {
    return (
      <Link
        href={mainLink}
        target='_blank'
      >
          <Image
            src={webAppPreviewImg}
            fill
            className='lesson-media position-absolute top-0 start-0 h-100 w-100'
          />
      </Link>
    );
  }
};

export const getVideoThumb = link => {
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
        />
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