import { useEffect, useRef, useState } from "react";
import { Button, Spinner } from "react-bootstrap";
import { useUserContext } from "../../../providers/UserProvider";
import useDrivePicker from "react-google-drive-picker";
import useSiteSession from "../../../customHooks/useSiteSession";
import {
  createGDriveAuthUrl,
  getLocalStorageItem,
  setLocalStorageItem,
} from "../../../shared/fns";
import { GOOGLE_DRIVE_PROJECT_CLIENT_ID } from "../../../globalVars";
import { useModalContext } from "../../../providers/ModalProvider";
import { useRouter } from "next/router";
import Image from "next/image";
import { refreshGDriveToken } from "../../../apiServices/user/crudFns";
import { useCustomCookies } from "../../../customHooks/useCustomCookies";
import Link from "next/link";
import CopyingUnitToast, {
  GDRIVE_FOLDER_ORIGIN_AND_PATH,
} from "../../CopyingUnitToast";
import { EXPIRATION_DATE_TIME } from "../../../pages/google-drive-auth-result";
import {
  IItemV2,
  INewUnitLesson,
  IResource,
} from "../../../backend/models/Unit/types/teachingMaterials";
import { useLessonContext } from "../../../providers/LessonProvider";
import Cookies from "js-cookie";
import {
  TCopyFilesMsg,
  TCopyLessonReqQueryParams,
} from "../../../pages/api/gp-plus/copy-lesson";
import { ILessonForUI, TSetter } from "../../../types/global";
import { INewUnitSchema } from "../../../backend/models/Unit/types/unit";
import { EventSourcePolyfill } from "event-source-polyfill";
import { toast } from "react-toastify";
import { nanoid } from "nanoid";
import { TFileToCopy } from "../../../backend/services/gdriveServices/types";
import { ILessonPartProps } from "./LessonPart";

export interface ICopyLessonBtnProps
  extends Pick<INewUnitLesson, "allUnitLessons" | "lessonsFolder">,
    Pick<INewUnitSchema, "GdrivePublicID"> {
  userGDriveLessonFolderId?: Pick<
    INewUnitLesson,
    "userGDriveLessonFolderId"
  >["userGDriveLessonFolderId"];
  unitId: string;
  unitTitle?: string | null;
  MediumTitle: string;
  lessonName: string;
  lessonsGrades?: IResource<ILessonForUI>["grades"];
  lessonId: string | number;
  sharedDriveLessonFolderId?: string;
  lessonSharedDriveFolderName?: string;
  isRetrievingLessonFolderIds: boolean;
  sharedGDriveLessonFolderId?: string;
  setParts: TSetter<(INewUnitLesson<IItemV2> | ILessonForUI)[]>;
}

export const ensureValidToken = async (
  gdriveAccessTokenExp: string | number,
  setAppCookie: ReturnType<typeof useCustomCookies>["setAppCookie"]
) => {
  const gdriveRefreshToken = Cookies.get("gdriveRefreshToken");
  const gdriveAccessToken = Cookies.get("gdriveAccessToken");

  console.log("gdriveRefreshToken: ", gdriveRefreshToken);

  console.log("gdriveAccessToken: ", gdriveAccessToken);

  if (!gdriveAccessToken || !gdriveRefreshToken) {
    return null;
  }

  const currentTime = Date.now();
  const tokenExpTime = gdriveAccessTokenExp
    ? parseInt(gdriveAccessTokenExp.toString())
    : 0;
  const bufferTime = 5 * 60 * 1000; // 5 minutes

  if (currentTime >= tokenExpTime - bufferTime) {
    console.log("Token is expired or will expire soon, refreshing...");

    try {
      const refreshResult = await refreshGDriveToken(gdriveRefreshToken);

      if (refreshResult && refreshResult.access_token) {
        // Update cookies with new token
        setAppCookie("gdriveAccessToken", refreshResult.access_token, {
          expires: EXPIRATION_DATE_TIME,
          secure: true,
          path: "/",
        });

        setAppCookie(
          "gdriveAccessTokenExp",
          refreshResult.expires_at.toString(),
          {
            expires: EXPIRATION_DATE_TIME,
            secure: true,
            path: "/",
          }
        );

        console.log("Token refreshed successfully");
        return refreshResult.access_token as string;
      }

      console.error("Failed to refresh token");

      return null;
    } catch (error) {
      console.error("Error refreshing token:", error);
      return null;
    }
  }

  return gdriveAccessToken;
};

const CopyLessonBtn: React.FC<ICopyLessonBtnProps> = ({
  sharedGDriveLessonFolderId,
  MediumTitle,
  unitId,
  unitTitle,
  lessonId,
  lessonName,
  lessonsGrades,
  lessonSharedDriveFolderName,
  userGDriveLessonFolderId,
  allUnitLessons,
  GdrivePublicID,
  lessonsFolder,
  isRetrievingLessonFolderIds,
  setParts,
}) => {
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const {
    _isGpPlusMember,
    _isCopyUnitBtnDisabled,
    _willShowGpPlusCopyLessonHelperModal,
  } = useUserContext();
  const { _lessonsCopyJobs, _lessonToCopy, _failedCopiedLessonFiles } =
    useLessonContext();
  const router = useRouter();
  const {
    _isGpPlusModalDisplayed,
    _isCopyLessonHelperModalDisplayed,
    _isFailedCopiedFilesReportModalOn,
  } = useModalContext();
  const [lessonToCopy, setLessonToCopy] = _lessonToCopy;
  const [, setIsFailedCopiedFilesReportModalOn] =
    _isFailedCopiedFilesReportModalOn;
  const [, setLessonsCopyJobs] = _lessonsCopyJobs;
  const [, setFailedCopiedLessonFiles] = _failedCopiedLessonFiles;
  const [isGpPlusMember] = _isGpPlusMember;
  const {
    gdriveAccessToken,
    token,
    gdriveRefreshToken,
    status,
    gdriveAccessTokenExp,
    gdriveEmail,
  } = useSiteSession();
  const { setAppCookie } = useCustomCookies();
  const [openPicker] = useDrivePicker();
  const [isCopyLessonBtnDisabled] = _isCopyUnitBtnDisabled;
  const [isCopyingLesson, setIsCopyingLesson] = useState(false);
  const [, setIsCopyLessonHelperModalDisplayed] =
    _isCopyLessonHelperModalDisplayed;
  const [willShowGpPlusCopyLessonHelperModal] =
    _willShowGpPlusCopyLessonHelperModal;
  const [, setIsGpPlusModalDisplayed] = _isGpPlusModalDisplayed;
  const didInitialRenderOccur = useRef(false);
  const [copyLessonJobLatestMsg, setCopyLessonJobLatestMsg] = useState<Partial<
    TCopyFilesMsg & { toastId: string }
  > | null>(null);
  const copyingLessonNameTxt =
    lessonId == 100 ? "assessments" : `L${lessonId}: ${lessonName}`;

  const copyingLessonStartingTxt = `Copying ${unitTitle} ${copyingLessonNameTxt}'`;

  useEffect(() => {
    console.log("userGDriveLessonFolderId: ", userGDriveLessonFolderId);
    console.log(
      "sharedGDriveLessonFolderId, sup there: ",
      sharedGDriveLessonFolderId
    );
  });

  const handleFileReportTxtClick = (failedCopiedFiles: TFileToCopy[]) => {
    setFailedCopiedLessonFiles(failedCopiedFiles);
    setIsFailedCopiedFilesReportModalOn(true);
  };

  const copyLesson = async () => {
    console.log("Copy unit function called");

    setIsCopyingLesson(true);

    const validToken = await ensureValidToken(
      gdriveAccessTokenExp!,
      setAppCookie
    );

    console.log("validToken: ", validToken);

    if (!validToken) {
      setLocalStorageItem(
        "gpPlusFeatureLocation",
        `${window.location.protocol}//${window.location.host}${window.location.pathname}#teaching-materials`
      );
      window.location.href = createGDriveAuthUrl();
      return;
    }

    console.log(
      "sharedGDriveLessonFolderId: ",
      sharedGDriveLessonFolderId,
      " lessonSharedDriveFolderName: ",
      lessonSharedDriveFolderName,
      " lessonsGrades: ",
      lessonsGrades
    );

    console.log("lessonsFolder, hey there: ", lessonsFolder);

    if (
      !sharedGDriveLessonFolderId ||
      !lessonSharedDriveFolderName ||
      !lessonsGrades ||
      !lessonsFolder?.name ||
      !lessonsFolder.sharedGDriveId
    ) {
      alert(
        "ERROR! Can't open the target lesson folder. Please refresh the page or contact support if the issue persists."
      );
      setIsCopyingLesson(false);
      return;
    }

    console.log(
      "Copying existing lesson google drive id: ",
      sharedGDriveLessonFolderId
    );

    const willShowGpPlusCopyLessonHelperModal = getLocalStorageItem(
      "willShowGpPlusCopyLessonHelperModal"
    );

    if (willShowGpPlusCopyLessonHelperModal) {
      setLessonToCopy({
        id: typeof lessonId === "number" ? lessonId.toString() : lessonId,
        willOpenGDrivePicker: false,
      });
      setIsCopyLessonHelperModalDisplayed(true);
      setIsCopyingLesson(false);
      return;
    }

    openPicker({
      appId: "1095510414161",
      clientId: GOOGLE_DRIVE_PROJECT_CLIENT_ID,
      developerKey: process.env.NEXT_PUBLIC_GOOGLE_DRIVE_AUTH_API_KEY as string,
      viewId: "DOCS",
      token: validToken,
      showUploadView: true,
      setParentFolder: sharedGDriveLessonFolderId,
      showUploadFolders: true,
      customScopes: [
        "https://www.googleapis.com/auth/drive.file",
        "https://www.googleapis.com/auth/userinfo.email",
      ],
      setSelectFolderEnabled: true,
      supportDrives: true,
      multiselect: true,
      callbackFunction: async (data) => {
        if (data?.docs?.length) {
          setIsCopyingLesson(true);

          const validToken = await ensureValidToken(
            gdriveAccessTokenExp!,
            setAppCookie
          );

          console.log("validToken: ", validToken);

          if (!validToken || !gdriveEmail) {
            setLocalStorageItem(
              "gpPlusFeatureLocation",
              `${window.location.protocol}//${window.location.host}${window.location.pathname}#teaching-materials`
            );
            window.location.href = createGDriveAuthUrl();
            return;
          }

          const toastId = nanoid();

          setLessonsCopyJobs((state) => {
            const stateClone = structuredClone(state);

            if (stateClone.length === 2) {
              stateClone.pop();
            }

            stateClone.push(toastId);

            return stateClone;
          });

          toast(
            <CopyingUnitToast
              title={copyingLessonStartingTxt}
              toastId={toastId}
              subtitle="In progress..."
              onCancel={() => {
                toast.update(toastId, {
                  render: (
                    <CopyingUnitToast
                      toastId={toastId}
                      title={"Job has been canceled."}
                      subtitle={`You have stopped copying lesson '${lessonName}.'`}
                      jobStatus="canceled"
                      onCancel={() => {}}
                      isCancelBtnDisabled
                    />
                  ),
                  style: {
                    width: "60vw",
                    background: "none",
                  },
                  className: "p-0",
                  closeButton: false,
                  toastId,
                  autoClose: 3000,
                });
                setIsCopyingLesson(false);
              }}
              jobStatus="ongoing"
            />,
            {
              style: {
                width: "60vw",
                background: "none",
              },
              className: "p-0",
              closeButton: false,
              toastId,
              autoClose: false,
            }
          );

          console.log("toastId: ", toastId);

          const currentValidToken = await ensureValidToken(
            gdriveAccessTokenExp!,
            setAppCookie
          );

          if (!currentValidToken) {
            toast.dismiss(toastId);
            alert(
              "Your google drive session has expired. Please log in again."
            );
            setIsCopyingLesson(false);
            setLocalStorageItem(
              "gpPlusFeatureLocation",
              `${window.location.protocol}//${window.location.host}${window.location.pathname}#teaching-materials`
            );
            window.location.href = createGDriveAuthUrl();
            return;
          }

          // TODO: get all of the file ids to copy the lesson again if the user clicks on the retry button

          console.log("data, yo there: ", data);
          console.log("First document ID, data?.docs: ", data?.docs);
          const fileIds = data.docs.map((file) => file.id);
          const fileNames = data.docs.map((file) => file.name);
          const reqQueryParams: Partial<TCopyLessonReqQueryParams> = {
            unitId: unitId,
            unitName: MediumTitle,
            unitSharedGDriveId: GdrivePublicID!,
            lessonId:
              typeof lessonId === "number" ? lessonId.toString() : lessonId,
            lessonName: lessonName,
            lessonSharedGDriveFolderId: sharedGDriveLessonFolderId,
            lessonSharedDriveFolderName,
            lessonsFolderGradesRange: lessonsGrades,
          };

          console.log("reqQueryParams: ", reqQueryParams);

          const headers = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "gdrive-token": validToken,
            "gdrive-token-refresh": gdriveRefreshToken!,
            "user-gmail": gdriveEmail,
          };
          const url = new URL(
            `${window.location.origin}/api/gp-plus/copy-lesson`
          );

          Object.entries<unknown>(reqQueryParams).forEach(([key, val]) => {
            url.searchParams.append(key, val as string);
          });

          if (fileIds.length) {
            fileIds.forEach((fileId) => {
              url.searchParams.append("fileIds", fileId);
            });
          }

          if (fileNames.length) {
            fileNames.forEach((fileName) => {
              url.searchParams.append("fileNames", fileName);
            });
          }

          if (allUnitLessons?.length) {
            url.searchParams.append(
              "allUnitLessons",
              encodeURI(JSON.stringify(allUnitLessons))
            );
          }

          if (lessonsFolder) {
            url.searchParams.append(
              "lessonsFolder",
              encodeURI(JSON.stringify(lessonsFolder))
            );
          }

          console.log("lessonsFolder: ", lessonsFolder);

          const eventSource = new EventSourcePolyfill(url.href, {
            headers,
            withCredentials: true,
          });

          const cancelJob = () => {
            eventSource.close();
            setIsCopyingLesson(false);
            toast.update(toastId, {
              render: (
                <CopyingUnitToast
                  subtitle={"Job has been canceled."}
                  title={`Copying lesson '${lessonName}' has been stopped.`}
                  jobStatus="canceled"
                  onCancel={() => {}}
                  isCancelBtnDisabled
                  toastId={toastId}
                />
              ),
              style: {
                width: "60vw",
                background: "none",
              },
              className: "p-0",
              closeButton: false,
              toastId,
              autoClose: 3000,
            });
          };

          let totalFilesToCopy = 0;
          let filesCopied = 0;
          let showProgressBar = false;
          let targetFolderId: string | undefined = undefined;
          let failedCopiedFiles: TFileToCopy[] = [];

          eventSource.onmessage = (event) => {
            try {
              const dataParsable = event.data as string;
              const parsedData =
                (JSON.parse(dataParsable) as TCopyFilesMsg | undefined) ?? {};
              const {
                msg,
                filesToCopy,
                fileCopied,
                didRetrieveAllItems,
                isJobDone,
                wasSuccessful,
                targetFolderId: _targetFolderId,
                failedCopiedFile,
                fileId,
              } = parsedData;
              targetFolderId = _targetFolderId;
              let canDisplayToast = true;

              setCopyLessonJobLatestMsg((state) => {
                if (!state) {
                  return {
                    toastId,
                    ...parsedData,
                  };
                }

                return {
                  ...parsedData,
                };
              });

              setLessonsCopyJobs((state) => {
                canDisplayToast = state.includes(toastId);

                return state;
              });

              if (!canDisplayToast) {
                console.log(
                  "Cannot display toast - toastId not found in lessonsCopyJobs"
                );
                return;
              }

              console.log("data, python: ", parsedData);

              if (failedCopiedFile) {
                toast.update(toastId, {
                  render: (
                    <CopyingUnitToast
                      targetFolderId={targetFolderId}
                      title={copyingLessonStartingTxt}
                      toastId={toastId}
                      subtitle={`❌ '${failedCopiedFile}' failed to be copied.`}
                      jobStatus="ongoing"
                      onCancel={cancelJob}
                      showProgressBar
                      progress={filesCopied}
                      total={totalFilesToCopy}
                    />
                  ),
                  style: {
                    width: "60vw",
                    background: "none",
                  },
                  className: "p-0",
                  closeButton: false,
                  toastId,
                });
                failedCopiedFiles.push({
                  id: fileId ?? "Unknown",
                  name: failedCopiedFile,
                });
                return;
              }

              if (isJobDone) {
                setParts((parts) => {
                  console.log("lessonId: ", lessonId);

                  const targetPartIndex = parts.findIndex((part) => {
                    return part.lsn && lessonId && part.lsn == lessonId;
                  });
                  const targetPart = parts[targetPartIndex];

                  console.log("targetPart: ", targetPart);

                  if (!targetPart) {
                    return parts;
                  }

                  parts[targetPartIndex] = {
                    ...targetPart,
                    userGDriveLessonFolderId: targetFolderId,
                  };

                  return parts;
                });

                const title = wasSuccessful
                  ? `Successfully copied ${unitTitle} ${copyingLessonNameTxt}`
                  : `Failed to copy '${lessonName}'`;
                toast.update(toastId, {
                  render: (
                    <CopyingUnitToast
                      title={title}
                      toastId={toastId}
                      subtitle={
                        wasSuccessful ? (
                          "These files are yours to remix and share with attribution! Never sell or upload to a marketplace."
                        ) : (
                          <span>
                            Copy operation failed. Click{" "}
                            <span
                              onClick={() => {
                                handleFileReportTxtClick(failedCopiedFiles);
                              }}
                              className="text-primary underline-on-hover pointer"
                            >
                              here
                            </span>{" "}
                            to file a report.
                          </span>
                        )
                      }
                      jobStatus={wasSuccessful ? "success" : "failure"}
                      onCancel={() => {
                        console.log("Toast dismissed after job completion");
                        if (!wasSuccessful) {
                          toast.dismiss(toastId);
                          btnRef.current?.click();
                          return;
                        }

                        toast.dismiss(toastId);
                      }}
                      showProgressBar
                      progress={filesCopied}
                      targetFolderId={targetFolderId}
                      total={totalFilesToCopy}
                      onCancelBtnTxt={wasSuccessful ? "Close" : "RETRY"}
                    />
                  ),
                  style: {
                    width: "60vw",
                    background: "none",
                  },
                  className: "p-0",
                  closeButton: false,
                  toastId,
                });
                eventSource.close();
                setIsCopyingLesson(false);
                return;
              }

              if (fileCopied) {
                filesCopied += 1;
                toast.update(toastId, {
                  render: (
                    <CopyingUnitToast
                      targetFolderId={targetFolderId}
                      title={copyingLessonStartingTxt}
                      toastId={toastId}
                      subtitle={`'${fileCopied}' was copied.`}
                      jobStatus="ongoing"
                      onCancel={cancelJob}
                      showProgressBar
                      progress={filesCopied}
                      total={totalFilesToCopy}
                    />
                  ),
                  style: {
                    width: "60vw",
                    background: "none",
                  },
                  className: "p-0",
                  closeButton: false,
                  toastId,
                });
                return;
              }

              if (typeof filesToCopy === "number") {
                totalFilesToCopy += filesToCopy;
                toast.update(toastId, {
                  render: (
                    <CopyingUnitToast
                      targetFolderId={targetFolderId}
                      title={copyingLessonStartingTxt}
                      subtitle={`${totalFilesToCopy} files to copy...`}
                      jobStatus="ongoing"
                      onCancel={cancelJob}
                      toastId={toastId}
                    />
                  ),
                  style: {
                    width: "60vw",
                    background: "none",
                  },
                  className: "p-0",
                  closeButton: false,
                  toastId,
                });
                return;
              }

              if (msg) {
                toast.update(toastId, {
                  render: (
                    <CopyingUnitToast
                      targetFolderId={targetFolderId}
                      title={copyingLessonStartingTxt}
                      subtitle={msg}
                      jobStatus="ongoing"
                      onCancel={cancelJob}
                      progress={filesCopied}
                      total={totalFilesToCopy}
                      showProgressBar={showProgressBar}
                      toastId={toastId}
                    />
                  ),
                  style: {
                    width: "60vw",
                    background: "none",
                  },
                  className: "p-0",
                  closeButton: false,
                  toastId,
                });
                return;
              }

              if (didRetrieveAllItems) {
                showProgressBar = true;
                toast.update(toastId, {
                  render: (
                    <CopyingUnitToast
                      targetFolderId={targetFolderId}
                      title={copyingLessonStartingTxt}
                      subtitle="Will copy files..."
                      jobStatus="ongoing"
                      onCancel={cancelJob}
                      total={totalFilesToCopy}
                      progress={filesCopied}
                      showProgressBar={showProgressBar}
                      toastId={toastId}
                    />
                  ),
                  style: {
                    width: "60vw",
                    background: "none",
                  },
                  className: "p-0",
                  closeButton: false,
                  toastId,
                });
                return;
              }
            } catch (error) {
              console.error("Error processing event source message: ", error);
            }
          };
        }
      },
    });

    setIsCopyingLesson(false);

    return;
  };

  const takeUserToSignUpPg = () => {
    console.log("status, takeUserToSignUpPg: ", status);
    if (status === "unauthenticated") {
      setIsGpPlusModalDisplayed(true);
      return;
    }

    setLocalStorageItem(
      "gpPlusFeatureLocation",
      `${window.location.protocol}//${window.location.host}${window.location.pathname}#teaching-materials`
    );

    router.push("/gp-plus");
  };

  didInitialRenderOccur.current = true;

  const openGDrivePickerToCopyLesson = async () => {
    try {
      const validToken = await ensureValidToken(
        gdriveAccessTokenExp!,
        setAppCookie
      );

      if (!lessonsGrades) {
        throw new Error("lessonsGrades is required but not provided");
      }
      if (!validToken) {
        setLocalStorageItem(
          "gpPlusFeatureLocation",
          `${window.location.protocol}//${window.location.host}${window.location.pathname}#teaching-materials`
        );
        window.location.href = createGDriveAuthUrl();
        // TODO: after the user authenticates with google, start copy lesson job
        return;
      }

      console.log("Opening Google Drive picker to copy lesson");

      console.log("validToken in openGDrivePickerToCopyLesson: ", validToken);

      openPicker({
        appId: "1095510414161",
        clientId: GOOGLE_DRIVE_PROJECT_CLIENT_ID,
        developerKey: process.env
          .NEXT_PUBLIC_GOOGLE_DRIVE_AUTH_API_KEY as string,
        viewId: "DOCS",
        token: validToken,
        showUploadView: true,
        setParentFolder: sharedGDriveLessonFolderId,
        showUploadFolders: true,
        customScopes: [
          "https://www.googleapis.com/auth/drive.file",
          "https://www.googleapis.com/auth/userinfo.email",
        ],
        setSelectFolderEnabled: true,
        supportDrives: true,
        multiselect: true,
        callbackFunction: async (data) => {
          if (data?.docs?.length) {
            setIsCopyingLesson(true);

            const validToken = await ensureValidToken(
              gdriveAccessTokenExp!,
              setAppCookie
            );

            console.log("validToken: ", validToken);

            if (!validToken || !gdriveEmail) {
              setLocalStorageItem(
                "gpPlusFeatureLocation",
                `${window.location.protocol}//${window.location.host}${window.location.pathname}#teaching-materials`
              );
              window.location.href = createGDriveAuthUrl();
              return;
            }

            const toastId = nanoid();

            setLessonsCopyJobs((state) => {
              const stateClone = structuredClone(state);

              if (stateClone.length === 2) {
                stateClone.pop();
              }

              stateClone.push(toastId);

              return stateClone;
            });

            toast(
              <CopyingUnitToast
                title={copyingLessonStartingTxt}
                toastId={toastId}
                subtitle="In progress..."
                onCancel={() => {
                  toast.update(toastId, {
                    render: (
                      <CopyingUnitToast
                        toastId={toastId}
                        title={"Job has been canceled."}
                        subtitle={`You have stopped copying lesson '${lessonName}.'`}
                        jobStatus="canceled"
                        onCancel={() => {}}
                        isCancelBtnDisabled
                      />
                    ),
                    style: {
                      width: "60vw",
                      background: "none",
                    },
                    className: "p-0",
                    closeButton: false,
                    toastId,
                    autoClose: 3000,
                  });
                  setIsCopyingLesson(false);
                }}
                jobStatus="ongoing"
              />,
              {
                style: {
                  width: "60vw",
                  background: "none",
                },
                className: "p-0",
                closeButton: false,
                toastId,
                autoClose: false,
              }
            );

            console.log("toastId: ", toastId);

            const currentValidToken = await ensureValidToken(
              gdriveAccessTokenExp!,
              setAppCookie
            );

            if (!currentValidToken) {
              toast.dismiss(toastId);
              alert(
                "Your google drive session has expired. Please log in again."
              );
              setIsCopyingLesson(false);
              setLocalStorageItem(
                "gpPlusFeatureLocation",
                `${window.location.protocol}//${window.location.host}${window.location.pathname}#teaching-materials`
              );
              window.location.href = createGDriveAuthUrl();
              return;
            }

            console.log("data, yo there: ", data);
            console.log("First document ID, data?.docs: ", data?.docs);

            const fileIds = data.docs.map((file) => file.id);
            const fileNames = data.docs.map((file) => file.name);
            const reqQueryParams: Partial<TCopyLessonReqQueryParams> = {
              unitId: unitId,
              unitName: MediumTitle,
              unitSharedGDriveId: GdrivePublicID!,
              lessonId:
                typeof lessonId === "number" ? lessonId.toString() : lessonId,
              lessonName: lessonName,
              lessonSharedGDriveFolderId: sharedGDriveLessonFolderId,
              lessonSharedDriveFolderName,
              lessonsFolderGradesRange: lessonsGrades,
            };

            console.log("reqQueryParams: ", reqQueryParams);

            const headers = {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
              "gdrive-token": validToken,
              "gdrive-token-refresh": gdriveRefreshToken!,
              "user-gmail": gdriveEmail,
            };
            const url = new URL(
              `${window.location.origin}/api/gp-plus/copy-lesson`
            );

            Object.entries<unknown>(reqQueryParams).forEach(([key, val]) => {
              url.searchParams.append(key, val as string);
            });

            if (fileIds.length) {
              fileIds.forEach((fileId) => {
                url.searchParams.append("fileIds", fileId);
              });
            }

            if (fileNames.length) {
              fileNames.forEach((fileName) => {
                url.searchParams.append("fileNames", fileName);
              });
            }

            if (allUnitLessons?.length) {
              url.searchParams.append(
                "allUnitLessons",
                encodeURI(JSON.stringify(allUnitLessons))
              );
            }

            if (lessonsFolder) {
              url.searchParams.append(
                "lessonsFolder",
                encodeURI(JSON.stringify(lessonsFolder))
              );
            }

            console.log("lessonsFolder: ", lessonsFolder);

            const eventSource = new EventSourcePolyfill(url.href, {
              headers,
              withCredentials: true,
            });

            const cancelJob = () => {
              eventSource.close();
              setIsCopyingLesson(false);
              toast.update(toastId, {
                render: (
                  <CopyingUnitToast
                    subtitle={"Job has been canceled."}
                    title={`Copying lesson '${lessonName}' has been stopped.`}
                    jobStatus="canceled"
                    onCancel={() => {}}
                    isCancelBtnDisabled
                    toastId={toastId}
                  />
                ),
                style: {
                  width: "60vw",
                  background: "none",
                },
                className: "p-0",
                closeButton: false,
                toastId,
                autoClose: 3000,
              });
            };

            let totalFilesToCopy = 0;
            let filesCopied = 0;
            let showProgressBar = false;
            let targetFolderId: string | undefined = undefined;

            eventSource.onmessage = (event) => {
              try {
                const dataParsable = event.data as string;
                const parsedData =
                  (JSON.parse(dataParsable) as TCopyFilesMsg | undefined) ?? {};
                const {
                  msg,
                  filesToCopy,
                  fileCopied,
                  didRetrieveAllItems,
                  isJobDone,
                  wasSuccessful,
                  targetFolderId: _targetFolderId,
                } = parsedData;
                targetFolderId = _targetFolderId;
                let canDisplayToast = true;

                setCopyLessonJobLatestMsg((state) => {
                  if (!state) {
                    return {
                      toastId,
                      ...parsedData,
                    };
                  }

                  return {
                    ...parsedData,
                  };
                });

                setLessonsCopyJobs((state) => {
                  canDisplayToast = state.includes(toastId);

                  return state;
                });

                if (!canDisplayToast) {
                  console.log(
                    "Cannot display toast - toastId not found in lessonsCopyJobs"
                  );
                  return;
                }

                console.log("data, python: ", parsedData);

                if (isJobDone) {
                  setParts((parts) => {
                    console.log("lessonId: ", lessonId);

                    const targetPartIndex = parts.findIndex((part) => {
                      return part.lsn && lessonId && part.lsn == lessonId;
                    });
                    const targetPart = parts[targetPartIndex];

                    console.log("targetPart: ", targetPart);

                    if (!targetPart) {
                      return parts;
                    }

                    parts[targetPartIndex] = {
                      ...targetPart,
                      userGDriveLessonFolderId: targetFolderId,
                    };

                    return parts;
                  });

                  const title = wasSuccessful
                    ? `Successfully copied '${lessonName}'`
                    : `Failed to copy '${lessonName}'`;
                  toast.update(toastId, {
                    render: (
                      <CopyingUnitToast
                        title={title}
                        toastId={toastId}
                        subtitle={
                          wasSuccessful
                            ? "Copy completed successfully!"
                            : "Copy operation failed"
                        }
                        jobStatus={wasSuccessful ? "success" : "failure"}
                        onCancel={() => {
                          console.log("Toast dismissed after job completion");
                          if (!wasSuccessful) {
                            toast.dismiss(toastId);
                            btnRef.current?.click();
                            return;
                          }

                          toast.dismiss(toastId);
                        }}
                        showProgressBar
                        progress={filesCopied}
                        targetFolderId={targetFolderId}
                        total={totalFilesToCopy}
                        onCancelBtnTxt={wasSuccessful ? "Close" : "RETRY"}
                      />
                    ),
                    style: {
                      width: "60vw",
                      background: "none",
                    },
                    className: "p-0",
                    closeButton: false,
                    toastId,
                  });
                  eventSource.close();
                  setIsCopyingLesson(false);
                  return;
                }

                if (fileCopied) {
                  filesCopied += 1;
                  toast.update(toastId, {
                    render: (
                      <CopyingUnitToast
                        targetFolderId={targetFolderId}
                        title={copyingLessonStartingTxt}
                        toastId={toastId}
                        subtitle={`'${fileCopied}' was copied.`}
                        jobStatus="ongoing"
                        onCancel={cancelJob}
                        showProgressBar
                        progress={filesCopied}
                        total={totalFilesToCopy}
                      />
                    ),
                    style: {
                      width: "60vw",
                      background: "none",
                    },
                    className: "p-0",
                    closeButton: false,
                    toastId,
                  });
                  return;
                }

                if (typeof filesToCopy === "number") {
                  totalFilesToCopy += filesToCopy;
                  toast.update(toastId, {
                    render: (
                      <CopyingUnitToast
                        targetFolderId={targetFolderId}
                        title={copyingLessonStartingTxt}
                        subtitle={`${totalFilesToCopy} files to copy...`}
                        jobStatus="ongoing"
                        onCancel={cancelJob}
                        toastId={toastId}
                      />
                    ),
                    style: {
                      width: "60vw",
                      background: "none",
                    },
                    className: "p-0",
                    closeButton: false,
                    toastId,
                  });
                  return;
                }

                if (msg) {
                  toast.update(toastId, {
                    render: (
                      <CopyingUnitToast
                        targetFolderId={targetFolderId}
                        title={copyingLessonStartingTxt}
                        subtitle={msg}
                        jobStatus="ongoing"
                        onCancel={cancelJob}
                        progress={filesCopied}
                        total={totalFilesToCopy}
                        showProgressBar={showProgressBar}
                        toastId={toastId}
                      />
                    ),
                    style: {
                      width: "60vw",
                      background: "none",
                    },
                    className: "p-0",
                    closeButton: false,
                    toastId,
                  });
                  return;
                }

                if (didRetrieveAllItems) {
                  showProgressBar = true;
                  toast.update(toastId, {
                    render: (
                      <CopyingUnitToast
                        targetFolderId={targetFolderId}
                        title={copyingLessonStartingTxt}
                        subtitle="Will copy files..."
                        jobStatus="ongoing"
                        onCancel={cancelJob}
                        total={totalFilesToCopy}
                        progress={filesCopied}
                        showProgressBar={showProgressBar}
                        toastId={toastId}
                      />
                    ),
                    style: {
                      width: "60vw",
                      background: "none",
                    },
                    className: "p-0",
                    closeButton: false,
                    toastId,
                  });
                  return;
                }
              } catch (error) {
                console.error("Error processing event source message: ", error);

                setLessonToCopy((state) => {
                  if (state) {
                    return null;
                  }

                  return state;
                });
              }
            };
          }
        },
      });
    } catch (error) {
      console.error("Error in copyLesson function: ", error);

      setLessonToCopy((state) => {
        if (state) {
          return null;
        }

        return state;
      });
    }
  };

  useEffect(() => {
    console.log("lessonToCopy: ", lessonToCopy);

    if (lessonToCopy?.willOpenGDrivePicker && lessonToCopy.id == lessonId) {
      openGDrivePickerToCopyLesson();
    }
  }, [lessonToCopy]);

  return (
    <div style={{ width: "fit-content" }} className="mb-3">
      <Button
        ref={btnRef}
        onClick={isGpPlusMember ? copyLesson : takeUserToSignUpPg}
        style={{
          pointerEvents:
            isRetrievingLessonFolderIds ||
            isCopyLessonBtnDisabled ||
            isCopyingLesson
              ? "none"
              : "auto",
          minHeight: "51px",
          backgroundColor: "white",
          border: "solid 3px #2339C4",
          borderRadius: "2em",
          textTransform: "none",
          minWidth: "300px",
          width: "fit-content",
        }}
        className={`px-3 py-2 col-12 ${
          isRetrievingLessonFolderIds ||
          isCopyLessonBtnDisabled ||
          isCopyingLesson
            ? "opacity-25"
            : "opacity-100"
        }`}
        disabled={
          isRetrievingLessonFolderIds ||
          !didInitialRenderOccur.current ||
          isCopyLessonBtnDisabled ||
          isCopyingLesson
        }
      >
        {didInitialRenderOccur.current ? (
          <div className="d-flex flex-row align-items-center justify-content-center gap-2">
            {isRetrievingLessonFolderIds ||
            isCopyLessonBtnDisabled ||
            isCopyingLesson ? (
              <Spinner className="text-black" />
            ) : (
              <>
                <Image
                  alt="gp_plus_logo"
                  src="/plus/plus.png"
                  width={32}
                  height={32}
                />
                <div
                  style={{ lineHeight: "23px", fontSize: "18px" }}
                  className="d-flex flex-column text-black"
                >
                  {isGpPlusMember && !gdriveAccessToken && (
                    <>Authenticate w/ Google Drive & Copy lesson</>
                  )}
                  {isGpPlusMember &&
                    gdriveAccessToken &&
                    (userGDriveLessonFolderId
                      ? "Bulk copy to my Google Drive again"
                      : "Bulk copy to my Google Drive")}
                  {!isGpPlusMember && (
                    <>Subscribe to copy this lesson to your Google Drive</>
                  )}
                </div>
              </>
            )}
          </div>
        ) : (
          <div
            className="spinner-border spinner-border-sm text-light"
            role="status"
          >
            <span className="visually-hidden">Loading...</span>
          </div>
        )}
      </Button>
      <div
        style={{ fontSize: "18px", height: "30px" }}
        className="text-break mx-auto text-center mt-1"
      >
        {userGDriveLessonFolderId && !isCopyingLesson && (
          <>
            Your latest copy of this lesson is linked
            <Link
              target="_blank"
              className="ms-1 text-start text-lg-center"
              href={`${GDRIVE_FOLDER_ORIGIN_AND_PATH}/${userGDriveLessonFolderId}`}
            >
              here
            </Link>
            .
          </>
        )}
      </div>
    </div>
  );
};

export default CopyLessonBtn;
