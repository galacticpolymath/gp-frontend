import Layout from '../../../../components/Layout';
import sanitizeHtml from 'sanitize-html';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import { connectToMongodb } from '../../../../backend/utils/connection';
import SendFeedback from '../../../../components/LessonSection/SendFeedback';
import { getLinkPreviewObj } from '../../../../globalFns';
import { useModalContext } from '../../../../providers/ModalProvider';
import axios from 'axios';
import { useUserContext } from '../../../../providers/UserProvider';
import {
  INewUnitSchema,
  ISections,
  TSectionsForUI,
  TUnitForUI,
} from '../../../../backend/models/Unit/types/unit';
import Units from '../../../../backend/models/Unit';
import {
  IItemForUI,
  INewUnitLesson,
  IResource,
  ISharedGDriveLessonFolder,
  ITeachingMaterialsDataForUI,
  ILessonDetail,
} from '../../../../backend/models/Unit/types/teachingMaterials';
import { TUserSchemaForClient } from '../../../../backend/models/User/types';
import LessonItemsModal from '../../../../components/LessonSection/Modals/LessonItemsModal';
import GpPlusModal from '../../../../components/LessonSection/Modals/GpPlusModal';
import ThankYouModal from '../../../../components/GpPlus/ThankYouModal';
import {
  getLocalStorageItem,
  removeLocalStorageItem,
  setLocalStorageItem,
  setSessionStorageItem,
} from '../../../../shared/fns';
import useSiteSession from '../../../../customHooks/useSiteSession';
import { getUnitGDriveChildItems } from '../../../../backend/services/gdriveServices';
import CopyLessonHelperModal from '../../../../components/GpPlus/CopyLessonHelperModal';
import FailedCopiedFilesReportModal from '../../../../components/GpPlus/FailedCopiedFilesReportModal';
import WelcomeNewUserModal from '../../../../components/Modals/WelcomeNewUserModal';
import { IOverviewProps } from '../../../../components/LessonSection/Overview';
import { buildUnitUrl, DEFAULT_LOCALE, getSiteUrl } from '../../../../shared/seo';
import UnitPage from '../../../../components/Unit/UnitPage';

const GOOGLE_DRIVE_THUMBNAIL_URL = 'https://drive.google.com/thumbnail?id=';
const providePlainText = (value?: string | null) =>
  value
    ? sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} })
      .replace(/\s+/g, ' ')
      .trim()
    : '';
const isoFromDate = (value?: string | Date | null) => {
  if (!value) {
    return undefined;
  }
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return date.toISOString();
};
type TAlignmentObject = {
  '@type': 'AlignmentObject';
  alignmentType: 'educationalStandard';
  educationalFramework?: string;
  targetName: string;
  targetUrl?: string;
};

type TSeoLessonHighlight = {
  name: string;
  description?: string;
  keywords?: string[];
};

type TSeoCareer = { name: string; socCode?: string | null };

type TSeoContent = {
  contextualSummary?: string | null;
  standardAlignments?: TAlignmentObject[];
  lessonHighlights?: TSeoLessonHighlight[];
  careerConnections?: TSeoCareer[];
};

const extractMarkdownSection = (
  markdown?: string | null,
  headingPattern?: string
) => {
  if (!markdown || !headingPattern) {
    return null;
  }
  const pattern = new RegExp(
    `####\\s*${headingPattern}\\s*:?\\s*([\\s\\S]*?)(?=\\n####|$)`,
    'i'
  );
  const match = markdown.match(pattern);
  if (!match) {
    return null;
  }
  return providePlainText(match[1]);
};

const getStandardAlignments = (
  TargetStandardsCodes: TUnitForUI['TargetStandardsCodes']
): TAlignmentObject[] => {
  if (!Array.isArray(TargetStandardsCodes)) {
    return [];
  }
  return TargetStandardsCodes.map((standard) => {
    const targetName = [standard?.subject, standard?.code]
      .filter(Boolean)
      .join(' ')
      .trim();
    return {
      '@type': 'AlignmentObject' as const,
      alignmentType: 'educationalStandard' as const,
      educationalFramework: standard?.set ?? standard?.subject ?? undefined,
      targetName: targetName || standard?.dim || 'Educational standard',
    };
  }).filter((alignment) => alignment.targetName);
};

const getCareerConnections = (unit: TUnitForUI): TSeoCareer[] => {
  const content = unit.Sections?.jobvizConnections?.Content;
  if (!Array.isArray(content)) {
    return [];
  }

  const connections: TSeoCareer[] = [];
  content.forEach((connection) => {
    const jobTitle = Array.isArray(connection?.job_title)
      ? connection?.job_title?.[0]
      : connection?.job_title;
    const socCode = Array.isArray(connection?.soc_code)
      ? connection?.soc_code?.[0]
      : connection?.soc_code;

    if (jobTitle) {
      connections.push({
        name: jobTitle,
        socCode: socCode ?? null,
      });
    }
  });

  return connections;
};

const getLessonHighlights = (unit: TUnitForUI): TSeoLessonHighlight[] => {
  const teachingMaterials = unit.Sections?.teachingMaterials as
    | (ITeachingMaterialsDataForUI<INewUnitLesson> & {
        lesson?: ILessonDetail[];
      })
    | undefined;
  const lessons = teachingMaterials?.lesson;

  if (!Array.isArray(lessons)) {
    return [];
  }

  const highlights: TSeoLessonHighlight[] = [];

  lessons.forEach((lesson) => {
    if (!lesson) {
      return;
    }
    const segments = [];
    if (lesson.lsnNum) {
      segments.push(`Lesson ${lesson.lsnNum}`);
    }
    if (lesson.lsnTitle) {
      segments.push(lesson.lsnTitle);
    }
    const name = (segments.join(': ').trim() || lesson.lsnTitle)?.trim();
    if (!name) {
      return;
    }
    const learningObjectives = Array.isArray(lesson.learningObj)
      ? lesson.learningObj.filter(Boolean)
      : [];
    const description =
      lesson.lsnPreface ||
      (learningObjectives.length
        ? `Students will be able to ${learningObjectives.join('; ')}.`
        : undefined);

    const rawLessonTags = (lesson as { lsnTags?: string[] }).lsnTags;
    const lessonTags: string[] = Array.isArray(rawLessonTags)
      ? rawLessonTags.filter((tag): tag is string => typeof tag === 'string' && tag.trim().length > 0)
      : [];

    highlights.push({
      name,
      description: description ? providePlainText(description) : undefined,
      keywords: lessonTags,
    });
  });

  return highlights;
};

const collectUnitSeoContent = (unit: TUnitForUI) => {
  const overview = unit.Sections?.overview ?? {};
  const tags = new Set<string>();

  const addTags = (values?: (string | null | undefined)[]) => {
    values
      ?.filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
      .forEach((value) => tags.add(value.trim()));
  };

  addTags(overview?.UnitTags ?? undefined);
  addTags(overview?.Tags?.map((tag) => tag.Value));

  const lessonHighlights = getLessonHighlights(unit);
  lessonHighlights.forEach((lesson) => addTags(lesson.keywords));

  const careerConnections = getCareerConnections(unit);
  careerConnections.forEach((career) => addTags([career.name]));

  const standardAlignments = getStandardAlignments(unit.TargetStandardsCodes);
  standardAlignments.forEach((alignment) => addTags([alignment.targetName]));

  const drivingQuestions = extractMarkdownSection(
    overview?.Text,
    'Driving Question(?:\\(s\\))?'
  );
  const hooks = extractMarkdownSection(overview?.Text, 'Hook(?:\\(s\\))?');

  const gradeSpan =
    overview?.GradesOrYears ||
    unit.GradesOrYears ||
    overview?.ForGrades ||
    unit.ForGrades ||
    '';
  const subject =
    overview?.TargetSubject || unit.TargetSubject || 'interdisciplinary studies';
  const gist = overview?.TheGist
    ? providePlainText(overview.TheGist)
    : 'real-world STEM challenges';

  const summaryParts = [
    `An open-access unit for ${gradeSpan || 'grades'} focused on ${subject}.`,
    `Students explore how ${gist}`,
  ];

  if (drivingQuestions) {
    summaryParts.push(`Driving Questions: ${drivingQuestions}`);
  }

  if (hooks) {
    summaryParts.push(`Hooks: ${hooks}`);
  }

  if (lessonHighlights.length) {
    summaryParts.push(
      `Lesson highlights include ${lessonHighlights
        .slice(0, 2)
        .map((lesson) => lesson.name)
        .join(' and ')}.`
    );
  }

  if (careerConnections.length) {
    summaryParts.push(
      `Career connections: ${careerConnections
        .slice(0, 4)
        .map((career) => career.name)
        .join(', ')}`
    );
  }

  const contextualSummary = summaryParts.join(' ').replace(/\s+/g, ' ').trim();

  return {
    contextualSummary,
    careerConnections,
    lessonHighlights,
    standardAlignments,
    keywords: Array.from(tags),
  };
};

const createUnitStructuredData = (
  unit: TUnitForUI,
  canonicalUrl: string,
  unitBanner: string,
  seoContent?: TSeoContent
) => {
  const overviewDescription = unit?.Sections?.overview?.TheGist ?? '';
  const description = providePlainText(overviewDescription);
  const datePublished = isoFromDate(unit?.ReleaseDate ?? null);
  const dateModified =
    isoFromDate(unit?.LastUpdated_web ?? null) ??
    isoFromDate(unit?.LastUpdated ?? null);

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: unit.Title,
    description: description || undefined,
    url: canonicalUrl,
    image: unitBanner || undefined,
    inLanguage: unit.locale ?? DEFAULT_LOCALE,
    datePublished,
    dateModified,
    creativeWorkStatus: unit.PublicationStatus ?? undefined,
    provider: {
      "@type": "Organization",
      name: "Galactic Polymath",
      url: getSiteUrl(),
    },
    audience: {
      "@type": "EducationalAudience",
      educationalRole: "teacher",
    },
    educationalLevel: unit.ForGrades ?? undefined,
    isAccessibleForFree: true,
    offers: [
      {
        "@type": "Offer",
        availability: "https://schema.org/InStock",
        price: 0,
        priceCurrency: "USD",
        description:
          "Free, open-access lesson view with data-rich career connections.",
      },
      {
        "@type": "Offer",
        availability: "https://schema.org/InStock",
        description:
          "GP+ subscription unlocks editable lesson files, JobViz career tours, and classroom convenience features.",
      },
    ],
  };

  if (unit.TargetSubject) {
    schema.about = [
      {
        "@type": "Thing",
        name: unit.TargetSubject,
      },
    ];
  }

  if (unit.GradesOrYears) {
    schema.educationalAlignment = {
      "@type": "AlignmentObject",
      alignmentType: "educationalLevel",
      educationalFramework: "Grades or Years",
      targetName: unit.GradesOrYears,
    };
  }

  if (seoContent?.standardAlignments?.length) {
    const existing = schema.educationalAlignment;
    schema.educationalAlignment = Array.isArray(existing)
      ? [...existing, ...seoContent.standardAlignments]
      : seoContent.standardAlignments;
  }

  if (seoContent?.lessonHighlights?.length) {
    schema.hasPart = seoContent.lessonHighlights.map((lesson) => {
      const lessonSchema: Record<string, unknown> = {
        "@type": "CreativeWork",
        name: lesson.name,
        learningResourceType: "Lesson",
      };

      if (lesson.description) {
        lessonSchema.description = lesson.description;
      }

      if (lesson.keywords?.length) {
        lessonSchema.keywords = lesson.keywords.join(", ");
      }

      return lessonSchema;
    });
  }

  const aboutEntries: Record<string, unknown>[] = [];

  if (seoContent?.contextualSummary) {
    aboutEntries.push({
      "@type": "Thing",
      name: seoContent.contextualSummary,
    });
  }

  if (seoContent?.careerConnections?.length) {
    seoContent.careerConnections.forEach(({ name, socCode }) => {
      const occupation: Record<string, unknown> = {
        "@type": "Occupation",
        name,
      };

      if (socCode) {
        occupation.identifier = {
          "@type": "PropertyValue",
          propertyID: "SOC",
          value: socCode,
        };
      }

      aboutEntries.push(occupation);
    });
  }

  if (aboutEntries.length) {
    schema.about = Array.isArray(schema.about)
      ? [...aboutEntries, ...schema.about]
      : aboutEntries;
  }

  return schema;
};

interface IProps {
  unit?: TUnitForUI;
}

const SECTIONS_TO_FILTER_OUT: Set<keyof ISections> = new Set([] as (keyof ISections)[]);

type TUpdateSection = (sectionVal: object, unit: TUnitForUI) => object;

export const updateOverviewSection = (sectionVal: object, unit: TUnitForUI) => {
  const jobVizConnectionsSec = unit.Sections?.jobvizConnections;

  if (!jobVizConnectionsSec) {
    return {
      ...sectionVal,
      TargetStandardsCodes: unit.TargetStandardsCodes
    };
  }

  const previewJobsSliced = jobVizConnectionsSec.Content.slice(0, 3);
  const jobTitleAndSocCodePairs: [string, string][] = [];

  for (const previewJob of previewJobsSliced) {
    const jobTitle = Array.isArray(previewJob.job_title) ? previewJob.job_title.at(0) : previewJob.job_title;
    const socCode = Array.isArray(previewJob.job_title) ? previewJob.job_title.at(0) : previewJob.job_title;

    if (!socCode || !jobTitle) {
      console.error('Developer Error: Missing job title or SOC code in JobViz preview jobs.', { previewJob });
      continue;
    }

    jobTitleAndSocCodePairs.push([jobTitle, socCode]);
  }

  const additionalJobsNum =
    jobVizConnectionsSec.Content.length - jobTitleAndSocCodePairs.length;
  const overviewSecProps: IOverviewProps = {
    ...(sectionVal as IOverviewProps),
    jobVizCareerConnections: {
      additionalJobsNum,
      jobTitleAndSocCodePairs,
    },
    TargetStandardsCodes: unit.TargetStandardsCodes

  };

  return overviewSecProps;
}

const SECTION_UPDATERS: Partial<Record<keyof TSectionsForUI, TUpdateSection>> = {
  jobvizConnections: (sectionVal: object, unit: TUnitForUI) => {
    return {
      ...sectionVal,
      unitName: unit.Title,
    };
  },
  overview: updateOverviewSection,
};

const LessonDetails: React.FC<IProps> = ({ unit }) => {
  useMemo(() => {
    if (unit?.Sections) {
      const unitSections = Object.entries(unit.Sections).reduce(
        (sections: TSectionsForUI, sectionKeyAndSection) => {
          const sectionKey = sectionKeyAndSection[0] as keyof TSectionsForUI;
          let sectionVal = sectionKeyAndSection[1] as object;

          if (SECTIONS_TO_FILTER_OUT.size && SECTIONS_TO_FILTER_OUT.has(sectionKey)) {
            return sections;
          }

          const updateSectionFn = SECTION_UPDATERS[sectionKey];
          if (updateSectionFn) {
            sectionVal = updateSectionFn(sectionVal, unit);
          }

          return {
            ...sections,
            [sectionKey]: sectionVal,
          };
        },
        {} as TSectionsForUI
      );

      unit.Sections = unitSections;
    }
  }, [unit]);

  const {
    _isUserTeacher,
    _isGpPlusMember,
    _isCopyUnitBtnDisabled,
    _didAttemptRetrieveUserData,
    _userLatestCopyUnitFolderId,
  } = useUserContext();
  const session = useSiteSession();
  const { status, token, gdriveAccessToken, gdriveRefreshToken, gdriveEmail } = session;
  const statusRef = useRef(status);

  useMemo(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('isOverLessonPart');
    }
  }, []);

  const { _isGpPlusModalDisplayed, _lessonItemModal, _isThankYouModalDisplayed } =
    useModalContext();
  const [, setIsThankYouModalDisplayed] = _isThankYouModalDisplayed;
  const [, setIsUserTeacher] = _isUserTeacher;
  const [, setIsGpPlusMember] = _isGpPlusMember;
  const [, setIsCopyUnitBtnDisabled] = _isCopyUnitBtnDisabled;
  const [, setUserLatestCopyUnitFolderId] = _userLatestCopyUnitFolderId;
  const [, setDidAttemptRetrieveUserData] = _didAttemptRetrieveUserData;
  const [, setIsGpPlusModalDisplayed] = _isGpPlusModalDisplayed;
  const [, setLessonItemModal] = _lessonItemModal;

  useEffect(() => {
    statusRef.current = status;

    (async () => {
      if (status === 'authenticated' && token) {
        try {
          setDidAttemptRetrieveUserData(false);
          setIsCopyUnitBtnDisabled(true);
          const paramsAndHeaders = {
            params: {
              willNotRetrieveMailingListStatus: true,
              unitId: unit?._id,
              gdriveEmail,
            },
            headers: {
              Authorization: `Bearer ${token}`,
              'gdrive-token': gdriveAccessToken,
              'gdrive-token-refresh': gdriveRefreshToken,
            },
          };

          const { status, data } = await axios.get<TUserSchemaForClient>(
            '/api/get-user-account-data',
            paramsAndHeaders
          );

          if (status !== 200) {
            throw new Error(
              'An error has occurred. Failed to check if the user is a teacher.'
            );
          }

          setIsUserTeacher(!!data?.isTeacher);
          setIsGpPlusMember(!!data?.isGpPlusMember);
          setSessionStorageItem('isGpPlusUser', !!data.isGpPlusMember);
          setLocalStorageItem(
            'willShowGpPlusCopyLessonHelperModal',
            typeof data.willShowGpPlusCopyLessonHelperModal === 'boolean'
              ? data.willShowGpPlusCopyLessonHelperModal
              : true
          );

          if (data.viewingUnitFolderCopyId) {
            setUserLatestCopyUnitFolderId(data.viewingUnitFolderCopyId);
          }

          const willShowGpPlusPurchaseThankYouModal = getLocalStorageItem(
            'willShowGpPlusPurchaseThankYouModal'
          );

          if (data.isGpPlusMember && willShowGpPlusPurchaseThankYouModal) {
            setIsThankYouModalDisplayed(true);
            removeLocalStorageItem('willShowGpPlusPurchaseThankYouModal');
          }
        } catch (error) {
          console.error('An error has occurred: ', error);
        } finally {
          setIsCopyUnitBtnDisabled(false);
          setDidAttemptRetrieveUserData(true);
        }
      } else if (status === 'unauthenticated') {
        setIsCopyUnitBtnDisabled(false);
        setDidAttemptRetrieveUserData(true);
      }
    })();
  }, [gdriveAccessToken, gdriveEmail, gdriveRefreshToken, setDidAttemptRetrieveUserData, setIsCopyUnitBtnDisabled, setIsGpPlusMember, setIsThankYouModalDisplayed, setIsUserTeacher, setUserLatestCopyUnitFolderId, status, token, unit?._id]);

  useEffect(() => {
    return () => {
      setIsGpPlusModalDisplayed(false);
      setLessonItemModal((state) => ({
        ...state,
        isDisplayed: false,
      }));
    };
  }, [setIsGpPlusModalDisplayed, setLessonItemModal]);

  const [isStandalonePreview, setIsStandalonePreview] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const searchParams = new URLSearchParams(window.location.search);
    const standaloneMode = searchParams.get('sp');
    const isProcedureOnly = standaloneMode === 'pro';
    const isBackgroundOnly = standaloneMode === 'bg';
    setIsStandalonePreview(isProcedureOnly || isBackgroundOnly);
  }, []);

  if (!unit) {
    return null;
  }

  const unitBanner = unit.UnitBanner ?? '';
  const canonicalLocale = unit.locale ?? DEFAULT_LOCALE;
  const canonicalUrl = buildUnitUrl(canonicalLocale, (unit.numID ?? '').toString());
  const defaultLocale = unit.DefaultLocale ?? canonicalLocale ?? DEFAULT_LOCALE;
  const defaultLocaleUrl = buildUnitUrl(defaultLocale, (unit.numID ?? '').toString());
  const seoContent = collectUnitSeoContent(unit);
  const keywordsMeta = seoContent.keywords?.length ? seoContent.keywords.join(', ') : undefined;
  const structuredData = createUnitStructuredData(unit, canonicalUrl, unitBanner, seoContent);

  const layoutProps: Record<string, unknown> = {
    title: `${unit.Title} | GP Unit`,
    description: unit.Sections?.overview?.TheGist
      ? sanitizeHtml(unit.Sections.overview.TheGist)
      : `Description for ${unit.Title}.`,
    imgSrc: unitBanner,
    url: canonicalUrl,
    imgAlt: `${unit.Title} cover image`,
    className: 'selected-unit-pg',
    canonicalLink: canonicalUrl,
    defaultLink: defaultLocaleUrl,
    langLinks: unit.headLinks ?? ([] as TUnitForUI['headLinks']),
    structuredData,
    locale: unit.locale ?? DEFAULT_LOCALE,
    keywords: keywordsMeta,
    showFooter: !isStandalonePreview,
  };

  return (
    <Layout {...(layoutProps as any)}>
      <ToastContainer stacked autoClose={false} position="bottom-right" />
      {unit.PublicationStatus === 'Beta' && (
        <SendFeedback
          closeBtnDynamicStyles={{
            position: 'absolute',
            top: '30px',
            right: '5px',
            fontSize: '28px',
          }}
          containerClassName="mt-4"
          parentDivStyles={{
            backgroundColor: '#EBD0FF',
            width: '100vw',
          }}
        />
      )}
      <UnitPage unit={unit} />
      <GpPlusModal />
      <LessonItemsModal />
      <ThankYouModal />
      <CopyLessonHelperModal />
      <FailedCopiedFilesReportModal />
      <WelcomeNewUserModal />
    </Layout>
  );
};

const getGoogleDriveFileIdFromUrl = (url: string) => {
  if (typeof url !== 'string') {
    return null;
  }

  const urlSplitted = url.split('/');
  const indexOfDInSplittedUrl = urlSplitted.findIndex((str) => str === 'd');

  if (indexOfDInSplittedUrl === -1) {
    return null;
  }

  const id = urlSplitted[indexOfDInSplittedUrl + 1];

  if (!id) {
    return null;
  }

  return id;
};

export const getStaticPaths = async () => {
  try {
    await connectToMongodb(15_000, 0, true);

    const units = [
      await Units.find({}, { numID: 1, _id: 0, locale: 1 }).lean(),
    ].flat();

    return {
      paths: units.map(({ numID, locale }) => ({
        params: { id: `${numID}`, loc: `${locale ?? ''}` },
      })),
      fallback: false,
    };
  } catch (error) {
    console.error(
      'An error has occurred in getting the available paths for the selected lesson page. Error message: ',
      error
    );

    return {
      paths: [],
      fallback: false,
    };
  }
};

export const getStaticProps = async (arg: {
  params: { id: string; loc: string };
}) => {
  try {
    const {
      params: { id, loc },
    } = arg;
    const { wasSuccessful } = await connectToMongodb(15_000, 7, true);

    if (!wasSuccessful) {
      throw new Error('Failed to connect to the database.');
    }

    const targetUnits = (await Units.find<INewUnitSchema>(
      { numID: parseInt(id) },
      { __v: 0 }
    ).lean()) as INewUnitSchema[];
    const availUnitLocales = targetUnits
      .map(({ locale }) => locale)
      .filter(Boolean) as string[];
    let targetUnitForUI: TUnitForUI | undefined = undefined;

    if (targetUnits?.length) {
      const availLocs = targetUnits
        .map(({ locale }) => locale)
        .filter(Boolean) as string[];
      const targetUnit = targetUnits.find(({ numID, locale }) => {
        return numID === parseInt(id) && locale === loc;
      });

      if (!targetUnit) {
        throw new Error('Unit is not found.');
      }

      const unitGDriveChildItemsAll = targetUnit.GdrivePublicID
        ? await getUnitGDriveChildItems(targetUnit.GdrivePublicID)
        : [];
      const gpGDriveLessonItems = unitGDriveChildItemsAll?.filter(item => item.mimeType !== "application/vnd.google-apps.folder")
      const unitGDriveChildItems = unitGDriveChildItemsAll?.filter((item) => item.mimeType?.includes('folder'));
      const headLinks = targetUnits
        .filter(({ locale, numID }) => locale && numID)
        .map(({ locale, numID }) => [
          buildUnitUrl(locale ?? DEFAULT_LOCALE, (numID ?? '').toString()),
          locale ?? DEFAULT_LOCALE,
        ]) as [string, string][];
      const resources =
        targetUnit.Sections?.teachingMaterials?.classroom?.resources;
      targetUnitForUI = targetUnit as TUnitForUI;
      targetUnitForUI = {
        ...targetUnitForUI,
        headLinks,
      };

      if (targetUnitForUI.FeaturedMultimedia) {
        targetUnitForUI.FeaturedMultimedia =
          targetUnitForUI.FeaturedMultimedia.map((multiMedia) => {
            if (multiMedia?.mainLink?.includes('www.youtube.com/shorts')) {
              multiMedia.mainLink = multiMedia.mainLink.replace(
                'shorts',
                'embed'
              );
            }

            return multiMedia;
          });
      }

      const isVidOrWebAppPresent = targetUnitForUI?.FeaturedMultimedia?.length
        ? targetUnitForUI.FeaturedMultimedia.some((multiMedia) => {
          return multiMedia.type === 'web-app' || multiMedia.type === 'video';
        })
        : false;

      // preview images for all of the multimedia content
      if (isVidOrWebAppPresent && targetUnitForUI.FeaturedMultimedia) {
        const featuredMultimediaWithImgPreviewsPromises =
          targetUnitForUI.FeaturedMultimedia.map(async (multiMediaItem) => {
            if (
              multiMediaItem.type === 'video' &&
              multiMediaItem?.mainLink?.includes('drive.google')
            ) {
              const videoId = multiMediaItem.mainLink.split('/').at(-2);
              multiMediaItem = {
                ...multiMediaItem,
                webAppPreviewImg: `https://drive.google.com/thumbnail?id=${videoId}`,
                webAppImgAlt: `'${multiMediaItem.title}' video`,
              };
            }

            if (multiMediaItem.type === 'web-app' && multiMediaItem?.mainLink) {
              const { errMsg, images, title } = (await getLinkPreviewObj(
                multiMediaItem?.mainLink
              )) as { errMsg: string; images: string[]; title: string };

              if (errMsg && !images?.length) {
                console.error(
                  'Failed to get the image preview of web app. Error message: ',
                  errMsg
                );
              }

              multiMediaItem = {
                ...multiMediaItem,
                webAppPreviewImg: errMsg || !images?.length ? null : images[0],
                webAppImgAlt:
                  errMsg || !images?.length ? null : `${title}'s preview image`,
              };

              return multiMediaItem;
            }

            return multiMediaItem;
          });
        const featuredMultimediaWithImgPreviews = await Promise.all(
          featuredMultimediaWithImgPreviewsPromises
        );

        targetUnitForUI.FeaturedMultimedia = featuredMultimediaWithImgPreviews;
      }

      // get the preview image for the google drive files and check the status of the lesson
      if (
        targetUnitForUI.Sections?.teachingMaterials?.classroom?.resources
          ?.length &&
        resources?.length
      ) {

        const resourcesForUIPromises = resources.map(async (resource) => {
          if (resource?.lessons?.length) {
            resource.lessons = resource.lessons.filter((lesson) => {
              if (!lesson.title || lesson?.status?.toLowerCase() === 'proto') {
                return false;
              }

              return true;
            });
            resource.lessons = resource?.lessons.map(lesson => {
              if (lesson.itemList?.length) {
                lesson.itemList = lesson.itemList.map(item => {
                  const gdriveRoot = "gdriveRoot" in item && item.gdriveRoot as string
                  const itemId = gdriveRoot ? gdriveRoot.split('/').at(-1) : undefined;
                  const targetItemInGpGDrive = itemId ? gpGDriveLessonItems?.find(lessonItem => lessonItem.id === itemId) : undefined;

                  if (targetItemInGpGDrive?.id) {
                    return {
                      ...item,
                      gpGDriveItemId: targetItemInGpGDrive.id
                    }
                  }

                  return item;
                });
              };

              return lesson;
            });
          }
          const allUnitLessons: Pick<
            INewUnitLesson,
            'allUnitLessons'
          >['allUnitLessons'] = [];

          if (resource.lessons && unitGDriveChildItems?.length) {
            for (const lesson of resource.lessons) {
              const targetUnitGDriveItem = unitGDriveChildItems.find((item) => {
                const itemName = item?.name?.split('_').at(-1);

                return (
                  itemName &&
                  lesson.title &&
                  itemName.toLowerCase() === lesson.title.toLowerCase()
                );
              });

              if (targetUnitGDriveItem?.id && lesson.lsn) {
                allUnitLessons.push({
                  id: lesson.lsn.toString(),
                  sharedGDriveId: targetUnitGDriveItem.id,
                });
              }
            }
          }

          let lessonsFolder:
            | Pick<INewUnitLesson, 'lessonsFolder'>['lessonsFolder']
            | undefined = undefined;
          const lessonsWithFilePreviewImgsPromises = resource.lessons?.map(
            async (lesson) => {
              if (!lessonsFolder && unitGDriveChildItems) {
                for (const unitGDriveChildItem of unitGDriveChildItems) {
                  const lessonTitle = lesson.title?.toLowerCase();

                  if (
                    lessonTitle === 'assessments' &&
                    lessonTitle !== unitGDriveChildItem.name?.toLowerCase()
                  ) {
                    continue;
                  }

                  let lessonName = unitGDriveChildItem.name;

                  if (unitGDriveChildItem.name?.includes('_')) {
                    lessonName = unitGDriveChildItem.name
                      ?.split('_')
                      .at(-1)
                      ?.toLowerCase();
                  }

                  if (
                    lessonName &&
                    lesson.title &&
                    lessonName.toLowerCase() === lessonTitle
                  ) {
                    const targetUnitGDriveChildItem =
                      unitGDriveChildItems.find((item) => {
                        if (lessonTitle === 'assessments') {
                          return item.name === 'assessments';
                        }

                        return (
                          item.id &&
                          item.id === unitGDriveChildItem.parentFolderId
                        );
                      }) ?? {};

                    const { name, id } = targetUnitGDriveChildItem;
                    lessonsFolder =
                      name && id
                        ? {
                          name: name,
                          sharedGDriveId: id,
                        }
                        : undefined;
                  }
                }
              }

              const targetGDriveSharedLessonFolders:
                | ISharedGDriveLessonFolder[]
                | undefined = unitGDriveChildItems
                  ?.filter((item) => {
                    const lessonName = item?.name?.split('_').at(-1);

                    return (
                      lessonName &&
                      lesson.title &&
                      lessonName.toLowerCase() === lesson.title.toLowerCase()
                    );
                  })
                  ?.map((itemA) => {

                    const lessonsFolder = unitGDriveChildItems.find((itemB) => {
                      return itemB.id === itemA.parentFolderId;
                    });


                    // if lessonsFolder.pathFile === '', then the item is located at the root of the google drive folder
                    const parentFolder = lessonsFolder
                      ? { id: lessonsFolder.id!, name: lessonsFolder.name! }
                      : {
                        id: targetUnit.GdrivePublicID!,
                        name: targetUnit.MediumTitle!,
                      };

                    return {
                      id: itemA.id!,
                      name: itemA.name!,
                      parentFolder,
                    };
                  });

              if (targetGDriveSharedLessonFolders?.length) {
                lesson = {
                  ...lesson,
                  sharedGDriveLessonFolders: targetGDriveSharedLessonFolders,
                  allUnitLessons,
                  lessonsFolder,
                };
              }


              if (!lesson.tile && lesson.status === 'Upcoming') {
                lesson = {
                  ...lesson,
                  tile: 'https://storage.googleapis.com/gp-cloud/icons/coming-soon_tile.png',
                };
              }

              lesson = {
                ...lesson,
                status: lesson.status ?? 'Proto',
              };

              const itemListWithFilePreviewImgsPromises = lesson.itemList?.map(
                async (item) => {
                  const { links, itemCat } = item;
                  const linkObj = links?.[0];
                  const url = linkObj?.url?.[0];

                  if (!url) {
                    return item;
                  }

                  if (itemCat === 'web resource') {
                    const linkPreviewObj = await getLinkPreviewObj(url);
                    const filePreviewImg =
                      'images' in linkPreviewObj
                        ? linkPreviewObj.images?.[0]
                        : null;

                    return {
                      ...item,
                      filePreviewImg,
                    } as IItemForUI;
                  }

                  const googleDriveFileId = getGoogleDriveFileIdFromUrl(url);

                  if (googleDriveFileId) {
                    const filePreviewImg = `${GOOGLE_DRIVE_THUMBNAIL_URL}${googleDriveFileId}`;

                    return {
                      ...item,
                      filePreviewImg,
                    } as IItemForUI;
                  }

                  return item as IItemForUI;
                }
              );

              if (itemListWithFilePreviewImgsPromises) {
                const itemListWithFilePreviewImgs = await Promise.all(
                  itemListWithFilePreviewImgsPromises
                );

                return {
                  ...lesson,
                  itemList: itemListWithFilePreviewImgs,
                } as INewUnitLesson<IItemForUI>;
              }

              return lesson as INewUnitLesson<IItemForUI>;
            }
          );

          if (lessonsWithFilePreviewImgsPromises) {
            const lessonsWithFilePreviewImgs = await Promise.all(
              lessonsWithFilePreviewImgsPromises
            );

            return {
              ...resource,
              lessons: lessonsWithFilePreviewImgs,
            } as IResource<INewUnitLesson<IItemForUI>>;
          }

          return resource as IResource<INewUnitLesson<IItemForUI>>;
        });

        const resourcesForUI = await Promise.all(resourcesForUIPromises);

        targetUnitForUI.Sections.teachingMaterials.classroom.resources =
          resourcesForUI;
      }

      const sectionsEntries = Object.entries(
        targetUnitForUI.Sections ?? {}
      ) as [keyof ISections, any][];
      // get the root fields for specific sections that required them
      let sectionsUpdated = sectionsEntries.reduce(
        (sectionsAccum, [sectionKey, section]) => {
          // if the section.Content is null, then return the sectionsAccum
          if (
            !section ||
            (typeof section === 'object' &&
              section &&
              (('Content' in section && !section.Content) ||
                ('Data' in section && !section.Data))) ||
            (sectionKey === 'preview' && !targetUnitForUI?.FeaturedMultimedia)
          ) {
            return sectionsAccum;
          }

          if (
            targetUnitForUI &&
            typeof section === 'object' &&
            section &&
            section?.rootFieldsToRetrieveForUI &&
            Array.isArray(section.rootFieldsToRetrieveForUI)
          ) {
            for (const rootFieldToRetrieveForUI of section.rootFieldsToRetrieveForUI) {
              if (
                rootFieldToRetrieveForUI?.name &&
                typeof rootFieldToRetrieveForUI.name === 'string' &&
                rootFieldToRetrieveForUI?.as &&
                typeof rootFieldToRetrieveForUI.as === 'string' &&
                targetUnitForUI[
                rootFieldToRetrieveForUI?.name as keyof TUnitForUI
                ]
              ) {
                const val =
                  targetUnitForUI[
                  rootFieldToRetrieveForUI.name as keyof TUnitForUI
                  ];

                if (!val) {
                  continue;
                }

                section = {
                  ...section,
                  [rootFieldToRetrieveForUI.as as string]: val,
                };
              }
            }


            delete section.rootFieldsToRetrieveForUI;

            return {
              ...sectionsAccum,
              [sectionKey]: section,
            };
          }

          return {
            ...sectionsAccum,
            [sectionKey]: section,
          };
        },
        {} as Record<keyof ISections, any>
      ) as TSectionsForUI;
      sectionsUpdated = {
        ...sectionsUpdated,
        overview: {
          ...sectionsUpdated.overview,
          availLocs,
        },
      };
      const versionsSection = sectionsUpdated.overview?.versions
        ? {
          __component: 'lesson-plan.versions',
          SectionTitle: 'Version notes',
          InitiallyExpanded: true,
          Data: sectionsUpdated.overview?.versions,
        }
        : null;

      if (versionsSection) {
        sectionsUpdated = {
          ...sectionsUpdated,
          versions: versionsSection,
        };
      }

      targetUnitForUI.Sections = sectionsUpdated;
    }

    if (targetUnitForUI) {
      return {
        props: {
          unit: targetUnitForUI
            ? JSON.parse(JSON.stringify(targetUnitForUI))
            : null,
          availLocs: availUnitLocales,
        },
        revalidate: 30,
      };
    }

    console.error('Target unit not found.');

    throw new Error('Target unit not found.');
  } catch (error) {
    console.error('Failed to get unit. Error message: ', error);

    return {
      notFound: true,
      revalidate: 30,
    };
  }
};

export default LessonDetails;
