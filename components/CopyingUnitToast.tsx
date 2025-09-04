/* eslint-disable quotes */
/* eslint-disable indent */
/* eslint-disable object-curly-spacing */

import React, { ReactNode, RefObject, useState } from "react";
import { Spinner } from "react-bootstrap";
import { TCopyUnitJobResult } from "../pages/api/gp-plus/copy-unit";
import CustomLink from "./CustomLink";
import { BtnWithSpinner } from "./General/BtnWithSpinner";
import { toast } from "react-toastify";

interface CopyingUnitToastProps {
  title: string;
  subtitle: string | ReactNode;
  showProgressBar?: boolean;
  jobStatus: TCopyUnitJobResult;
  ref?: RefObject<HTMLDivElement | null>;
  progress?: number;
  total?: number;
  targetFolderId?: string;
  onCancel: () => void;
  onCancelBtnTxt?: "CANCEL" | "Close" | "RETRY";
  isCancelBtnDisabled?: boolean;
  toastId: string;
}

type TCopyItemProgressBarProps = Pick<
  CopyingUnitToastProps,
  "progress" | "total"
> & { percent: number };

export const GDRIVE_FOLDER_ORIGIN_AND_PATH = `https://drive.google.com/drive/folders`;

const CopyingItemsProgressBar: React.FC<TCopyItemProgressBarProps> = ({
  progress,
  total,
  percent,
}) => {
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: 4 }}>
      <div style={{ flex: 1, marginRight: 12 }}>
        <div
          style={{
            background: "#444B57",
            borderRadius: 4,
            height: 8,
            width: "100%",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              background: "#4F6AFB",
              width: `${percent}%`,
              height: 8,
              borderRadius: 4,
              transition: "width 0.3s",
            }}
          />
        </div>
      </div>
      <div
        style={{
          fontSize: 13,
          color: "#b0b6c3",
          minWidth: 70,
          textAlign: "right",
        }}
      >
        {progress}/{total} items
      </div>
    </div>
  );
};

const CopyingUnitToast: React.FC<CopyingUnitToastProps> = ({
  title = "Copying your unit...",
  toastId,
  subtitle = "Copying files...",
  progress,
  showProgressBar = false,
  total,
  jobStatus,
  ref,
  targetFolderId,
  onCancel,
  onCancelBtnTxt = "CANCEL",
  isCancelBtnDisabled,
}) => {
  let percent: number | null = null;
  const [wasCancelBtnClicked, setWasCancelBtnClicked] = useState(false);

  if (typeof total === "number" && typeof progress === "number") {
    percent =
      total > 0 ? Math.min(100, Math.round((progress / total) * 100)) : 0;
  }

  let JobStatusIcon: ReactNode | string = (
    <Spinner animation="border" className="me-2" />
  );

  if (jobStatus === "success") {
    JobStatusIcon = "✅";
  } else if (jobStatus === "failure" || jobStatus === "canceled") {
    JobStatusIcon = "❌";
  }

  return (
    <div
      ref={ref}
      style={{
        background: "#212529",
        borderRadius: 10,
        maxHeight: "265px",
        boxShadow: "0 4px 16px rgba(44, 62, 80, 0.18)",
        padding: "24px 32px 24px 24px",
        color: "#fff",
        fontFamily: "Segoe UI, Arial, sans-serif",
      }}
      className="w-100"
    >
      <div className="position-relative h-100">
        {jobStatus !== "ongoing" && (
          <button
            onClick={() => {
              toast.dismiss(toastId);
            }}
            style={{
              position: "absolute",
              top: "8px",
              right: "8px",
              background: "transparent",
              border: "none",
              color: "#fff",
              fontSize: "20px",
              cursor: "pointer",
              padding: "4px",
              borderRadius: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "28px",
              height: "28px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor =
                "rgba(255, 255, 255, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            ×
          </button>
        )}
        <div
          style={{
            fontWeight: 500,
            fontSize: "20px",
            marginBottom: 8,
            display: "flex",
            alignItems: "center",
          }}
        >
          {JobStatusIcon} {title}
        </div>
        <div className="d-flex flex-column gap-2 py-2">
          <div
            style={{
              fontSize: "18px",
              marginBottom: 8,
              ...(jobStatus === "ongoing"
                ? {
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    wordWrap: "break-word",
                    wordBreak: "break-word",
                  }
                : {}),
            }}
            className={`${!showProgressBar ? "text-center" : ""} w-100`}
          >
            {subtitle}
          </div>
          {showProgressBar &&
          typeof percent === "number" &&
          typeof total === "number" ? (
            <>
              {targetFolderId && (
                <div
                  style={{
                    fontSize: "18px",
                    width: "100%",
                    display: "inline-block",
                    wordBreak: "break-all",
                    overflowWrap: "break-word",
                  }}
                >
                  Link to folder:{" "}
                  <CustomLink
                    hrefStr={`${GDRIVE_FOLDER_ORIGIN_AND_PATH}/${targetFolderId}`}
                    className="under-on-hover pointer flex-wrap"
                    style={{
                      wordBreak: "break-all",
                      overflowWrap: "break-word",
                    }}
                    targetLinkStr="_blank"
                  >
                    {`${GDRIVE_FOLDER_ORIGIN_AND_PATH}/${targetFolderId}`}
                  </CustomLink>
                </div>
              )}

              <CopyingItemsProgressBar
                progress={progress}
                total={total}
                percent={percent}
              />
            </>
          ) : jobStatus === "ongoing" ? (
            <div className="text-center">
              <Spinner animation="border" className="me-2" />
            </div>
          ) : null}
        </div>
        <div className="w-100 bottom-0 d-flex justify-content-end">
          <BtnWithSpinner
            onClick={onCancel}
            wasClicked={wasCancelBtnClicked}
            style={{
              background: "#333438",
              color: "#fff",
              border: "none",
              width: "175px",
              borderRadius: 4,
              padding: "8px 28px",
              fontSize: 15,
              cursor: "pointer",
              fontWeight: 500,
              transition: "background 0.2s",
            }}
            disabled={isCancelBtnDisabled}
          >
            {onCancelBtnTxt}
          </BtnWithSpinner>
        </div>
      </div>
    </div>
  );
};

export default CopyingUnitToast;
