import React, { ReactNode } from "react";
import { Spinner } from "react-bootstrap";
import { TCopyUnitJobResult } from "../pages/api/gp-plus/copy-unit";

interface CopyingUnitToastProps {
  title?: string;
  subtitle?: string;
  showProgressBar?: boolean;
  jobStatus: TCopyUnitJobResult,
  progress: number; // current progress value
  total: number; // total value
  onCancel: () => void;
}

type TCopyItemProgressBarProps = Pick<
  CopyingUnitToastProps,
  "progress" | "total"
> & { percent: number };

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
        {progress}/{total} files
      </div>
    </div>
  );
};

const CopyingUnitToast: React.FC<CopyingUnitToastProps> = ({
  title = "Copying your unit...",
  subtitle = "Copying files...",
  progress,
  showProgressBar = false,
  total,
  jobStatus,
  onCancel,
}) => {
  // Calculate percent for progress bar
  const percent =
    total > 0 ? Math.min(100, Math.round((progress / total) * 100)) : 0;
  let JobStatusIcon: ReactNode | string = <Spinner animation="border" size="sm" className="me-2" />;

  if (jobStatus === "success"){
    JobStatusIcon = "✅";
  } else if (jobStatus === "failure") {
    JobStatusIcon = "❌";
  }

  return (
    <div
      style={{
        // maxWidth: 400,
        width: "29vw",
        background: "#212529",
        borderRadius: 10,
        boxShadow: "0 4px 16px rgba(44, 62, 80, 0.18)",
        padding: "24px 32px 24px 24px",
        color: "#fff",
        fontFamily: "Segoe UI, Arial, sans-serif",
      }}
    >
      <div
        style={{
          fontWeight: 500,
          fontSize: "20px",
          marginBottom: 8,
          display: "flex",
          alignItems: "center",
        }}
      >
        {JobStatusIcon}
        {title}
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
        {showProgressBar ? (
          <CopyingItemsProgressBar
            progress={progress}
            total={total}
            percent={percent}
          />
        ) : (
          <div className="text-center">
            <Spinner animation="border" size="sm" className="me-2" />
          </div>
        )}
      </div>
      <div
        style={{ display: "flex", justifyContent: "flex-end", marginTop: 18 }}
      >
        <button
          onClick={onCancel}
          style={{
            background: "#333438",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            padding: "8px 28px",
            fontSize: 15,
            cursor: "pointer",
            fontWeight: 500,
            transition: "background 0.2s",
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default CopyingUnitToast;
