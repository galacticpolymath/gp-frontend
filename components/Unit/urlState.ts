export const URL_PARAM_TAB = 't';
export const URL_PARAM_LESSON = 'lsn';
export const URL_PARAM_PREVIEW = 'pv';
export const URL_PARAM_RESOURCE = 'rsrc';
export const URL_PARAM_STANDALONE = 'sp';
export const URL_PARAM_AUTOPRINT = 'ap';
export const URL_STANDALONE_PROCEDURE = 'pro';
export const URL_STANDALONE_BACKGROUND = 'bg';

export const TAB_TO_URL = {
  overview: 'ov',
  materials: 'mat',
  standards: 'std',
  credits: 'crd',
} as const;

export const URL_TO_TAB: Record<
  (typeof TAB_TO_URL)[keyof typeof TAB_TO_URL],
  keyof typeof TAB_TO_URL
> = {
  ov: 'overview',
  mat: 'materials',
  std: 'standards',
  crd: 'credits',
};

export const PREVIEW_TO_URL = {
  materials: 'mat',
  procedure: 'pro',
  background: 'bg',
  'featured-media': 'fm',
  'going-further': 'gf',
  jobviz: 'jv',
} as const;

export const URL_TO_PREVIEW: Record<
  (typeof PREVIEW_TO_URL)[keyof typeof PREVIEW_TO_URL],
  keyof typeof PREVIEW_TO_URL
> = {
  mat: 'materials',
  pro: 'procedure',
  bg: 'background',
  fm: 'featured-media',
  gf: 'going-further',
  jv: 'jobviz',
};

export const parseTabFromUrlValue = (value: string) => {
  if (value in URL_TO_TAB) {
    return URL_TO_TAB[value as keyof typeof URL_TO_TAB];
  }

  return undefined;
};

export const parsePreviewFromUrlValue = (value: string) => {
  if (value in URL_TO_PREVIEW) {
    return URL_TO_PREVIEW[value as keyof typeof URL_TO_PREVIEW];
  }

  return undefined;
};
