import moment from 'moment';
import { getVideoThumb } from './components/LessonSection/Preview/utils.js';
import { SHOWABLE_LESSONS_STATUSES, STATUSES_OF_SHOWABLE_LESSONS } from './globalVars.js';
import { getLinkPreview } from 'link-preview-js';
import { UNITS_URL_PATH } from './shared/constants';

export const createPaginationArr = (arr) => {
  const pgsArr = [];
  let pgOfDataArr = [];

  arr.forEach((val, index) => {
    pgOfDataArr.push(val);

    if (pgOfDataArr?.length === 6 || index === arr?.length - 1) {
      pgsArr.push(structuredClone(pgOfDataArr));
      pgOfDataArr = [];
    }
  });

  return pgsArr;
};

export const getGpVids = (lessons) => {
  const gpVideos = [];

  for (const lesson of lessons) {
    const lessonMultiMediaArr = [];
    const { Section, Title, numID, ReleaseDate } = lesson;

    if (
      Section?.preview?.Multimedia?.length &&
            Section?.preview?.Multimedia.every(
              (multiMediaItem) => multiMediaItem !== null
            )
    ) {
      for (const media of Section.preview.Multimedia) {
        const isTargetGpVidPresent = gpVideos?.length
          ? gpVideos.some(
            ({ mainLink: gpVidMainLink }) => gpVidMainLink === media.mainLink
          )
          : false;

        if (
          !isTargetGpVidPresent &&
                    media.by === 'Galactic Polymath' &&
                    media.type === 'video' &&
                    typeof media.mainLink === 'string' &&
                    media.mainLink.includes('youtube')
        ) {
          lessonMultiMediaArr.push({
            ReleaseDate: ReleaseDate,
            lessonUnitTitle: Title,
            videoTitle: media.title,
            mainLink: media.mainLink,
            description: media.description ?? media.lessonRelevance,
            thumbnail: getVideoThumb(media.mainLink),
            unitNumId: numID,
            lessonNumId:
                            media.forLsn && Number.isInteger(+media.forLsn)
                              ? parseInt(media.forLsn)
                              : null,
          });
        }
      }
    }

    if (lessonMultiMediaArr?.length) {
      gpVideos.push(...lessonMultiMediaArr);
    }
  }

  return gpVideos.sort(
    (videoA, videoB) => videoB.ReleaseDate - videoA.ReleaseDate
  );
};

export const getGpLessons = (lessons) => {
  const lessonPartsForUI = [];
  const todaysDate = new Date();

  for (const lesson of lessons) {
    if (
      !lesson?.LsnStatuses?.length ||
            !SHOWABLE_LESSONS_STATUSES.includes(lesson.PublicationStatus)
    ) {
      continue;
    }

    const lessonParts = lesson?.Section?.['teaching-materials']?.Data?.lesson;
    const lessonPartsFromClassRoomObj =
            lesson?.Section?.['teaching-materials']?.Data?.classroom?.resources?.[0]
              ?.lessons;

    if (lessonParts?.length) {
      for (const lsnStatus of lesson.LsnStatuses) {
        if (!SHOWABLE_LESSONS_STATUSES.includes(lsnStatus.status)) {
          continue;
        }

        const lessonPart = lessonParts.find(
          ({ lsnNum }) => lsnNum === lsnStatus.lsn
        );
        const wasLessonReleased =
                    moment(todaysDate).format('YYYY-MM-DD') >
                    moment(lsnStatus.unit_release_date).format('YYYY-MM-DD');

        if (lessonPart && wasLessonReleased) {
          const lessonPartFromClassroomObj = lessonPartsFromClassRoomObj.find(
            ({ lsn }) => lsn === lsnStatus.lsn
          );
          let tags = Array.isArray(lessonPartFromClassroomObj?.tags?.[0])
            ? lessonPartFromClassroomObj?.tags.flat()
            : lessonPartFromClassroomObj?.tags;
          tags = tags?.length ? tags.filter((tag) => tag) : tags;
          const lessonPartForUI = {
            tags: tags ?? null,
            lessonPartPath: `/${UNITS_URL_PATH}/${lesson.locale}/${lesson.numID}#lesson_part_${lessonPart.lsnNum}`,
            tile:
                            lessonPartFromClassroomObj?.tile ??
                            'https://storage.googleapis.com/gp-cloud/icons/Missing_Lesson_Tile_Icon.png',
            lessonPartTitle: lessonPart.lsnTitle,
            dur: lessonPart.lsnDur,
            preface: lessonPart.lsnPreface,
            lessonPartNum: lessonPart.lsnNum,
            lessonTitle: lesson.Title,
            subject: lesson.TargetSubject,
            grades: lesson.ForGrades,
            gradesOrYears: lesson.GradesOrYears,
            status: lsnStatus.status,
          };

          lessonPartsForUI.push(lessonPartForUI);
        }
      }
    }
  }

  let lessonParts = structuredClone(lessonPartsForUI);

  if (lessonParts?.length) {
    lessonParts = lessonParts.sort(
      (
        { sort_by_date: sortByDateLessonA },
        { sort_by_date: sortByDateLessonB }
      ) => {
        const _sortByDateLessonA = new Date(sortByDateLessonA);
        const _sortByDateLessonB = new Date(sortByDateLessonB);

        if (_sortByDateLessonA > _sortByDateLessonB) {
          return -1;
        }

        if (_sortByDateLessonA < _sortByDateLessonB) {
          return 1;
        }

        return 0;
      }
    );
  }

  return lessonParts;
};

export const getShowableUnits = (units) => {
  const uniqueUnits = [];
  const todaysDate = new Date();

  for (const unit of units) {
    if (
      STATUSES_OF_SHOWABLE_LESSONS.includes(unit.PublicationStatus) &&
            !uniqueUnits.some((uniqueUnit) => unit.numID === uniqueUnit.numID) &&
            moment(unit.ReleaseDate).format('YYYY-MM-DD') <=
            moment(todaysDate).format('YYYY-MM-DD')
    ) {
      uniqueUnits.push(unit);
      continue;
    }

    if (
      STATUSES_OF_SHOWABLE_LESSONS.includes(unit.PublicationStatus) &&
            uniqueUnits.some((uniqueUnit) => unit.numID === uniqueUnit.numID)
    ) {
      const targetUnitIndex = uniqueUnits.findIndex(
        (uniqueUnit) => unit.numID === uniqueUnit.numID
      );
      let targetUnit = uniqueUnits[targetUnitIndex];

      targetUnit = {
        ...targetUnit,
        locals: targetUnit?.locals
          ? [...targetUnit.locals, unit.locale]
          : [targetUnit.locale, unit.locale],
      };

      uniqueUnits[targetUnitIndex] = targetUnit;
    }
  }

  return uniqueUnits;
};

export const getIsTypeValid = (val, targetType) => {
  return typeof val === targetType;
};

const isSafeExternalUrl = (url = '') => {
  try {
    const parsed = new URL(url);

    if (!/^https?:$/i.test(parsed.protocol)) {
      return false;
    }

    const hostname = parsed.hostname.toLowerCase();

    if (hostname === 'localhost' || hostname.endsWith('.localhost')) {
      return false;
    }

    const ipv4Match = hostname.match(/^(\d{1,3}\.){3}\d{1,3}$/);
    if (ipv4Match) {
      const octets = hostname.split('.').map(Number);

      if (octets[0] === 10) {
        return false;
      }

      if (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) {
        return false;
      }

      if (octets[0] === 192 && octets[1] === 168) {
        return false;
      }

      if (octets[0] === 127) {
        return false;
      }

      if (octets[0] === 169 && octets[1] === 254) {
        return false;
      }
    }

    if (hostname === '169.254.169.254') {
      return false;
    }

    return true;
  } catch {
    return false;
  }
};

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

const fetchMetaImagePreview = async (url = '') => {
  if (
    !url ||
    typeof url !== 'string' ||
    !/^https?:\/\//i.test(url) ||
    !isSafeExternalUrl(url)
  ) {
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
};

export const getLinkPreviewObj = async (url = '') => {
  try {
    if (!url || typeof url !== 'string') {
      throw new Error(
        'Either received an empty string or an incorrect data type.'
      );
    }

    const linkPreviewObj = await getLinkPreview(url);

    const hasImages =
      Array.isArray(linkPreviewObj?.images) && linkPreviewObj.images.length > 0;

    if (hasImages) {
      return linkPreviewObj;
    }

    const metaPreview = await fetchMetaImagePreview(url);

    if (!metaPreview) {
      return linkPreviewObj;
    }

    return {
      ...linkPreviewObj,
      images: metaPreview.images,
      title: linkPreviewObj?.title || metaPreview.title,
    };

  } catch (error) {
    const metaPreview = await fetchMetaImagePreview(url);

    if (metaPreview) {
      return metaPreview;
    }

    const errMsg = `An error has occurred in getting the link preview for given url. Error message: ${error}.`;
    console.error(errMsg);

    return { errMsg };
  }
};

export { isSafeExternalUrl };

export const getIsValObj = (val) =>
  typeof val === 'object' && !Array.isArray(val) && val !== null;

export const getObjVals = (obj) => {
  const keys = Object.keys(obj);
  const vals = [];

  keys.forEach((key) => {
    const val = obj[key];
    vals.push(val);
  });

  return vals;
};

/**
 *
 * @param {string} urlOriginWithPaths
 * @param {[string, unknown][]} searchQuery
 */
export const constructUrlWithSearchQuery = (
  urlOriginWithPaths,
  searchQuery
) => {
  const url = new URL(urlOriginWithPaths);

  for (const [key, val] of searchQuery) {
    url.searchParams.append(key, val);
  }

  return url;
};

const searchParamsDefault =
    typeof window === 'undefined' ? null : window.location.search;

export const getUrlParamVal = (
  searchParams = searchParamsDefault,
  paramName = ''
) => {
  const urlSearchParams = new URLSearchParams(searchParams);

  return urlSearchParams.get(paramName);
};

export const createObj = (keysAndValsArr = []) => {
  if (!keysAndValsArr?.length) {
    console.error('The array to create the object is empty.');
    return null;
  }

  const isKeysAndValsArrValid = keysAndValsArr.every((keyAndVal) => {
    if (!Array.isArray(keyAndVal)) {
      return false;
    }

    if (!['symbol', 'string'].includes(typeof keyAndVal[0])) {
      return false;
    }

    return true;
  });

  if (!isKeysAndValsArrValid) {
    console.error(
      'Each value fo the `keysAndVals` arr must have the following format: [key: string | symbol, value: any]'
    );
    return null;
  }

  return keysAndValsArr.reduce((obj, currentKeyAndVal) => {
    const [key, val] = currentKeyAndVal;
    obj[key.trim()] = val;

    return obj;
  }, {});
};

export const getIsParsable = (val) => {
  try {
    JSON.parse(val);

    return true;
  } catch (error) {
    console.error('Not parsable. Reason: ', error);

    return false;
  }
};

export const getIsParsableToVal = (val, valType, isArr) => {
  try {
    const parsedVal = JSON.parse(val);

    if (typeof parsedVal !== valType) {
      throw Error('Incorrect parsed value type.');
    }

    if (isArr) {
      return Array.isArray(parsedVal);
    }

    if (valType === 'object') {
      return getIsValObj(parsedVal);
    }

    return true;
  } catch (error) {
    console.error('Not parsable. Reason: ', error);

    return false;
  }
};

export const sleep = (milliseconds) => {
  console.log(`Will sleep for: ${milliseconds} ms`);

  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
};

export const getIsObj = (val) => !!val && typeof val === 'object';

/**
 * @param {import('next/router').NextRouter} router
 */
export const resetUrl = (router) => {
  const url = router.asPath;
  router.replace(url.split('?')[0]);
};

/**
 * @param {Map<string, any>} map
 * @return {object}
 */
export const convertMapToObj = (map) => Object.fromEntries(map.entries());

/**
 *  @param {import('next/router').NextRouter} router
 *  @param {string} urlField
 *  @returns {string[]}
 * */
export const getAllUrlVals = (router, willCreateSubTuples = false) => {
  const pathsStr = router.asPath.split('?')[1];
  const urlKeysAndVals = pathsStr?.split('&');

  if (urlKeysAndVals?.length && willCreateSubTuples) {
    const urlKeysAndValsTuples = urlKeysAndVals.map((keyAndValStr) => {
      return keyAndValStr.split('=');
    });

    return urlKeysAndValsTuples;
  }

  return urlKeysAndVals;
};

/**
 *
 * @param {any[]} arr
 * @param {number} chunkSize
 * @returns {any[][]}
 */
export const getChunks = (arr, chunkSize) => {
  const chunks = [];
  let chunkWindow = [];

  for (let index = 0; index < arr.length; index++) {
    const val = arr[index];

    if (chunkWindow.length === chunkSize) {
      chunks.push(chunkWindow);
      chunkWindow = [];
    }

    chunkWindow.push(val);

    if (index === arr.length - 1) {
      chunks.push(chunkWindow);
    }
  }

  return chunks;
};

export const createChunks = (arr, chunkSize) => {
  const chunks = [];
  let chunkWindow = [];

  for (let index = 0; index < arr.length; index++) {
    const val = arr[index];

    if (chunkWindow.length === chunkSize) {
      chunks.push(chunkWindow);
      chunkWindow = [];
    }

    chunkWindow.push(val);

    if (index === arr.length - 1) {
      chunks.push(chunkWindow);
    }
  }

  return chunks;
};

/**
 * @param {import('next/router').NextRouter} router
 * @param {string} targetKey
 */
export const getTargetKeyValFromUrl = (router, targetKey) => {
  const urlVals = getAllUrlVals(router)?.flatMap((urlVal) => urlVal.split('='));
  const urlValsChunks = urlVals?.length ? getChunks(urlVals, 2) : [];
  const targetKeyVal = urlValsChunks.find(([key]) => key === targetKey);

  return targetKeyVal;
};

export const validateEmail = (email) => {
  return email.match(
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  );
};

export const getIsWithinParentElement = (
  element,
  specifier,
  classNameOrId = 'className'
) => {
  if (
    !element?.parentElement ||
        (element?.parentElement &&
            classNameOrId in element.parentElement &&
            element?.parentElement[classNameOrId] === undefined)
  ) {
    console.error('Reached end of document.');
    return false;
  }

  if (
    element?.parentElement !== null &&
        typeof element?.parentElement === 'object' &&
        typeof element.parentElement[classNameOrId] === 'string' &&
        element.parentElement[classNameOrId].includes(specifier)
  ) {
    return true;
  }

  return getIsWithinParentElement(
    element.parentElement,
    specifier,
    classNameOrId
  );
};

export const waitWithExponentialBackOff = async (
  num = 1,
  range = [1000, 5_500],
) => {
  const [min, max] = range;
  const randomNumMs = Math.floor(Math.random() * (max - min + 1)) + 1000;
  const waitTime = randomNumMs + num * 1_000;

  console.log(`Waiting for ${waitTime}ms...`);

  await sleep(waitTime);

  return num + 1;
};
