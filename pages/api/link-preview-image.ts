import type { NextApiRequest, NextApiResponse } from 'next';
import { getLinkPreviewObj } from '../../globalFns';
import { isSafeExternalUrl } from '../../globalFns';

type TLinkPreviewImageResponse =
  | { image: string | null; title?: string | null }
  | { msg: string };

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse<TLinkPreviewImageResponse>
) {
  if (request.method !== 'GET') {
    return response.status(405).json({ msg: "Incorrect request method. Must be a 'GET'." });
  }

  const url = typeof request.query.url === 'string' ? request.query.url : '';

  if (!url || !/^https?:\/\//i.test(url) || !isSafeExternalUrl(url)) {
    return response.status(400).json({ msg: 'A valid absolute url query param is required.' });
  }

  try {
    const preview = await getLinkPreviewObj(url);
    const image =
      'images' in preview && Array.isArray(preview.images) && preview.images.length
        ? preview.images[0]
        : null;
    const title = 'title' in preview && typeof preview.title === 'string' ? preview.title : null;

    return response.status(200).json({ image, title });
  } catch (error) {
    return response.status(500).json({ msg: `Failed to fetch preview image. ${error}` });
  }
}
