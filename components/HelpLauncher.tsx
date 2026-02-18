import { useState } from "react";
import {
  Bug,
  MessageCircleQuestion,
  SendHorizontal,
  X,
} from "lucide-react";

const SUPPORT_EMAIL = "feedback@galacticpolymath.com";

type TInquiryType = "bug" | "question";

const SUBJECT_BY_INQUIRY_TYPE: Record<TInquiryType, string> = {
  bug: "[Bug] Issue on lesson page",
  question: "[Question] Need help with a lesson",
};

const LABEL_BY_INQUIRY_TYPE: Record<TInquiryType, string> = {
  bug: "Report a bug",
  question: "Ask a question",
};

const getInquiryTemplate = (inquiryType: TInquiryType) => {
  if (typeof window === "undefined") {
    return "";
  }

  const timestamp = new Date().toISOString();
  const pageUrl = window.location.href;
  const pageTitle = document.title || "Untitled page";
  const browser = window.navigator.userAgent;

  if (inquiryType === "bug") {
    return [
      "What happened?",
      "",
      "What did you expect to happen?",
      "",
      "Steps to reproduce:",
      "1.",
      "2.",
      "",
      "--- Auto-filled context ---",
      `Timestamp: ${timestamp}`,
      `Page title: ${pageTitle}`,
      `Page URL: ${pageUrl}`,
      `Browser: ${browser}`,
    ].join("\n");
  }

  return [
    "What do you need help with?",
    "",
    "--- Auto-filled context ---",
    `Timestamp: ${timestamp}`,
    `Page title: ${pageTitle}`,
    `Page URL: ${pageUrl}`,
    `Browser: ${browser}`,
  ].join("\n");
};

export default function HelpLauncher() {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredAction, setHoveredAction] = useState<TInquiryType | null>(null);

  const openEmailClient = (inquiryType: TInquiryType) => {
    if (typeof window === "undefined") {
      return;
    }

    const subject = SUBJECT_BY_INQUIRY_TYPE[inquiryType];
    const body = getInquiryTemplate(inquiryType);
    const mailtoHref = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    setIsOpen(false);
    window.open(mailtoHref, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      style={{
        position: "fixed",
        right: "10px",
        bottom: "12px",
        zIndex: 1200,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: "8px",
      }}
    >
      <section
        id="help-launcher-menu"
        aria-label="Help options"
        style={{
          width: "min(300px, calc(100vw - 32px))",
          backgroundColor: "#FFFFFF",
          border: "1px solid #D5D9E0",
          borderRadius: "12px",
          boxShadow: "0 8px 24px rgba(20, 20, 30, 0.18)",
          padding: "12px",
          transform: isOpen ? "translateY(0)" : "translateY(10px)",
          opacity: isOpen ? 1 : 0,
          maxHeight: isOpen ? "320px" : "0px",
          overflow: "hidden",
          pointerEvents: isOpen ? "auto" : "none",
          transition:
            "opacity 180ms ease, transform 220ms ease, max-height 220ms ease",
        }}
      >
        <div className="d-flex justify-content-between align-items-start mb-2">
          <p className="mb-0 fw-semibold">Get Support</p>
          <div className="d-flex align-items-center gap-1">
            <button
              type="button"
              aria-label="Email us"
              className="btn btn-sm border-0 d-inline-flex align-items-center justify-content-center"
              style={{ color: "#1f2937", width: "28px", height: "28px" }}
              onClick={() => openEmailClient("question")}
            >
              <SendHorizontal size={15} aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="Close help menu"
              className="btn btn-sm border-0 d-inline-flex align-items-center justify-content-center"
              style={{ color: "#1f2937", width: "28px", height: "28px" }}
              onClick={() => setIsOpen(false)}
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
        <p className="mb-3" style={{ fontSize: "0.9rem" }}>
          Let us know how we can help.
        </p>
        <div className="d-flex flex-column gap-2">
          {(["bug", "question"] as TInquiryType[]).map((inquiryType) => {
            const isHovered = hoveredAction === inquiryType;
            const actionIcon =
              inquiryType === "bug" ? (
                <Bug size={15} aria-hidden="true" />
              ) : (
                <MessageCircleQuestion size={15} aria-hidden="true" />
              );
            return (
              <button
                key={inquiryType}
                type="button"
                className="btn btn-sm text-start d-flex align-items-center justify-content-between"
                style={{
                  backgroundColor: isHovered ? "#f3f4f6" : "#FFFFFF",
                  color: "#111827",
                  border: "1px solid #374151",
                  transition: "background-color 140ms ease, box-shadow 140ms ease",
                  boxShadow: isHovered
                    ? "0 0 0 2px rgba(55, 65, 81, 0.12)"
                    : "none",
                }}
                onMouseEnter={() => setHoveredAction(inquiryType)}
                onMouseLeave={() => setHoveredAction(null)}
                onClick={() => openEmailClient(inquiryType)}
              >
                <span>{LABEL_BY_INQUIRY_TYPE[inquiryType]}</span>
                <span>{actionIcon}</span>
              </button>
            );
          })}
        </div>
      </section>
      <button
        type="button"
        className={`btn btn-dark ${isOpen ? "opacity-75" : ""}`}
        style={{
          width: "46px",
          height: "46px",
          borderRadius: "999px",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 0,
        }}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-controls="help-launcher-menu"
        aria-label="Open help options"
      >
        <MessageCircleQuestion size={20} aria-hidden="true" />
      </button>
    </div>
  );
}
