import Units from '../../models/Unit';
import {
  INewUnitSchema,
  ISections,
  TSectionsForUI,
  TUnitForUI,
} from '../../models/Unit/types/unit';
import {
  IItemForUI,
  INewUnitLesson,
  IResource,
  ISharedGDriveLessonFolder,
} from '../../models/Unit/types/teachingMaterials';
import { getLinkPreviewObj } from '../../../globalFns';
import { getUnitGDriveChildItems } from '../gdriveServices';
import { buildUnitUrl, DEFAULT_LOCALE } from '../../../shared/seo';

const GOOGLE_DRIVE_THUMBNAIL_URL = 'https://drive.google.com/thumbnail?id=';

type TUnitPageDataResult = {
  unit: TUnitForUI;
  availLocs: string[];
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
  return id || null;
};

const buildHeadLinks = (targetUnits: INewUnitSchema[]) => {
  return targetUnits
    .filter(({ locale, numID }) => locale && numID)
    .map(({ locale, numID }) => [
      buildUnitUrl(locale ?? DEFAULT_LOCALE, (numID ?? '').toString()),
      locale ?? DEFAULT_LOCALE,
    ]) as [string, string][];
};

const enrichFeaturedMultimedia = async (unit: TUnitForUI) => {
  if (!unit.FeaturedMultimedia) {
    return;
  }

  unit.FeaturedMultimedia = unit.FeaturedMultimedia.map((multiMedia) => {
    if (multiMedia?.mainLink?.includes('www.youtube.com/shorts')) {
      multiMedia.mainLink = multiMedia.mainLink.replace('shorts', 'embed');
    }
    return multiMedia;
  });

  const hasVideoOrWebApp = unit.FeaturedMultimedia.some(
    (multiMedia) => multiMedia.type === 'web-app' || multiMedia.type === 'video'
  );

  if (!hasVideoOrWebApp) {
    return;
  }

  const withPreviews = await Promise.all(
    unit.FeaturedMultimedia.map(async (multiMediaItem) => {
      if (
        multiMediaItem.type === 'video' &&
        multiMediaItem?.mainLink?.includes('drive.google')
      ) {
        const videoId = multiMediaItem.mainLink.split('/').at(-2);
        return {
          ...multiMediaItem,
          webAppPreviewImg: `https://drive.google.com/thumbnail?id=${videoId}`,
          webAppImgAlt: `'${multiMediaItem.title}' video`,
        };
      }

      if (multiMediaItem.type === 'web-app' && multiMediaItem?.mainLink) {
        const { errMsg, images, title } = (await getLinkPreviewObj(
          multiMediaItem.mainLink
        )) as {
          errMsg: string;
          images: string[];
          title: string;
        };

        if (errMsg && !images?.length) {
          console.error(
            'Failed to get the image preview of web app. Error message: ',
            errMsg
          );
        }

        return {
          ...multiMediaItem,
          webAppPreviewImg: errMsg || !images?.length ? null : images[0],
          webAppImgAlt:
            errMsg || !images?.length ? null : `${title}'s preview image`,
        };
      }

      return multiMediaItem;
    })
  );

  unit.FeaturedMultimedia = withPreviews;
};

const enrichLessonItems = async (lesson: INewUnitLesson<any>) => {
  const itemListWithFilePreviewImgsPromises = lesson.itemList?.map(async (item) => {
    const { links, itemCat } = item;
    const linkObj = links?.[0];
    const url = linkObj?.url?.[0];

    if (!url) {
      return item;
    }

    if (itemCat === 'web resource') {
      const linkPreviewObj = await getLinkPreviewObj(url);
      const filePreviewImg =
        'images' in linkPreviewObj ? linkPreviewObj.images?.[0] : null;

      return {
        ...item,
        filePreviewImg,
      } as IItemForUI;
    }

    const googleDriveFileId = getGoogleDriveFileIdFromUrl(url);

    if (googleDriveFileId) {
      return {
        ...item,
        filePreviewImg: `${GOOGLE_DRIVE_THUMBNAIL_URL}${googleDriveFileId}`,
      } as IItemForUI;
    }

    return item as IItemForUI;
  });

  if (!itemListWithFilePreviewImgsPromises) {
    return lesson as INewUnitLesson<IItemForUI>;
  }

  const itemListWithFilePreviewImgs = await Promise.all(itemListWithFilePreviewImgsPromises);
  return {
    ...lesson,
    itemList: itemListWithFilePreviewImgs,
  } as INewUnitLesson<IItemForUI>;
};

const enrichTeachingMaterials = async (
  targetUnit: INewUnitSchema,
  unit: TUnitForUI,
  unitGDriveChildItemsAll: Awaited<ReturnType<typeof getUnitGDriveChildItems>>
) => {
  const resources = unit.Sections?.teachingMaterials?.classroom?.resources;
  if (!resources?.length) {
    return;
  }
  if (!unit.Sections?.teachingMaterials?.classroom) {
    return;
  }

  const allDriveItems = unitGDriveChildItemsAll ?? [];
  const gpGDriveLessonItems = allDriveItems.filter(
    (item) => item.mimeType !== 'application/vnd.google-apps.folder'
  );
  const unitGDriveChildItems = allDriveItems.filter((item) =>
    item.mimeType?.includes('folder')
  );

  const resourcesForUI = await Promise.all(
    resources.map(async (resource) => {
      if (resource?.lessons?.length) {
        resource.lessons = resource.lessons
          .filter((lesson) => !!lesson.title && lesson?.status?.toLowerCase() !== 'proto')
          .map((lesson) => {
            if (lesson.itemList?.length) {
              lesson.itemList = lesson.itemList.map((item) => {
                const gdriveRoot = 'gdriveRoot' in item ? (item.gdriveRoot as string) : undefined;
                const itemId = gdriveRoot ? gdriveRoot.split('/').at(-1) : undefined;
                const targetItemInGpGDrive = itemId
                  ? gpGDriveLessonItems.find((lessonItem) => lessonItem.id === itemId)
                  : undefined;

                if (targetItemInGpGDrive?.id) {
                  return {
                    ...item,
                    gpGDriveItemId: targetItemInGpGDrive.id,
                  };
                }

                return item;
              });
            }

            return lesson;
          });
      }

      const allUnitLessons: Pick<INewUnitLesson, 'allUnitLessons'>['allUnitLessons'] = [];

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

      let lessonsFolder: Pick<INewUnitLesson, 'lessonsFolder'>['lessonsFolder'] | undefined =
        undefined;

      const lessonsWithFilePreviewImgs = await Promise.all(
        (resource.lessons ?? []).map(async (lesson) => {
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
                lessonName = unitGDriveChildItem.name?.split('_').at(-1)?.toLowerCase();
              }

              if (lessonName && lesson.title && lessonName.toLowerCase() === lessonTitle) {
                const targetUnitGDriveChildItem =
                  unitGDriveChildItems.find((item) => {
                    if (lessonTitle === 'assessments') {
                      return item.name === 'assessments';
                    }
                    return item.id && item.id === unitGDriveChildItem.parentFolderId;
                  }) ?? {};

                const { name, id } = targetUnitGDriveChildItem;
                lessonsFolder = name && id ? { name, sharedGDriveId: id } : undefined;
              }
            }
          }

          const targetGDriveSharedLessonFolders: ISharedGDriveLessonFolder[] | undefined =
            unitGDriveChildItems
              ?.filter((item) => {
                const lessonName = item?.name?.split('_').at(-1);
                return (
                  lessonName &&
                  lesson.title &&
                  lessonName.toLowerCase() === lesson.title.toLowerCase()
                );
              })
              ?.map((itemA) => {
                const parentLessonsFolder = unitGDriveChildItems.find(
                  (itemB) => itemB.id === itemA.parentFolderId
                );

                const parentFolder = parentLessonsFolder
                  ? { id: parentLessonsFolder.id!, name: parentLessonsFolder.name! }
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

          let enrichedLesson: INewUnitLesson<any> = lesson;
          if (targetGDriveSharedLessonFolders?.length) {
            enrichedLesson = {
              ...enrichedLesson,
              sharedGDriveLessonFolders: targetGDriveSharedLessonFolders,
              allUnitLessons,
              lessonsFolder,
            };
          }

          if (!enrichedLesson.tile && enrichedLesson.status === 'Upcoming') {
            enrichedLesson = {
              ...enrichedLesson,
              tile: 'https://storage.googleapis.com/gp-cloud/icons/coming-soon_tile.png',
            };
          }

          enrichedLesson = {
            ...enrichedLesson,
            status: enrichedLesson.status ?? 'Proto',
          };

          return enrichLessonItems(enrichedLesson);
        })
      );

      return {
        ...resource,
        lessons: lessonsWithFilePreviewImgs,
      } as IResource<INewUnitLesson<IItemForUI>>;
    })
  );

  unit.Sections.teachingMaterials.classroom.resources = resourcesForUI;
};

const normalizeSectionsForUI = (
  unit: TUnitForUI,
  availLocs: string[]
): TSectionsForUI => {
  const sectionsEntries = Object.entries(unit.Sections ?? {}) as [keyof ISections, any][];

  let sectionsUpdated = sectionsEntries.reduce(
    (sectionsAccum, [sectionKey, section]) => {
      if (
        !section ||
        (typeof section === 'object' &&
          section &&
          (('Content' in section && !section.Content) || ('Data' in section && !section.Data))) ||
        (sectionKey === 'preview' && !unit?.FeaturedMultimedia)
      ) {
        return sectionsAccum;
      }

      if (
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
            unit[rootFieldToRetrieveForUI?.name as keyof TUnitForUI]
          ) {
            const val = unit[rootFieldToRetrieveForUI.name as keyof TUnitForUI];
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

  return sectionsUpdated;
};

export const getUnitPageData = async (
  id: string,
  loc: string
): Promise<TUnitPageDataResult | null> => {
  const parsedId = Number.parseInt(id, 10);
  const targetUnits = (await Units.find<INewUnitSchema>(
    { numID: parsedId },
    { __v: 0 }
  ).lean()) as INewUnitSchema[];

  if (!targetUnits?.length) {
    return null;
  }

  const availLocs = targetUnits
    .map(({ locale }) => locale)
    .filter(Boolean) as string[];

  const targetUnit = targetUnits.find(
    ({ numID, locale }) => numID === parsedId && locale === loc
  );

  if (!targetUnit) {
    return null;
  }

  const unitGDriveChildItemsAll = targetUnit.GdrivePublicID
    ? await getUnitGDriveChildItems(targetUnit.GdrivePublicID)
    : [];

  let unitForUI: TUnitForUI = {
    ...(targetUnit as TUnitForUI),
    headLinks: buildHeadLinks(targetUnits),
  };

  await enrichFeaturedMultimedia(unitForUI);
  await enrichTeachingMaterials(targetUnit, unitForUI, unitGDriveChildItemsAll);

  unitForUI = {
    ...unitForUI,
    Sections: normalizeSectionsForUI(unitForUI, availLocs),
  };

  return {
    unit: unitForUI,
    availLocs,
  };
};
