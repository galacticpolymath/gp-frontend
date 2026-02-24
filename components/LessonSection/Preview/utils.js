import Image from 'next/image';
import RenderArrowNext from './RenderArrowNext';
import Link from 'next/link';

const normalizeYouTubeEmbedUrl = (url) => {
  try {
    const parsedUrl = new URL(url);
    const host = parsedUrl.hostname.toLowerCase();
    let videoId = null;

    if (host.includes('youtu.be')) {
      videoId = parsedUrl.pathname.replace(/^\/+/, '').split('/')[0];
    } else if (host.includes('youtube.com')) {
      if (parsedUrl.pathname.includes('/embed/')) {
        videoId = parsedUrl.pathname.split('/embed/')[1]?.split('/')[0] ?? null;
      } else if (parsedUrl.pathname.includes('/shorts/')) {
        videoId = parsedUrl.pathname.split('/shorts/')[1]?.split('/')[0] ?? null;
      } else if (parsedUrl.pathname === '/watch') {
        videoId = parsedUrl.searchParams.get('v');
      }
    }

    if (!videoId) {
      return url;
    }

    const embedUrl = new URL(`https://www.youtube.com/embed/${videoId}`);
    const start =
      parsedUrl.searchParams.get('start') ??
      parsedUrl.searchParams.get('t')?.replace(/[^\d]/g, '');

    if (start) {
      embedUrl.searchParams.set('start', start);
    }

    embedUrl.searchParams.set('controls', '1');
    embedUrl.searchParams.set('playsinline', '1');
    embedUrl.searchParams.set('rel', '0');
    embedUrl.searchParams.set('modestbranding', '1');
    embedUrl.searchParams.set('enablejsapi', '1');

    return embedUrl.toString();
  } catch (error) {
    return url;
  }
};

export const getMediaComponent = ({
  type,
  mainLink,
  webAppPreviewImg,
  webAppImgAlt,
  handleIFrameOnClick = () => { },
  iframeStyle = { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'contain' },
  iframeClassName = 'lesson-media',
  key
}) => {
  const resolvedVideoUrl = typeof mainLink === 'string'
    ? normalizeYouTubeEmbedUrl(mainLink)
    : mainLink;

  if (type === "lesson-item-doc") {
    return (
      <iframe key={key} src={mainLink} className="w-100 h-100" />
    )
  } else if (type === 'video') {
    return (
      <iframe
        onClick={handleIFrameOnClick}
        src={resolvedVideoUrl}
        style={iframeStyle}
        title="Video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        className={`${iframeClassName} media-testing`}
        allowFullScreen
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
        className='pdf-media media-testing'
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
          alt={webAppImgAlt}
          fill
          className='lesson-media position-absolute top-0 start-0 h-100 w-100 media-img-testing'
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
