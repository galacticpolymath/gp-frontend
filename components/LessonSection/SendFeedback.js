/* eslint-disable react/jsx-indent-props */
/* eslint-disable react/jsx-indent */
/* eslint-disable no-debugger */
/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable curly */
/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable react/jsx-closing-bracket-location */
/* eslint-disable react/jsx-closing-tag-location */
/* eslint-disable no-unused-vars */
/* eslint-disable semi */
/* eslint-disable quotes */
/* eslint-disable no-console */

import { useState } from "react";
import { HiOutlineXMark } from "react-icons/hi2";
import Link from "next/link";
import Button from "../General/Button";

const FEEDBACK_EMAIL = 'feedback@galacticpolymath.com';
export const SIGN_UP_FOR_EMAIL_LINK = "https://45216c4d.sibforms.com/serve/MUIEABKhQZtQBEauhcYKU3l3n-hkpWQzrO5xzjvf6yI0XwqVvF1MuYlACX2EVtDFWcm1w1nY6lw181I_CUGs3cYjltIR-qTgWYRKLH-zF1Ef_NONTcKn5KiY3iLDyW1Klex1c_dKo2S66mUXo6codlinm0zDopzcmgkU3wW1Wyp-T1L61TZcGWlE49DKcYAszOJj6AKW3MTxs5Q0";

const CloseBtn = ({
  handleOnClick,
  dynamicStyles = {},
  classNameStr = "increase-size-by-3x",
}) => (
    <Button defaultStyleObj={{ ...dynamicStyles, height: "fit-content" }} classNameStr="no-btn-styles" handleOnClick={handleOnClick}>
        <HiOutlineXMark className={classNameStr} />
    </Button>
)

const SendFeedback = ({
  CloseBtnComp = CloseBtn,
  parentDivStyles = { position: "absolute", backgroundColor: "#EBD0FF", zIndex: 100, width: "100vw" },
  txtSectionStyle = { width: "95%" },
  parentDivClassName = 'w-100 py-2 px-3 d-flex',
  txt = (
    <>
        This unit is under construction. Please send your thoughts to <Link style={{ wordWrap: "break-word" }} className="no-link-decoration text-decoration-underline" href={`mailto:${FEEDBACK_EMAIL}`}>{FEEDBACK_EMAIL}</Link>! And be sure to <Link style={{ wordWrap: "break-word" }} className="no-link-decoration text-decoration-underline" href={SIGN_UP_FOR_EMAIL_LINK}>sign up for emails</Link> to get notified when the final version is released.
    </>
  ),
  IconSectionForTxtDesktop = (
        <section style={{ width: "2.5%" }} className="d-none d-sm-flex pt-3 pt-sm-0 justify-content-sm-center align-items-sm-center">
            <i style={{ height: "fit-content" }} className="bi bi-tools increase-size-by-2x" />,
        </section>
  ),
  IconForTxtMobile = <i style={{ height: "fit-content" }} className="bi bi-tools d-inline d-sm-none scissor-icon" />,
}) => {
  const [willHide, setWillHide] = useState(false)

  const handleOnClick = () => {
    setWillHide(true)
  }

  return (
        <div
            style={{ ...parentDivStyles, display: willHide ? "none" : "flex" }}
        >
            {CloseBtnComp && <CloseBtnComp classNameStr="d-sm-none" dynamicStyles={{ position: "absolute", top: "-5px", left: "5px", fontSize: "28px" }} handleOnClick={handleOnClick} />}
            <div className={parentDivClassName}>
                {IconSectionForTxtDesktop}
                <section className="px-sm-3 pt-4 pt-sm-0" style={txtSectionStyle}>
                    <div>
                        {IconForTxtMobile}
                        <span className="ps-2 ps-sm-0 send-feedback-txt">
                            {txt}
                        </span>
                    </div>
                </section>
                {CloseBtnComp && (
                    <section style={{ width: "2.5%" }} className="d-none d-sm-flex pt-3 pt-sm-0 justify-content-sm-center align-items-sm-center">
                        <CloseBtnComp handleOnClick={handleOnClick} />
                    </section>
                )}
            </div>
        </div>
  );
};

export default SendFeedback;