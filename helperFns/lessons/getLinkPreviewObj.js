import { getLinkPreview } from 'link-preview-js';

const getNormalizedMetaImageUrl = (imageUrl = '', sourceUrl = '') => {
  if (!imageUrl || !sourceUrl) {
    return null;
  }

  try {
    if (imageUrl.startsWith('//')) {
      return `https:${imageUrl}`;
    }

    if (/^https?:\/\//i.test(imageUrl)) {
      return imageUrl;
    }

    return new URL(imageUrl, sourceUrl).toString();
  } catch {
    return null;
  }
};

async function fetchMetaImagePreview(url) {
  if (!url || typeof url !== 'string' || !/^https?:\/\//i.test(url)) {
    return null;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (GP Teacher Portal)',
      },
    });

    if (!response.ok) {
      return null;
    }

    const html = await response.text();
    const imageMatch =
      html.match(
        /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i
      ) ??
      html.match(
        /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i
      );
    const titleMatch =
      html.match(
        /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i
      ) ?? html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const normalizedImageUrl = getNormalizedMetaImageUrl(
      imageMatch?.[1] ?? '',
      url
    );

    if (!normalizedImageUrl) {
      return null;
    }

    return {
      images: [normalizedImageUrl],
      title: titleMatch?.[1]?.trim() ?? '',
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function getLinkPreviewObj(url) {
  try {
    const linkPreviewObj = await getLinkPreview(url);

    if (Array.isArray(linkPreviewObj?.images) && linkPreviewObj.images.length > 0) {
      return linkPreviewObj;
    }

    const metaPreview = await fetchMetaImagePreview(url);

    if (metaPreview) {
      return {
        ...linkPreviewObj,
        images: metaPreview.images,
        title: linkPreviewObj?.title || metaPreview.title,
      };
    }

    return linkPreviewObj;
  } catch (error) {
    const metaPreview = await fetchMetaImagePreview(url);

    if (metaPreview) {
      return metaPreview;
    }

    const errMsg = `An error has occurred in getting the link preview for given url. Error message: ${error}.`;
    console.error(errMsg);

    return { errMsg };
  }
}
