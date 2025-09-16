import React, { useState } from "react";
import { Button, Modal, ListGroup, Spinner } from "react-bootstrap";
import { useModalContext } from "../../providers/ModalProvider";
import { useLessonContext } from "../../providers/LessonProvider";
import { TFileToCopy } from "../../backend/services/gdriveServices/types";
import axios from "axios";
import { toast } from "react-toastify";
import useSiteSession from "../../customHooks/useSiteSession";

interface FailedCopiedFilesReportModalProps {
  onClose?: () => void;
}

const TOAST_POSITION = "bottom-right";

const FailedCopiedFilesReportModal: React.FC<
  FailedCopiedFilesReportModalProps
> = ({ onClose }) => {
  const { _failedCopiedLessonFiles } = useLessonContext();
  const { _isFailedCopiedFilesReportModalOn } = useModalContext();
  const [
    isFailedCopiedFilesReportModalOn,
    setIsFailedCopiedFilesReportModalOn,
  ] = _isFailedCopiedFilesReportModalOn;
  const { token } = useSiteSession();
  const [failedCopiedLessonFiles, setFailedCopiedLessonFiles] =
    _failedCopiedLessonFiles;
  const [isSendingReport, setIsSendingReport] = useState(false);

  const handleOnHide = () => {
    if (onClose) {
      onClose();
    }

    setIsFailedCopiedFilesReportModalOn(false);
    setTimeout(() => {
      setFailedCopiedLessonFiles(null);
    }, 400);
  };

  const handleSendReport = async () => {
    if (!failedCopiedLessonFiles || failedCopiedLessonFiles.length === 0) {
      toast.error("No failed files to report", { position: TOAST_POSITION });
      return;
    }

    setIsSendingReport(true);

    try {
      const response = await axios.post(
        "/api/gp-plus/send-failed-files-report",
        {
          failedFiles: failedCopiedLessonFiles,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.wasSuccessful) {
        toast.success("Report sent successfully! We'll investigate the issue.");
        handleOnHide();
      } else {
        toast.error("Failed to send report. Please try again.", {
          position: TOAST_POSITION,
        });
      }
    } catch (error) {
      console.error("Error sending failed files report:", error);
      toast.error("Failed to send report. Please try again.", {
        position: TOAST_POSITION,
      });
    } finally {
      setIsSendingReport(false);
      setIsFailedCopiedFilesReportModalOn(false);
    }
  };

  const FilesList = ({ files }: { files: TFileToCopy[] }) => {
    return files.map((file, index) => (
      <ListGroup.Item
        key={file.id || index}
        className="d-flex justify-content-between align-items-center"
      >
        <div>
          <strong>{file.name}</strong>
        </div>
        <span className="badge bg-danger">Failed</span>
      </ListGroup.Item>
    ));
  };

  return (
    <Modal
      backdropClassName="backdrop-failed-copied-files-report-modal"
      show={isFailedCopiedFilesReportModalOn}
      onHide={handleOnHide}
      size="lg"
      centered
      className="rounded"
      keyboard={false}
      style={{
        zIndex: 10000,
      }}
    >
      <Modal.Header closeButton>
        <Modal.Title>Failed File Copy Report</Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-4">
        <div className="mb-4">
          <h5 className="text-danger mb-3">
            <i className="fas fa-exclamation-triangle me-2"></i>
            Some files failed to copy
          </h5>
          <p className="text-muted">
            The following files could not be copied to your Google Drive. This
            might be due to permission issues, file size limits, or temporary
            Google Drive problems.
          </p>
        </div>

        {failedCopiedLessonFiles && failedCopiedLessonFiles.length > 0 && (
          <div className="mb-4">
            <h6 className="mb-3">
              Failed Files ({failedCopiedLessonFiles.length}):
            </h6>
            <ListGroup className="max-height-300 overflow-auto">
              <FilesList files={failedCopiedLessonFiles} />
            </ListGroup>
          </div>
        )}

        <div className="alert alert-info">
          <h6 className="alert-heading">
            <i className="fas fa-info-circle me-2"></i>
            What happens next?
          </h6>
          <p className="mb-0">
            Click "Send Report" to notify our support team about these failed
            files. We'll investigate the issue and help you get these files
            copied successfully.
          </p>
        </div>
      </Modal.Body>

      <Modal.Footer className="d-flex justify-content-between align-items-center">
        <Button
          variant="secondary"
          onClick={handleOnHide}
          disabled={isSendingReport}
        >
          Close
        </Button>
        <Button
          variant="primary"
          onClick={handleSendReport}
          disabled={
            isSendingReport ||
            !failedCopiedLessonFiles ||
            failedCopiedLessonFiles.length === 0
          }
        >
          {isSendingReport ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Sending Report...
            </>
          ) : (
            <>
              <i className="fas fa-paper-plane me-2"></i>
              Send Report
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default FailedCopiedFilesReportModal;
