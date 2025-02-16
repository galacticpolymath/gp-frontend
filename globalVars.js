/* eslint-disable indent */

export const PASSWORD_RESET_TOKEN_VAR_NAME = "password_reset_token";
export const isProd = process.env.NEXT_PUBLIC_VERCEL_ENV === "production";
export const supportEmail = "mailto:feedback@galacticpolymath.com";
export const SHOWABLE_LESSONS_STATUSES = ["Live", "Beta"];
export const UNVIEWABLE_LESSON_STR = "Upcoming";
export const PROJECTED_LESSONS_FIELDS = [
    "CoverImage",
    "Subtitle",
    "Title",
    "Section",
    "ReleaseDate",
    "locale",
    "_id",
    "numID",
    "PublicationStatus",
    "LessonBanner",
    "LsnStatuses",
    "TargetSubject",
    "ForGrades",
    "GradesOrYears",
];
export const CONTACT_SUPPORT_EMAIL = "mailto:feedback@galacticpolymath.com";
export const TROUBLE_LOGGING_IN_LINK =
    "mailto:support@galacticpolymath.com?subject=Help%2C%20I%20can't%20log%20in!&body=Thanks%20for%20reaching%20out%E2%80%94we're%20so%20sorry%20you%20hit%20a%20snag%20while%20trying%20to%20log%20into%20our%20website.%20We're%20a%20tiny%20team%2C%20but%20will%20try%20to%20get%20this%20fixed%20as%20soon%20as%20possible!%0A%0APlease%20describe%20the%20problem%20as%20specifically%20as%20possible%3A%0A%0A%0AAttach%20a%20screenshot%20if%20you%20think%20it%20could%20be%20helpful.%0A%0AThanks%2C%0A%0AThe%20GP%20Tech%20Team%0A";

// user account inputs
export const USER_INPUT_BACKGROUND_COLOR = "#E8F0FE";
export const INPUT_FOCUS_BLUE_CLASSNAME = "input-focus-blue";
export const ERROR_INPUT_BORDER_COLOR = "solid 1px red";
