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

interface IProps {
  gdriveLessonFolderId?: string;
  GdrivePublicID: string;
  MediumTitle: string;
  lessonName: string;
  lessonId: string | number;
}

const CopyLessonBtn: React.FC<IProps> = ({
  gdriveLessonFolderId,
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
  const { gdriveAccessToken, token, gdriveRefreshToken, status, gdriveAccessTokenExp } =
    useSiteSession();
  const [openPicker, authResult] = useDrivePicker();
  const [isCopyingUnitBtnDisabled, setIsCopyingUnitBtnDisabled] =
    useState(false);
  const [, setIsGpPlusModalDisplayed] = _isGpPlusModalDisplayed;
  const didInitialRenderOccur = useRef(false);

  const copyUnit = async () => {
    console.log("Copy unit function called");

    setIsCopyingUnitBtnDisabled(true);

    if (!gdriveAccessToken) {
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
      token: gdriveAccessToken,
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
          // create the folder structure

          console.log("data, yo there: ", data);
          if (data?.docs?.length) {
            console.log("First document ID, data?.docs: ", data?.docs);
            const fileIds = data.docs.map((file) => file.id);
            const response = await axios.post(
              "/api/gp-plus/copy-lesson",
              {
                fileIds,
                unit: {
                  id: GdrivePublicID,
                  name: MediumTitle,
                },
                lesson: {
                  id: typeof lessonId === "number" ? lessonId.toString() : lessonId,
                  name: lessonName,
                },
              } as TCopyLessonReqBody,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "gdrive-token": gdriveAccessToken,
                  "gdrive-token-refresh": gdriveRefreshToken,
                },
              }
            );

            console.log("Response: ", response);
          }
        } catch (error) {
          console.error("An error occurred: ", error);
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
      } mb-3`}
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
                  <>Authenticate w/ Google Drive & Copy Unit</>
                )}
                {isGpPlusMember &&
                  gdriveAccessToken &&
                  (gdriveLessonFolderId
                    ? "Select and copy to my Google Drive again"
                    : "Select and copy to my Google Drive")}
                {!isGpPlusMember && (
                  <>Subscribe to copy this whole unit to Google Drive</>
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
  );
};

export default CopyLessonBtn;
