import { useEffect, useRef, useState } from "react";
import { Button, Spinner } from "react-bootstrap";
import { useUserContext } from "../../../providers/UserProvider";
import useDrivePicker from "react-google-drive-picker";
import useSiteSession from "../../../customHooks/useSiteSession";
import { createGDriveAuthUrl, setLocalStorageItem } from "../../../shared/fns";
import { GOOGLE_DRIVE_PROJECT_CLIENT_ID } from "../../../globalVars";
import axios from "axios";
import { useModalContext } from "../../../providers/ModalProvider";
import { useRouter } from "next/router";
import Image from "next/image";
import { refreshGDriveToken } from "../../../apiServices/user/crudFns";
import { useCustomCookies } from "../../../customHooks/useCustomCookies";
import Link from "next/link";
import { GDRIVE_FOLDER_ORIGIN_AND_PATH } from "../../CopyingUnitToast";
import { EXPIRATION_DATE_TIME } from "../../../pages/google-drive-auth-result";
import { INewUnitLesson } from "../../../backend/models/Unit/types/teachingMaterials";
import { useLessonContext } from "../../../providers/LessonProvider";
import Cookies from "js-cookie";
import { TCopyLessonReqBody } from "../../../pages/api/gp-plus/copy-lesson";
import { ILessonForUI } from "../../../types/global";
import { INewUnitSchema } from "../../../backend/models/Unit/types/unit";

interface IProps
  extends Pick<INewUnitLesson, "sharedGDriveLessonFolderId" | "allUnitLessons">,
    Pick<INewUnitSchema, "GdrivePublicID"> {
  _userGDriveLessonFolderId?: Pick<
    INewUnitLesson,
    "userGDriveLessonFolderId"
  >["userGDriveLessonFolderId"];
  unitId: string;
  MediumTitle: string;
  lessonName: string;
  lessonId: string | number;
  sharedDriveLessonFolderId?: string;
  lessonSharedDriveFolderName?: string;
}

const CopyLessonBtn: React.FC<IProps> = ({
  sharedGDriveLessonFolderId,
  MediumTitle,
  unitId,
  lessonId,
  lessonName,
  lessonSharedDriveFolderName,
  _userGDriveLessonFolderId,
  allUnitLessons,
  GdrivePublicID,
}) => {
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const { _isGpPlusMember, _isCopyUnitBtnDisabled } = useUserContext();
  const { _lessonToCopy } = useLessonContext();
  const router = useRouter();
  const { _isGpPlusModalDisplayed } = useModalContext();
  const [, setLessonToCopy] = _lessonToCopy;
  const [isGpPlusMember] = _isGpPlusMember;
  const {
    gdriveAccessToken,
    token,
    gdriveRefreshToken,
    status,
    gdriveAccessTokenExp,
  } = useSiteSession();
  const { setAppCookie } = useCustomCookies();
  const [openPicker, authResult] = useDrivePicker();
  const [isCopyLessonBtnDisabled, setCanPressCopyLessonBtn] =
    _isCopyUnitBtnDisabled;
  const [isCopyingLesson, setIsCopyingLesson] = useState(false);
  const [, setIsGpPlusModalDisplayed] = _isGpPlusModalDisplayed;
  const didInitialRenderOccur = useRef(false);
  const [userGDriveLessonFolderId, setUserGDriveLessonFolderId] = useState(
    _userGDriveLessonFolderId
  );

  const ensureValidToken = async () => {
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

  const copyUnit = async () => {
    console.log("Copy unit function called");

    setIsCopyingLesson(true);

    const validToken = await ensureValidToken();

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
      "Copying existing lesson google drive id: ",
      sharedGDriveLessonFolderId
    );

    openPicker({
      appId: "1095510414161",
      clientId: GOOGLE_DRIVE_PROJECT_CLIENT_ID,
      developerKey: process.env.NEXT_PUBLIC_GOOGLE_DRIVE_AUTH_API_KEY as string,
      viewId: "DOCS",
      token: validToken,
      showUploadView: true,
      setParentFolder: sharedGDriveLessonFolderId,
      showUploadFolders: true,
      setIncludeFolders: true,
      customScopes: [
        "https://www.googleapis.com/auth/drive.file",
        "https://www.googleapis.com/auth/userinfo.email",
      ],
      setSelectFolderEnabled: true,
      supportDrives: true,
      multiselect: true,
      callbackFunction: async (data) => {
        try {
          // Ensure token is still valid before making the API call

          // if (!sharedGDriveLessonFolderId || !lessonSharedDriveFolderName) {
          //   alert(
          //     "An error has occurred. Please refresh the page and try again."
          //   );
          //   return;
          // }

          const currentValidToken = await ensureValidToken();

          if (!currentValidToken) {
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
          if (data?.docs?.length) {
            console.log("First document ID, data?.docs: ", data?.docs);
            setIsCopyingLesson(true);
            const fileIds = data.docs.map((file) => file.id);
            const reqBody: TCopyLessonReqBody = {
              fileIds,
              unit: {
                id: unitId,
                name: MediumTitle,
                sharedGDriveId: GdrivePublicID!,
              },
              lesson: {
                id:
                  typeof lessonId === "number" ? lessonId.toString() : lessonId,
                name: lessonName,
                sharedGDriveLessonFolderId,
                lessonSharedDriveFolderName,
              },
              allUnitLessons,
            };

            console.log("reqBody: ", reqBody);

            const response = await axios.post<{
              lessonGdriveFolderId?: string;
              errorObj?: unknown;
            }>("/api/gp-plus/copy-lesson", reqBody, {
              headers: {
                Authorization: `Bearer ${token}`,
                "gdrive-token": currentValidToken,
                "gdrive-token-refresh": gdriveRefreshToken,
              },
            });

            if (
              response.data?.errorObj ||
              !response.data?.lessonGdriveFolderId
            ) {
              console.error("Error copying lesson:", response.data.errorObj);
              alert("Failed to copy lesson. Please try again.");
              return;
            }

            console.log("Response: ", response);

            setUserGDriveLessonFolderId(response.data?.lessonGdriveFolderId);
          }
        } catch (error) {
          console.error("An error occurred: ", error);
          alert("Failed to copy lesson. Please try again.");
        } finally {
          setIsCopyingLesson(false);
        }
      },
    });

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

  return (
    <div style={{ width: "fit-content" }} className="mb-3">
      <Button
        ref={btnRef}
        onClick={isGpPlusMember ? copyUnit : takeUserToSignUpPg}
        style={{
          pointerEvents:
            isCopyLessonBtnDisabled || isCopyingLesson ? "none" : "auto",
          minHeight: "51px",
          backgroundColor: "white",
          border: "solid 3px #2339C4",
          borderRadius: "2em",
          textTransform: "none",
          minWidth: "300px",
          width: "fit-content",
        }}
        className={`px-3 py-2 col-12 ${
          isCopyLessonBtnDisabled || isCopyingLesson
            ? "opacity-25"
            : "opacity-100"
        }`}
        disabled={
          !didInitialRenderOccur.current ||
          isCopyLessonBtnDisabled ||
          isCopyingLesson
        }
      >
        {didInitialRenderOccur.current ? (
          <div className="d-flex flex-row align-items-center justify-content-center gap-2">
            {isCopyLessonBtnDisabled || isCopyingLesson ? (
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
                      ? "Select and copy to my Google Drive again"
                      : "Select and copy to my Google Drive")}
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
        style={{ fontSize: "18px", height: '30px' }}
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
