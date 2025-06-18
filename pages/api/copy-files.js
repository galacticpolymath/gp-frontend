/* eslint-disable quotes */
/* eslint-disable comma-dangle */
/* eslint-disable semi */
/* eslint-disable no-unused-vars */
/* eslint-disable no-empty */
/* eslint-disable no-console */
/* eslint-disable indent */
/* eslint-disable no-multiple-empty-lines */
import { google, drive_v3 } from "googleapis";
import { CustomError } from "../../backend/utils/errors";
import axios from "axios";
import {
    copyFiles,
    FileMetaData,
    generateGoogleAuthJwt,
    getGooglDriveFolders,
    shareFilesWithRetries,
} from "../../backend/services/googleDriveServices";
import { getJwtPayloadPromise } from "../../nondependencyFns";

const getUserDriveFiles = (accessToken, nextPageToken) =>
    axios.get("https://www.googleapis.com/drive/v3/files", {
        params: {
            includeItemsFromAllDrives: true,
            supportsAllDrives: true,
            ...(nextPageToken ? { pageToken: nextPageToken } : {}),
        },
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
    });

/**
 * Get all of the files for the target user.
 * @param{string} accessToken The client side user's access token.
 * @param{drive_v3.Drive} service google drive service object
 * @return{Promise< any[] | null>} An object contain the results and optional message.
 * */
const listAllUserFiles = async (
    accessToken,
    nextPageToken,
    startingFiles = []
) => {
    try {
        const response = await getUserDriveFiles(accessToken, nextPageToken);
        const { status, data } = response;
        let files = data.files;
        files = startingFiles?.length ? [...startingFiles, ...files] : files;

        if (status !== 200) {
            throw new CustomError("Failed to get user google drive files.", status);
        }

        if (data.nextPageToken) {
            files = await listAllUserFiles(accessToken, nextPageToken, files);
        }

        return files;
    } catch (error) {
        console.error(
            "An error has occurred in listing all of the user files: ",
            error
        );

        return null;
    }
};

const createGoogleDriveFolderForUser = async (
    folderName,
    accessToken,
    parentFolderIds = []
) => {
    try {
        const folderMetadata = new FileMetaData(folderName, parentFolderIds);
        const response = await axios.post(
            "https://www.googleapis.com/drive/v3/files?fields=id",
            folderMetadata,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            }
        );

        if (response.status !== 200) {
            throw new CustomError(
                response.data ?? "Failed to create a lesson folder.",
                response.status
            );
        }

        return { wasSuccessful: true, folderId: response.data.id };
    } catch (error) {
        console.error("Error object: ", error.response.data.error);
        const errMsg = `Failed to create folder for the user. Reason: ${error.response.data.error}`;
        console.log("errMsg: ", errMsg);

        return { wasSuccessful: false, errMsg: errMsg };
    }
};

/**
 * @swagger
 * /api/copy-files:
 *   post:
 *     summary: Copy user files to a specified folder.
 *
 *     description: The user must authenticate with their Google account to copy files.
 *
 *     security:
 *       - Bearer: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               unitDriveId:
 *                 type: string
 *                 description: The id of the drive to copy the files to.
 *               unitName:
 *                 type: string
 *                 description: The name of the unit to copy the files to.
 *     responses:
 *       200:
 *         description: The result of the copy operation.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 wasSuccessful:
 *                   type: boolean
 *                   description: Whether the copy operation was successful.
 *                 errMsg:
 *                   type: string
 *                   description: The error message if the copy operation was not successful.
 *     externalDocs:
 *       url: https://accounts.google.com/o/oauth2/auth?client_id=1038023225572-6jo0d0eoq9603be7sj6er6lf8ukpn93a.apps.googleusercontent.com&redirect_uri=${rediret_uri}/&scope=https://www.googleapis.com/auth/drive&response_type=token
 *       redirect_uri: Possible values: http://localhost:3000/google-drive-auth-result, https://teach.galacticpolymath.com/google-drive-auth-result, https://dev.galacticpolymath.com/google-drive-auth-result
 *       description: The google authentication url. CHANGE the `client_id` to the official Galactic Polymath client id.
 */
export default async function handler(request, response) {
    try {
        const gdriveAccessToken = request.headers["gdrive-token"];
        const jwtPayload = await getJwtPayloadPromise(
            request.headers.authorization
        );

        if (!jwtPayload || !jwtPayload?.payload?.email) {
            throw new CustomError("The access token is not valid.", 400);
        }

        if (!gdriveAccessToken) {
            throw new CustomError("The gdrive access token was not provided.", 400);
        }

        const email = jwtPayload.payload.email;

        if (!request.body.unitDriveId) {
            throw new CustomError("The id of the drive was not provided.", 400);
        }

        if (!request.body.unitName) {
            throw new CustomError("The the name of the unit was not provided.", 400);
        }

        response.setHeader("Content-Type", "text/event-stream");
        response.setHeader("Cache-Control", "no-cache");
        response.setHeader("Connection", "kee-alive");

        const data = JSON.stringify({ msg: "Files are being copied" });

        response.write(`data: ${data}\n\n`)

        return response.status(200).json({ wasSuccessful: true });

        const googleAuthJwt = generateGoogleAuthJwt();
        const googleService = google.drive({ version: "v3", auth: googleAuthJwt });
        const rootDriveFolders = await getGooglDriveFolders(
            googleService,
            request.body.unitDriveId
        );

        if (!rootDriveFolders?.length) {
            console.error("The root of the drive folder is empty.");
            return response
                .status(500)
                .json({
                    wasCopySuccessful: false,
                    msg: `Failed to download GP lessons. Either the root drive of the gp folder is empty or the access token is invalid.`,
                });
        }

        /** @type {{ id: string, name: string, pathToFile: string, mimeType: string, parentFolderId?: string, wasCreated?: boolean }[]} */
        // all of the folders for the target unit
        let unitFolders = [
            ...rootDriveFolders.map((folder) => ({
                name: folder.name,
                id: folder.id,
                mimeType: folder.mimeType,
                pathToFile: "",
            })),
        ];

        // get all of the folders of the target unit folder
        for (const unitFolder of unitFolders) {
            const parentFolderAlternativeName = unitFolder.alternativeName;

            if (
                unitFolder.mimeType.includes("folder") &&
                unitFolder.pathToFile &&
                unitFolder.pathToFile !== ""
            ) {
                const folderDataResponse = await googleService.files.list({
                    corpora: "drive",
                    includeItemsFromAllDrives: true,
                    supportsAllDrives: true,
                    driveId: process.env.GOOGLE_DRIVE_ID,
                    q: `'${unitFolder.id}' in parents`,
                });
                const folders = folderDataResponse.data.files.filter((file) =>
                    file.mimeType.includes("folder")
                );
                /** @type {{ [key: string]: any[] } | null} */
                let foldersOccurrenceObj = null;

                if (folders.length) {
                    foldersOccurrenceObj = folders.reduce(
                        (allFoldersObj, folderA, _, self) => {
                            const foldersWithTheSameName = self.filter(
                                (folderB) => folderA.name === folderB.name
                            );
                            allFoldersObj[folderA.name] = foldersWithTheSameName;

                            return allFoldersObj;
                        },
                        {}
                    );

                    // if a folder has duplicate names, give it a alternative name in order to differentiate it from the rest of the folders
                    for (const folderNameAndOccurrences of Object.entries(
                        foldersOccurrenceObj
                    )) {
                        let [folderName, occurrences] = folderNameAndOccurrences;

                        if (occurrences.length === 1) {
                            continue;
                        }

                        foldersOccurrenceObj[folderName] = occurrences.map(
                            (folderOccurrence, index) => ({
                                ...folderOccurrence,
                                alternativeName: `${folderOccurrence.name} ${index + 1}`,
                            })
                        );
                    }
                }

                const childFolderAndFilesOfFolder = folderDataResponse.data.files.map(
                    (file) => {
                        if (
                            !file.mimeType.includes("folder") ||
                            !foldersOccurrenceObj ||
                            !foldersOccurrenceObj?.[file.name] ||
                            foldersOccurrenceObj?.[file.name]?.length === 1
                        ) {
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
                        const targetFolderOccurrences = foldersOccurrenceObj[file.name];
                        const targetFolder = targetFolderOccurrences.find(
                            (folder) => folder.id === file.id
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
                    }
                );

                unitFolders.push(...childFolderAndFilesOfFolder);
                continue;
            }

            if (unitFolder.mimeType.includes("folder")) {
                const folderDataResponse = await googleService.files.list({
                    corpora: "drive",
                    includeItemsFromAllDrives: true,
                    supportsAllDrives: true,
                    driveId: process.env.GOOGLE_DRIVE_ID,
                    q: `'${unitFolder.id}' in parents`,
                });

                const folders = folderDataResponse.data.files.filter((file) =>
                    file.mimeType.includes("folder")
                );
                /** @type {{ [key: string]: any[] } | null} */
                let foldersOccurrenceObj = null;

                if (folders.length) {
                    foldersOccurrenceObj = folders.reduce(
                        (allFoldersObj, folderA, _, self) => {
                            const foldersWithTheSameName = self.filter(
                                (folderB) => folderA.name === folderB.name
                            );
                            allFoldersObj[folderA.name] = foldersWithTheSameName;

                            return allFoldersObj;
                        },
                        {}
                    );

                    // if a folder has duplicate names, give it a alternative name in order to differentiate it from the rest of the folders
                    for (const folderNameAndOccurrences of Object.entries(
                        foldersOccurrenceObj
                    )) {
                        let [folderName, occurrences] = folderNameAndOccurrences;

                        if (occurrences.length === 1) {
                            continue;
                        }

                        foldersOccurrenceObj[folderName] = occurrences.map(
                            (folderOccurrence, index) => ({
                                ...folderOccurrence,
                                alternativeName: `${folderOccurrence.name} ${index + 1}`,
                            })
                        );
                    }
                }

                const folderData = folderDataResponse.data.files.map((file) => {
                    const targetFolderOccurrences = foldersOccurrenceObj?.[file.name];
                    const targetFolder = targetFolderOccurrences
                        ? targetFolderOccurrences.find((folder) => folder.id === file.id)
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
                unitFolders.push(...folderData);
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

                unitFolders.push(file);
            }
        }

        console.log("gdriveAccessToken, sup there: ", gdriveAccessToken)

        // give the user the ability to name the folder where the files will be copied to.
        const { folderId: unitFolderId, errMsg } =
            await createGoogleDriveFolderForUser(
                `${request.body.unitName} COPY`,
                gdriveAccessToken
            );

        if (errMsg) {
            console.error("Failed to create the target folder.");
            throw new CustomError(errMsg, 500);
        }

        console.log("The target folder was created.");

        let foldersFailedToCreate = [];
        /** @type {{ id: string, name: string, pathToFile: string, parentFolderId: string, gpFolderId: string }[]} */
        let createdFolders = [];
        /** @type {{ fileId: string, pathToFile: string, parentFolderId: string, name: string }[]} */
        // get only the chlid folders of the target unit folder
        const folderPaths = unitFolders
            .filter((folder) => folder.mimeType.includes("folder"))
            .map((folder) => {
                return {
                    name: folder.name,
                    mimeType: folder.mimeType,
                    fileId: folder.id,
                    pathToFile: folder.pathToFile,
                    parentFolderId: folder.parentFolderId,
                };
            });

        // create the google sub folders
        for (const folderToCreate of folderPaths) {
            // if the folder is at the root
            if (folderToCreate.pathToFile === "") {
                const { folderId, wasSuccessful } =
                    await createGoogleDriveFolderForUser(
                        folderToCreate.name,
                        gdriveAccessToken,
                        [unitFolderId]
                    );

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

            if (!parentFolderId) {
                foldersFailedToCreate.push(folderToCreate.name);
                continue;
            }

            const { folderId, wasSuccessful } = await createGoogleDriveFolderForUser(
                folderToCreate.name,
                gdriveAccessToken,
                [parentFolderId]
            );

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

        const files = unitFolders.filter(
            (folder) => !folder.mimeType.includes("folder")
        );
        console.log("Will share the target files with the target user.");
        const { wasSuccessful: wasSharesSuccessful } = await shareFilesWithRetries(
            files,
            email,
            googleService
        );

        console.log(
            "Was files share successful, wasSharesSuccessful: ",
            wasSharesSuccessful
        );

        if (!wasSharesSuccessful) {
            console.error("Failed to share at least one file.");
            return response.status(500).json({
                wasCopySuccessful: false,
                msg: "At least one file failed to be shared.",
            });
        }

        console.log("Will copy files...");
        const { wasSuccessful: wasCopiesSuccessful } = await copyFiles(
            files,
            createdFolders,
            gdriveAccessToken
        );
        console.log("Attempted to copy files. Result: ", wasCopiesSuccessful);

        if (!wasCopiesSuccessful) {
            console.error("Failed to copy at least one file.");
            return response.status(500).json({
                wasCopySuccessful: false,
                msg: "At least one file failed to be copied.",
            });
        }

        return response.json({ wasCopySuccessful: true });
    } catch (error) {
        console.error("An error has occurred. Error: ", error);
        return response
            .status(500)
            .json({
                wasCopySuccessful: false,
                msg: `Failed to download GP lessons. Reason: ${error}`,
            });
    }
}
