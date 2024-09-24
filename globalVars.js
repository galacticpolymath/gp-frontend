/* eslint-disable indent */

export const PASSWORD_RESET_TOKEN_VAR_NAME = 'password_reset_token';
export const isProd = process.env.NEXT_PUBLIC_VERCEL_ENV === 'production';
export const supportEmail = 'mailto:feedback@galacticpolymath.com';
export const SHOWABLE_LESSONS_STATUSES = ['Live', 'Beta'];
export const UNVIEWABLE_LESSON_STR = 'Upcoming';
export const PROJECTED_LESSONS_FIELDS = [
    'CoverImage',
    'Subtitle',
    'Title',
    'Section',
    'ReleaseDate',
    'locale',
    '_id',
    'numID',
    'PublicationStatus',
    'LessonBanner',
    'LsnStatuses',
    'TargetSubject',
    'ForGrades',
    'GradesOrYears',
];