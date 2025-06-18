import { ReactNode } from "react";
import { CloseButton } from "react-bootstrap";
import ToastBootstrap from "react-bootstrap/Toast";

interface IProps {
  onClose: () => void;
  show: boolean;
  title: string;
  headerDescription: string;
  children: ReactNode;
  animation: boolean;
  autoHide: "true" | "false";
}

const Toast = ({
  onClose = () => {},
  title,
  headerDescription,
  children,
  autoHide = "true",
}: IProps) => {
  return (
    <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 11 }}>
      <div
        id="liveToast"
        data-bs-autohide={autoHide}
        className="toast hide"
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
      >
        <div className="toast-header">
          <strong className="me-auto">{title}</strong>
          <small>{headerDescription}</small>
          <button
            onClick={onClose}
            type="button"
            id="toast-close-btn"
            className="btn-close"
            data-bs-dismiss="toast"
            aria-label="Close"
          ></button>
        </div>
        <div className="toast-body">{children}</div>
      </div>
    </div>
  );
};

export default Toast;
