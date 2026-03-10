import React, { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileSpreadsheet,
  FileText,
  MonitorPlay,
  PlayCircle,
} from 'lucide-react';
import RichText from '../../RichText';
import { TFeaturedMultimediaForUI } from '../../../backend/models/Unit/types/unit';
import { getMediaComponent } from '../../LessonSection/Preview/utils';
import styles from './CompactMediaCarousel.module.css';

type TCompactMediaCarouselProps = {
  mediaItems: TFeaturedMultimediaForUI[];
  className?: string;
};

type TResolvedPreviewMap = Record<string, { image: string; title?: string | null }>;

type TMediaTypeConfig = {
  label: string;
  Icon: React.ComponentType<{ size?: number; className?: string; 'aria-hidden'?: boolean }>;
};

const getNumericOrder = (value?: string | null) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : Number.MAX_SAFE_INTEGER;
};

const getYoutubeThumbUrl = (link?: string | null) => {
  if (!link || typeof link !== 'string') {
    return null;
  }

  try {
    const parsedUrl = new URL(link);
    const host = parsedUrl.hostname.toLowerCase();
    let videoId = '';

    if (host === 'youtu.be') {
      videoId = parsedUrl.pathname.replace(/^\/+/, '').split('/')[0] ?? '';
    } else if (host === 'youtube.com' || host.endsWith('.youtube.com')) {
      if (parsedUrl.pathname.includes('/embed/')) {
        videoId = parsedUrl.pathname.split('/embed/')[1]?.split('/')[0] ?? '';
      } else if (parsedUrl.pathname.includes('/shorts/')) {
        videoId = parsedUrl.pathname.split('/shorts/')[1]?.split('/')[0] ?? '';
      } else if (parsedUrl.pathname === '/watch') {
        videoId = parsedUrl.searchParams.get('v') ?? '';
      }
    }

    return videoId ? `https://i3.ytimg.com/vi/${videoId}/hqdefault.jpg` : null;
  } catch {
    return null;
  }
};

const getMediaTypeConfig = (item: TFeaturedMultimediaForUI): TMediaTypeConfig => {
  const link = item.mainLink ?? '';
  const lowerLink = link.toLowerCase();

  if (item.type === 'video') {
    return { label: 'Video', Icon: PlayCircle };
  }

  if (item.type === 'web-app') {
    return { label: 'Web App', Icon: MonitorPlay };
  }

  if (item.type === 'pdf' || lowerLink.endsWith('.pdf')) {
    return { label: 'PDF', Icon: FileText };
  }

  if (lowerLink.includes('spreadsheets')) {
    return { label: 'Sheet', Icon: FileSpreadsheet };
  }

  if (lowerLink.includes('presentation')) {
    return { label: 'Slides', Icon: FileText };
  }

  if (lowerLink.includes('document')) {
    return { label: 'Doc', Icon: FileText };
  }

  return { label: 'Resource', Icon: FileText };
};

const getThumbnailSrc = (item: TFeaturedMultimediaForUI) => {
  if (item.webAppPreviewImg) {
    return item.webAppPreviewImg;
  }

  if (item.type === 'video') {
    return getYoutubeThumbUrl(item.mainLink);
  }

  return null;
};

const stopEmbeddedMediaPlayback = (root: HTMLDivElement | null) => {
  if (!root) {
    return;
  }

  const mediaElements = root.querySelectorAll('iframe, video');

  mediaElements.forEach((element) => {
    if (element.tagName.toLowerCase() === 'video') {
      (element as HTMLVideoElement).pause?.();
      return;
    }

    const iframe = element as HTMLIFrameElement;
    const iframeSrc = iframe.getAttribute('src') ?? '';
    let iframeHost = '';

    try {
      iframeHost = iframeSrc.startsWith('http://') || iframeSrc.startsWith('https://')
        ? new URL(iframeSrc).hostname
        : typeof window !== 'undefined'
          ? new URL(iframeSrc, window.location.origin).hostname
          : '';
    } catch {
      iframeHost = '';
    }

    if (
      [
        'youtube.com',
        'www.youtube.com',
        'm.youtube.com',
        'youtube-nocookie.com',
        'www.youtube-nocookie.com',
      ].includes(iframeHost)
    ) {
      iframe.contentWindow?.postMessage(
        JSON.stringify({
          event: 'command',
          func: 'pauseVideo',
          args: [],
        }),
        '*'
      );
      return;
    }

    if (iframeHost === 'player.vimeo.com') {
      iframe.contentWindow?.postMessage({ method: 'pause' }, '*');
    }
  });
};

const CompactMediaCarousel: React.FC<TCompactMediaCarouselProps> = ({
  mediaItems,
  className = '',
}) => {
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const [resolvedPreviewMap, setResolvedPreviewMap] = useState<TResolvedPreviewMap>({});
  const sortedMediaItems = useMemo(
    () => [...(mediaItems ?? [])].sort((a, b) => getNumericOrder(a.order) - getNumericOrder(b.order)),
    [mediaItems]
  );
  const hydratedMediaItems = useMemo(
    () =>
      sortedMediaItems.map((item) => {
        const linkKey = item.mainLink ?? '';
        const resolvedPreview = linkKey ? resolvedPreviewMap[linkKey] : undefined;

        if (!resolvedPreview) {
          return item;
        }

        return {
          ...item,
          webAppPreviewImg: item.webAppPreviewImg ?? resolvedPreview.image,
          webAppImgAlt:
            item.webAppImgAlt ??
            (resolvedPreview.title ? `${resolvedPreview.title}'s preview image` : item.title ?? null),
        };
      }),
    [resolvedPreviewMap, sortedMediaItems]
  );
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setCurrentIndex(0);
  }, [sortedMediaItems]);

  useEffect(() => {
    if (!hydratedMediaItems.length) {
      setCurrentIndex(0);
      return;
    }

    setCurrentIndex((prev) => Math.min(prev, hydratedMediaItems.length - 1));
  }, [hydratedMediaItems.length]);

  useEffect(() => {
    const missingPreviewItems = hydratedMediaItems.filter(
      (item) =>
        item.type === 'web-app' &&
        !item.webAppPreviewImg &&
        typeof item.mainLink === 'string' &&
        item.mainLink.length > 0 &&
        !resolvedPreviewMap[item.mainLink]
    );

    if (!missingPreviewItems.length) {
      return;
    }

    let isCancelled = false;

    Promise.all(
      missingPreviewItems.map(async (item) => {
        const url = new URL('/api/link-preview-image', window.location.origin);
        url.searchParams.set('url', item.mainLink as string);

        try {
          const response = await fetch(url.toString());

          if (!response.ok) {
            return null;
          }

          const payload = (await response.json()) as { image?: string | null; title?: string | null };

          if (!payload.image) {
            return null;
          }

          return {
            link: item.mainLink as string,
            image: payload.image,
            title: payload.title ?? null,
          };
        } catch {
          return null;
        }
      })
    ).then((results) => {
      if (isCancelled) {
        return;
      }

      const resolvedEntries = results.filter(Boolean) as Array<{
        link: string;
        image: string;
        title: string | null;
      }>;

      if (!resolvedEntries.length) {
        return;
      }

      setResolvedPreviewMap((current) => {
        const next = { ...current };

        resolvedEntries.forEach(({ link, image, title }) => {
          next[link] = { image, title };
        });

        return next;
      });
    });

    return () => {
      isCancelled = true;
    };
  }, [hydratedMediaItems, resolvedPreviewMap]);

  const activeItem = hydratedMediaItems[currentIndex];

  if (!activeItem) {
    return null;
  }

  const setActiveIndex = (nextIndex: number) => {
    stopEmbeddedMediaPlayback(carouselRef.current);
    setCurrentIndex(nextIndex);
  };

  const mediaType = getMediaTypeConfig(activeItem);
  const description = activeItem.lessonRelevance?.trim() || activeItem.description?.trim() || '';
  const lessonLabel = activeItem.forLsn?.trim() || null;
  const canOpen = typeof activeItem.mainLink === 'string' && activeItem.mainLink.length > 0;

  return (
    <section
      ref={carouselRef}
      className={[styles.carousel, className].filter(Boolean).join(' ')}
      aria-label="Featured media carousel"
    >
      <div className={styles.stage}>
        <div className={styles.mediaColumn}>
          <div className={styles.mediaFrame}>
            {activeItem.type === 'web-app' && !activeItem.webAppPreviewImg ? (
              <div className={styles.mediaFallback}>
                <MonitorPlay size={28} aria-hidden="true" />
                <p>Preview image unavailable.</p>
                {canOpen ? (
                  <Link
                    href={activeItem.mainLink as string}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.mediaFallbackLink}
                  >
                    Open app
                    <ExternalLink size={15} aria-hidden="true" />
                  </Link>
                ) : null}
              </div>
            ) : (
              getMediaComponent({
                type: activeItem.type,
                mainLink: activeItem.mainLink,
                webAppPreviewImg: activeItem.webAppPreviewImg,
                webAppImgAlt: activeItem.webAppImgAlt ?? activeItem.title ?? 'Featured media preview',
                iframeStyle: {
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                },
                iframeClassName: styles.embeddedMedia,
                key: `active-media-${currentIndex}`,
              })
            )}
            <div className={styles.mediaOverlay}>
              <span className={styles.mediaTypeChip}>
                <mediaType.Icon size={14} aria-hidden={true} />
                {mediaType.label}
              </span>
              {lessonLabel ? <span className={styles.lessonChip}>Lesson {lessonLabel}</span> : null}
            </div>
          </div>
        </div>

        <div className={styles.infoColumn}>
          <div className={styles.infoCard}>
            <div className={styles.headerBlock}>
              <div className={styles.headerMeta}>
                <span className={styles.indexPill}>
                  {currentIndex + 1} / {hydratedMediaItems.length}
                </span>
                {activeItem.by ? (
                  <span className={styles.byline}>
                    by{' '}
                    {activeItem.byLink ? (
                      <a href={activeItem.byLink} target="_blank" rel="noreferrer">
                        {activeItem.by}
                      </a>
                    ) : (
                      activeItem.by
                    )}
                  </span>
                ) : null}
              </div>
              <h4 className={styles.title}>{activeItem.title?.trim() || 'Untitled media'}</h4>
            </div>

            {description ? (
              <div className={styles.descriptionWrap}>
                <RichText className={styles.description} content={description} />
              </div>
            ) : (
              <p className={styles.descriptionEmpty}>No additional context provided for this item.</p>
            )}

            <div className={styles.actionRow}>
              <div className={styles.navCluster}>
                <button
                  type="button"
                  className={styles.navButton}
                  onClick={() => setActiveIndex(Math.max(0, currentIndex - 1))}
                  disabled={currentIndex === 0}
                  aria-label="Show previous media item"
                >
                  <ChevronLeft size={18} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className={styles.navButton}
                  onClick={() => setActiveIndex(Math.min(hydratedMediaItems.length - 1, currentIndex + 1))}
                  disabled={currentIndex === hydratedMediaItems.length - 1}
                  aria-label="Show next media item"
                >
                  <ChevronRight size={18} aria-hidden="true" />
                </button>
              </div>

              {canOpen ? (
                <Link
                  href={activeItem.mainLink as string}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.openLink}
                >
                  Open {mediaType.label.toLowerCase()}
                  <ExternalLink size={15} aria-hidden="true" />
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {hydratedMediaItems.length > 1 ? (
        <div className={styles.thumbRail} role="tablist" aria-label="Choose media item">
          {hydratedMediaItems.map((item, index) => {
            const thumbnailSrc = getThumbnailSrc(item);
            const itemMediaType = getMediaTypeConfig(item);

            return (
              <button
                key={`${item.title ?? 'media'}-${index}`}
                type="button"
                className={`${styles.thumbButton} ${index === currentIndex ? styles.thumbButtonActive : ''}`}
                onClick={() => setActiveIndex(index)}
                aria-pressed={index === currentIndex}
              >
                <span className={styles.thumbVisual}>
                  {thumbnailSrc ? (
                    <Image
                      src={thumbnailSrc}
                      alt={item.title ?? 'Media preview'}
                      fill
                      sizes="96px"
                      className={styles.thumbImage}
                    />
                  ) : (
                    <span className={styles.thumbIconWrap}>
                      <itemMediaType.Icon size={18} aria-hidden={true} />
                      <span>{itemMediaType.label}</span>
                    </span>
                  )}
                </span>
                <span className={styles.thumbText}>
                  {item.forLsn ? <span className={styles.thumbLesson}>L{item.forLsn}</span> : null}
                  <span className={styles.thumbTitle}>{item.title?.trim() || 'Untitled media'}</span>
                </span>
              </button>
            );
          })}
        </div>
      ) : null}
    </section>
  );
};

export default CompactMediaCarousel;
