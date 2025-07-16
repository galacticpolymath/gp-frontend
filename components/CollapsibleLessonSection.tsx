/* eslint-disable quotes */
/* eslint-disable no-console */
/* eslint-disable react/jsx-max-props-per-line */
import React, {
  DetailedHTMLProps,
  HTMLAttributes,
  ReactElement,
  useMemo,
  useRef,
  useState,
} from "react";
import useLessonElementInView from "../customHooks/useLessonElementInView";
import Accordion from "./Accordion";
import CopyableTxt from "./CopyableTxt";
import { useRouter } from "next/router";
import { Collapse } from "react-bootstrap";
import { ISectionDots, TUseStateReturnVal } from "../types/global";
import { UNITS_URL_PATH } from "../shared/constants";

interface CollapsibleLessonSectionProps {
  SectionTitle?: string;
  SectionTitleClassName?: string;
  SectionTitleId?: string;
  className?: string;
  children: ReactElement;
  initiallyExpanded?: boolean;
  accordionId?: string;
  _sectionDots?: TUseStateReturnVal<ISectionDots>;
  isAvailLocsMoreThan1?: boolean;
  highlighted?: boolean;
  scrollToTranslateVal?: string;
  accordionChildrenClasses?: string;
  accordionStyleObj?: React.CSSProperties;
}

const CollapsibleLessonSection = ({
  SectionTitle = "",
  className = "",
  children,
  initiallyExpanded = false,
  accordionId,
  _sectionDots,
  SectionTitleId,
  accordionChildrenClasses = "",
  highlighted = false,
  scrollToTranslateVal = "translateY(-90px)",
  SectionTitleClassName = "",
  accordionStyleObj = {},
}: CollapsibleLessonSectionProps) => {
  const ref = useRef<HTMLHeadingElement>(null);
  const router = useRouter();
  const [isAccordionContentOpen, setIsAccordionContentOpen] =
    useState(initiallyExpanded);
  const { h2Id } = useLessonElementInView(_sectionDots, SectionTitle, ref);
  const _h2Id = SectionTitle.toLowerCase()
    .replace(/[0-9.]/g, "")
    .trim()
    .replace(/ /g, "-");
  const _accordionId = (accordionId || SectionTitle)
    .replace(/[\s!]/gi, "_")
    .toLowerCase();

  const copyLessonUrlWithAnchorTag = () => {
    let url = window.location.href;
    const currentSectionInView = router.asPath.split("#").at(-1);

    if (!(currentSectionInView === _accordionId)) {
      url = `${window.location.origin}/${UNITS_URL_PATH}/${router.query.loc}/${router.query.id}#${_h2Id}`;
    }

    navigator.clipboard.writeText(url);
  };

  const checkIfElementClickedWasClipboard = (
    parentElement: unknown
  ): boolean => {
    if (
      parentElement &&
      typeof parentElement === "object" &&
      "nodeName" in parentElement &&
      typeof parentElement.nodeName === "string" &&
      parentElement?.nodeName?.toLowerCase() === "body"
    ) {
      console.log("Clip board icon wasn't clicked...");
      return false;
    }

    if (
      parentElement &&
      typeof parentElement === "object" &&
      "id" in parentElement &&
      parentElement.id === "clipboardIconWrapper"
    ) {
      console.log("clip board icon was clicked...");
      return true;
    }

    return checkIfElementClickedWasClipboard(
      (parentElement as { parentElement: unknown }).parentElement
    );
  };

  const handleAccordionBtnClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    const wasClipboardIconClicked = checkIfElementClickedWasClipboard(
      event.target as unknown
    );

    if (wasClipboardIconClicked) {
      return;
    }

    setIsAccordionContentOpen(
      (isAccordionContentOpen) => !isAccordionContentOpen
    );
  };

  const cssSectionClassName = useMemo(
    () =>
      SectionTitle.split(" ")
        .filter((_, index) => index !== 0)
        .join("_"),
    []
  );
  const sectionTitleAttributes = {
    ref,
    id: SectionTitleId,
    className: `m-0 ${SectionTitleClassName}`,
    style: {
      width: "100%",
      overflowWrap: "break-word",
    },
  } as DetailedHTMLProps<
    HTMLAttributes<HTMLHeadingElement>,
    HTMLHeadingElement
  >;

  return (
    <Accordion
      setContentId={null}
      initiallyExpanded={initiallyExpanded}
      accordionChildrenClasses={accordionChildrenClasses}
      id={_accordionId}
      className={`bg-danger SectionHeading ${cssSectionClassName} ${SectionTitle.replace(
        /[\s!]/gi,
        "_"
      ).toLowerCase()} ${className} collapsibleLessonSection`}
      buttonClassName={`btn ${
        highlighted ? "" : "btn-primary-light"
      } w-100 text-left`}
      highlighted={highlighted}
      dataBsToggle={{} as any}
      ariaExpanded={
        typeof isAccordionContentOpen === "boolean"
          ? isAccordionContentOpen.toString()
          : "true"
      }
      handleOnClick={handleAccordionBtnClick}
      style={accordionStyleObj}
      button={(
        <div
          className={`SectionHeading ${SectionTitle.replace(
            /[\s!]/gi,
            "_"
          ).toLowerCase()} container position-relative text-black d-flex justify-content-between align-items-center py-1`}
        >
          <h2 {...sectionTitleAttributes}>{SectionTitle}</h2>
          <div className="d-flex">
            {isAccordionContentOpen ? (
              <i
                className="fs-3 bi-chevron-up"
                style={{ fontSize: "25px", display: "block" }}
              />
            ) : (
              <i
                className="fs-3 bi-chevron-down"
                style={{ fontSize: "25px", display: "block" }}
              />
            )}
            <div
              id="clipboardIconWrapper"
              className="ms-2 ms-sm-4 d-flex justify-content-center align-items-center"
            >
              <CopyableTxt
                implementLogicOnClick={copyLessonUrlWithAnchorTag}
                copyTxtIndicator="Copy link to section."
                txtCopiedIndicator="Link copied ✅!"
                copyTxtModalDefaultStyleObj={{
                  position: "fixed",
                  width: "140px",
                  backgroundColor: "#212529",
                  textAlign: "center",
                  zIndex: 100000,
                }}
                modalClassNameStr="position-fixed rounded p-0 m-0"
                parentClassName="pointer d-flex justify-content-center align-items-center"
                txtClassName="text-white w-100 h-100 d-inline-flex justify-content-center align-items-center p-0 m-0 text-transform-default"
                additiveYCoord={-25}
              >
                <i className="bi bi-clipboard" style={{ fontSize: "25px" }} />
              </CopyableTxt>
            </div>
          </div>
          <div
            id={h2Id}
            style={{ height: 30, width: 30, transform: scrollToTranslateVal }}
            className="position-absolute"
          />
          <div
            id={_h2Id}
            style={{ height: 30, width: 30, transform: scrollToTranslateVal }}
            className="position-absolute"
          />
        </div>
      )}
    >
      <Collapse in={isAccordionContentOpen}>
        {children}
      </Collapse>
    </Accordion>
  );
};

export default CollapsibleLessonSection;
