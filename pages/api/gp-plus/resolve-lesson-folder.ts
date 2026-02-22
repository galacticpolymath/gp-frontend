import { NextApiRequest, NextApiResponse } from 'next';
import { createDrive } from '../../../backend/services/gdriveServices/index';

const FOLDER_MIME = 'application/vnd.google-apps.folder';

type TQuery = {
  unitRootFolderId?: string;
  gradeBandFolderId?: string;
  lessonId?: string;
};

type TGDriveFolder = { id: string; name: string; parents?: string[] };

const listFoldersByParent = async (parentId: string): Promise<TGDriveFolder[]> => {
  const drive = await createDrive();
  const files: TGDriveFolder[] = [];
  let pageToken: string | undefined;

  do {
    const { data } = await drive.files.list({
      q: `'${parentId}' in parents and trashed=false and mimeType='${FOLDER_MIME}'`,
      fields: 'nextPageToken, files(id,name,parents)',
      includeItemsFromAllDrives: true,
      supportsAllDrives: true,
      pageToken,
      pageSize: 1000,
      corpora: 'allDrives',
    });

    const pageFiles = (data.files ?? []).filter(
      (f): f is TGDriveFolder => typeof f.id === 'string' && typeof f.name === 'string'
    );
    files.push(...pageFiles);
    pageToken = data.nextPageToken ?? undefined;
  } while (pageToken);

  return files;
};

const findLessonFolderUnderParent = (
  folders: TGDriveFolder[],
  lessonId: string
): TGDriveFolder | null => {
  const lessonNum = lessonId.trim();
  const directRegex = new RegExp(`^L\\s*${lessonNum}_`, 'i');
  const altRegex = new RegExp(`^Lesson\\s*${lessonNum}\\b`, 'i');
  return (
    folders.find((folder) => directRegex.test(folder.name)) ??
    folders.find((folder) => altRegex.test(folder.name)) ??
    null
  );
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ err: 'Method not allowed' });
  }

  try {
    const { unitRootFolderId, gradeBandFolderId, lessonId } = req.query as TQuery;

    if (!unitRootFolderId || !lessonId) {
      return res.status(400).json({ err: 'unitRootFolderId and lessonId are required' });
    }

    if (lessonId === '100') {
      const unitRootChildren = await listFoldersByParent(unitRootFolderId);
      const assessmentsFolder =
        unitRootChildren.find((f) => f.name.trim().toLowerCase() === 'assessments') ?? null;

      if (!assessmentsFolder) {
        return res.status(404).json({ err: 'Assessments folder not found under unit root' });
      }

      return res.status(200).json({
        lessonFolder: {
          id: assessmentsFolder.id,
          name: assessmentsFolder.name,
          parentFolder: { id: unitRootFolderId, name: 'Unit Root' },
        },
        lessonsFolder: { sharedGDriveId: unitRootFolderId, name: 'Unit Root' },
      });
    }

    let candidateGradeFolders: TGDriveFolder[] = [];

    if (gradeBandFolderId) {
      const drive = await createDrive();
      const { data } = await drive.files.get({
        fileId: gradeBandFolderId,
        fields: 'id,name,parents',
        supportsAllDrives: true,
      });
      if (data.id && data.name) {
        candidateGradeFolders = [{
          id: data.id,
          name: data.name,
          parents: (data.parents ?? []) as string[],
        }];
      }
    }

    if (!candidateGradeFolders.length) {
      const unitRootChildren = await listFoldersByParent(unitRootFolderId);
      candidateGradeFolders = unitRootChildren.filter(
        (folder) => folder.name.trim().toLowerCase() !== 'assessments'
      );
    }

    for (const gradeFolder of candidateGradeFolders) {
      const gradeChildren = await listFoldersByParent(gradeFolder.id);
      const lessonFolder = findLessonFolderUnderParent(gradeChildren, lessonId);
      if (lessonFolder) {
        return res.status(200).json({
          lessonFolder: {
            id: lessonFolder.id,
            name: lessonFolder.name,
            parentFolder: { id: gradeFolder.id, name: gradeFolder.name },
          },
          lessonsFolder: {
            sharedGDriveId: gradeFolder.id,
            name: gradeFolder.name,
          },
        });
      }
    }

    return res.status(404).json({ err: `Lesson folder for lesson ${lessonId} not found` });
  } catch (error: any) {
    console.error('resolve-lesson-folder error:', error?.response?.data || error);
    return res.status(500).json({ err: 'Failed to resolve lesson folder' });
  }
}
