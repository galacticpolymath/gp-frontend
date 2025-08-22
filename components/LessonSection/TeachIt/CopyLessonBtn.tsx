import { useRef, useState } from "react";
import { Button, Spinner } from "react-bootstrap";
import { useUserContext } from "../../../providers/UserProvider";
import useDrivePicker from "react-google-drive-picker";
import useSiteSession from "../../../customHooks/useSiteSession";
import { createGDriveAuthUrl, setLocalStorageItem } from "../../../shared/fns";
import { GOOGLE_DRIVE_PROJECT_CLIENT_ID } from "../../../globalVars";
import axios from "axios";
import { TCopyLessonReqBody } from "../../../pages/api/gp-plus/copy-lesson";
import { useModalContext } from "../../../providers/ModalProvider";
import { useRouter } from "next/router";
import Image from "next/image";
import { refreshGDriveToken } from "../../../apiServices/user/crudFns";
import { useCustomCookies } from "../../../customHooks/useCustomCookies";
import { set } from "cypress/types/lodash";
import Link from "next/link";
import { GDRIVE_FOLDER_ORIGIN_AND_PATH } from "../../CopyingUnitToast";
import { EXPIRATION_DATE_TIME } from "../../../pages/google-drive-auth-result";
import { INewUnitLesson } from "../../../backend/models/Unit/types/teachingMaterials";

interface IProps {
  _gdriveLessonFolderId?: Pick<INewUnitLesson, "gdriveLessonFolderId">["gdriveLessonFolderId"];
  GdrivePublicID: string;
  MediumTitle: string;
  lessonName: string;
  lessonId: string | number;
}

const CopyLessonBtn: React.FC<IProps> = ({
  _gdriveLessonFolderId,
  MediumTitle,
  GdrivePublicID,
  lessonId,
  lessonName,
}) => {
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const {
    _isGpPlusMember,
    _isCopyUnitBtnDisabled,
    _didAttemptRetrieveUserData,
    _userLatestCopyUnitFolderId,
  } = useUserContext();
  const router = useRouter();
  const { _isGpPlusModalDisplayed } = useModalContext();
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
  const [isCopyingUnitBtnDisabled, setIsCopyingUnitBtnDisabled] =
    useState(false);
  const [, setIsGpPlusModalDisplayed] = _isGpPlusModalDisplayed;
  const didInitialRenderOccur = useRef(false);
  const [gdriveLessonFolderId, setGdriveLessonFolderId] = useState(
    _gdriveLessonFolderId
  );

  // Function to check if token is expired and refresh if needed
  const ensureValidToken = async () => {
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

    setIsCopyingUnitBtnDisabled(true);

    const validToken = await ensureValidToken();

    if (!validToken) {
      setLocalStorageItem(
        "gpPlusFeatureLocation",
        `${window.location.protocol}//${window.location.host}${window.location.pathname}#teaching-materials`
      );
      window.location.href = createGDriveAuthUrl();
      return;
    }

    openPicker({
      appId: "1095510414161",
      clientId: GOOGLE_DRIVE_PROJECT_CLIENT_ID,
      developerKey: process.env.NEXT_PUBLIC_GOOGLE_DRIVE_AUTH_API_KEY as string,
      viewId: "DOCS",
      token: validToken,
      showUploadView: true,
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
          const currentValidToken = await ensureValidToken();

          if (!currentValidToken) {
            console.error("No valid token available for API call");
            return;
          }

          console.log("data, yo there: ", data);
          if (data?.docs?.length) {
            console.log("First document ID, data?.docs: ", data?.docs);
            const fileIds = data.docs.map((file) => file.id);
            const reqBody = {
              fileIds,
              unit: {
                id: GdrivePublicID,
                name: MediumTitle,
              },
              lesson: {
                id:
                  typeof lessonId === "number" ? lessonId.toString() : lessonId,
                name: lessonName,
              },
            };

            console.log("reqBody: ", reqBody);
            debugger;

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
            setGdriveLessonFolderId(response.data?.lessonGdriveFolderId);
          }
        } catch (error) {
          console.error("An error occurred: ", error);
          alert("Failed to copy lesson. Please try again.");
        }
      },
    });

    setIsCopyingUnitBtnDisabled(false);

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
    <div style={{ width: 'fit-content' }} className="mb-4">
      <Button
        ref={btnRef}
        onClick={isGpPlusMember ? copyUnit : takeUserToSignUpPg}
        style={{
          pointerEvents: isCopyingUnitBtnDisabled ? "none" : "auto",
          minHeight: "51px",
          backgroundColor: "white",
          border: "solid 3px #2339C4",
          borderRadius: "2em",
          textTransform: "none",
          minWidth: "300px",
          width: "fit-content",
        }}
        className={`px-3 py-2 col-12 ${
          isCopyingUnitBtnDisabled ? "opacity-25" : "opacity-100"
        }`}
        disabled={!didInitialRenderOccur.current || isCopyingUnitBtnDisabled}
      >
        {didInitialRenderOccur.current ? (
          <div className="d-flex flex-row align-items-center justify-content-center gap-2">
            {isCopyingUnitBtnDisabled ? (
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
                    (gdriveLessonFolderId
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
      {gdriveLessonFolderId && (
        <div
          style={{ fontSize: "18px" }}
          className="text-break mx-auto text-center mt-1 mb-2"
        >
          Your latest copy of this lesson is linked
          <Link
            target="_blank"
            className="ms-1 text-start text-lg-center"
            href={`${GDRIVE_FOLDER_ORIGIN_AND_PATH}/${gdriveLessonFolderId}`}
          >
            here
          </Link>
          .
        </div>
      )}
    </div>
  );
};

export default CopyLessonBtn;
