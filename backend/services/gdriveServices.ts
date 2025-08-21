import { drive_v3, google } from "googleapis";
import { createGoogleDriveFolderForUser } from "../../pages/api/gp-plus/copy-unit";
import { GoogleServiceAccountAuthCreds } from "./googleDriveServices";
import { OAuth2Client } from "google-auth-library";

type TUnitFolder = Partial<{
  name: string | null;
  id: string | null;
  mimeType: string | null;
  pathToFile?: string;
  parentFolderId?: string;
}>;

export const createDrive = async () => {
  const drive = google.drive("v3");
  const creds = new GoogleServiceAccountAuthCreds();
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: creds.client_email,
      client_id: creds.client_id,
      private_key: creds?.private_key?.replace(/\\n/g, "\n").replace(/"/g, ""),
    },
    scopes: ["https://www.googleapis.com/auth/drive"],
  });
  const authClient = (await auth.getClient()) as OAuth2Client;

  google.options({ auth: authClient });

  return drive;
};

export const getFolderChildItems = async (
  rootDriveFolders: drive_v3.Schema$File[]
) => {
  const drive = await createDrive();
  let unitFolders: TUnitFolder[] = rootDriveFolders.map((folder) => ({
    name: folder.name,
    id: folder.id,
    mimeType: folder.mimeType,
    pathToFile: "",
  }));

  // get all of the folders of the target unit folder
  for (const unitFolder of unitFolders) {
    const parentFolderAlternativeName =
      "alternativeName" in unitFolder ? unitFolder.alternativeName : "";

    if (
      unitFolder?.mimeType?.includes("folder") &&
      unitFolder.pathToFile &&
      unitFolder.pathToFile !== ""
    ) {
      const { data } = await drive.files.list({
        corpora: "drive",
        includeItemsFromAllDrives: true,
        supportsAllDrives: true,
        driveId: process.env.GOOGLE_DRIVE_ID,
        q: `'${unitFolder.id}' in parents`,
      });

      if (!data.files) {
        continue;
      }

      const folders = data?.files.filter((file) =>
        file?.mimeType?.includes("folder")
      );
      let foldersOccurrenceObj:
        | (drive_v3.Schema$File & { [key: string]: any })
        | null = null;

      if (folders.length) {
        foldersOccurrenceObj = folders.reduce(
          (allFoldersObj, folderA, _, self) => {
            const foldersWithTheSameName = self.filter(
              (folderB) => folderA.name === folderB.name
            );

            if (!folderA.name) {
              return allFoldersObj;
            }

            const _allFoldersObj = {
              ...allFoldersObj,
              [folderA.name]: foldersWithTheSameName,
            };

            return _allFoldersObj;
          },
          {} as drive_v3.Schema$File & { [key: string]: string }
        );
      }

      const childFolderAndFilesOfFolder = data.files.map((file) => {
        if (
          !file?.mimeType?.includes("folder") ||
          !foldersOccurrenceObj ||
          (file.name &&
            (!foldersOccurrenceObj?.[file.name] ||
              foldersOccurrenceObj?.[file.name]?.length === 1))
        ) {
          console.log("The file retrieved from the server: ", file);

          return {
            ...file,
            name: file.name,
            id: file.id,
            // get the id of the folder in order to copy the file or folder into the specific folder of the user's drive
            mimeType: file.mimeType,
            parentFolderId: unitFolder.id,
            pathToFile: `${unitFolder.pathToFile}/${unitFolder.name}`,
            parentFolderAlternativeName,
          };
        }

        if (!file.name) {
          return null;
        }

        const targetFolderOccurrences = foldersOccurrenceObj[file.name];
        const targetFolder = targetFolderOccurrences.find(
          (folder: { id: string }) => folder.id === file.id
        );

        return {
          ...file,
          name: file.name,
          id: file.id,
          mimeType: file.mimeType,
          folderAlternativeName: targetFolder.alternativeName,
          parentFolderId: unitFolder.id,
          pathToFile: `${unitFolder.pathToFile}/${unitFolder.name}`,
          parentFolderAlternativeName,
        };
      });

      const _childFolderAndFilesOfFolder = childFolderAndFilesOfFolder.filter(
        Boolean
      ) as typeof unitFolders;

      unitFolders.push(..._childFolderAndFilesOfFolder);
      continue;
    }

    if (unitFolder?.mimeType?.includes("folder")) {
      const folderDataResponse = await drive.files.list({
        corpora: "drive",
        includeItemsFromAllDrives: true,
        supportsAllDrives: true,
        driveId: process.env.GOOGLE_DRIVE_ID,
        q: `'${unitFolder.id}' in parents`,
      });

      if (!folderDataResponse || !folderDataResponse?.data?.files) {
        continue;
      }

      const folders = folderDataResponse?.data?.files.filter((file) =>
        file?.mimeType?.includes("folder")
      );
      /** @type {{ [key: string]: any[] } | null} */
      let foldersOccurrenceObj = null;

      if (folders.length) {
        foldersOccurrenceObj = folders.reduce(
          (allFoldersObj, folderA, _, self) => {
            const foldersWithTheSameName = self.filter(
              (folderB) => folderA.name === folderB.name
            );

            if (!folderA.name) {
              return allFoldersObj;
            }

            return {
              ...allFoldersObj,
              [folderA.name]: foldersWithTheSameName,
            };
          },
          {}
        );

        // if a folder has duplicate names, give it a alternative name in order to differentiate it from the rest of the folders
        for (const folderNameAndOccurrences of Object.entries(
          foldersOccurrenceObj
        )) {
          let [folderName, occurrences] = folderNameAndOccurrences;

          if (
            occurrences.length === 1 ||
            !foldersOccurrenceObj ||
            (foldersOccurrenceObj as any)[folderName]
          ) {
            continue;
          }

          (foldersOccurrenceObj as any)[folderName] = occurrences.map(
            (folderOccurrence: any, index: number) => ({
              ...folderOccurrence,
              alternativeName: `${folderOccurrence.name} ${index + 1}`,
            })
          );
        }
      }

      const folderData = folderDataResponse.data.files.map((file) => {
        const targetFolderOccurrences = (foldersOccurrenceObj as any)[
          file.name as string
        ];
        const targetFolder = targetFolderOccurrences
          ? targetFolderOccurrences.find((folder: any) => folder.id === file.id)
          : null;

        if (targetFolder) {
          return {
            ...file,
            name: file.name,
            id: file.id,
            folderAlternativeName: targetFolder.name,
            mimeType: file.mimeType,
            pathToFile: unitFolder.name,
            parentFolderId: unitFolder.id,
            parentFolderAlternativeName,
          };
        }

        return {
          ...file,
          name: file.name,
          id: file.id,
          mimeType: file.mimeType,
          parentFolderId: unitFolder.id,
          pathToFile: unitFolder.name,
          parentFolderAlternativeName,
        };
      });

      unitFolders.push(...(folderData as unknown as TUnitFolder[]));
      continue;
    }

    const isFilePresent = unitFolders.some(
      (folder) => folder.name === unitFolder.name
    );

    if (!isFilePresent) {
      const file = {
        ...unitFolder,
        name: unitFolder.name,
        id: unitFolder.id,
        // get the id of the folder in order to copy the file or folder into the specific folder of the user's drive
        mimeType: unitFolder.mimeType,
        parentFolderId: unitFolder.id,
        pathToFile: unitFolder.pathToFile
          ? `${unitFolder.pathToFile}/${unitFolder.name}`
          : unitFolder.name,
        parentFolderAlternativeName,
      };

      unitFolders.push(...(file as unknown as TUnitFolder[]));
    }
  }

  return unitFolders;
};

export const createFolderStructure = async (
  unitFolders: TUnitFolder[],
  gdriveAccessToken: string,
  unitFolderId: string,
  gdriveRefreshToken: string,
  clientOrigin: string
) => {
  const folderPaths = unitFolders
    .filter((folder) => folder?.mimeType?.includes("folder"))
    .map((folder) => {
      return {
        name: folder.name,
        mimeType: folder.mimeType,
        fileId: folder.id,
        pathToFile: folder.pathToFile,
        parentFolderId: folder.parentFolderId,
      };
    });
  const foldersFailedToCreate = [];
  const createdFolders = [];

  // create the google sub folders
  for (const folderToCreate of folderPaths) {
    console.log("folderToCreate: ", folderToCreate);
    
    // if the folder is at the root of the parent folder
    if (folderToCreate.pathToFile === "") {
      const folderCreationResult = await createGoogleDriveFolderForUser(
        folderToCreate.name as string,
        gdriveAccessToken,
        [unitFolderId],
        3,
        gdriveRefreshToken,
        clientOrigin
      );

      console.log("folderCreationResult: ", folderCreationResult);      

      const { folderId, wasSuccessful } = folderCreationResult;

      if (!wasSuccessful) {
        foldersFailedToCreate.push(folderToCreate.name);
      } else {
        createdFolders.push({
          id: folderId,
          gpFolderId: folderToCreate.fileId,
          name: folderToCreate.name,
          pathToFile: "",
          parentFolderId: folderToCreate.parentFolderId,
        });
      }

      continue;
    }

    // the id of the parent folder that was just created in the previous iteration
    const parentFolderId = createdFolders.find(
      (folder) => folder.gpFolderId === folderToCreate.parentFolderId
    )?.id;

    console.log("parentFolderId: ", parentFolderId);
    

    if (!parentFolderId) {
      foldersFailedToCreate.push(folderToCreate.name);
      continue;
    }

    const nestedFolderCreationResult = await createGoogleDriveFolderForUser(
      folderToCreate.name as string,
      gdriveAccessToken,
      [parentFolderId],
      3,
      gdriveRefreshToken as string,
      clientOrigin
    );
    console.log("nestedFolderCreationResult: ", nestedFolderCreationResult);
    const { folderId, wasSuccessful } = nestedFolderCreationResult;

    if (!wasSuccessful) {
      foldersFailedToCreate.push(folderToCreate.name);
      continue;
    }

    createdFolders.push({
      id: folderId,
      gpFolderId: folderToCreate.fileId,
      name: folderToCreate.name,
      pathToFile: folderToCreate.pathToFile,
      parentFolderId: folderToCreate.parentFolderId,
    });
  }

  return createdFolders;
};

export const getTargetUserPermission = async (
  fileId: string,
  email: string,
  drive?: drive_v3.Drive,
) => {
  let _drive = drive;

  if(!drive){
    _drive = await createDrive();
  }

  const filePermissions = await (_drive as drive_v3.Drive).permissions.list({
    fileId,
    supportsAllDrives: true,
    fields: "*",
  });

  return filePermissions.data.permissions?.find(
    (permission) => {
      return permission.emailAddress === email;
    }
  );
};
