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

import Link from "next/link";
import { useState } from "react";
import { IoIosCloseCircle } from "react-icons/io";
import Button from "../General/Button";

const FEEDBACK_EMAIL = 'feedback@galacticpolymath.com';
const SIGN_UP_FOR_EMAIL_LINK = "https://45216c4d.sibforms.com/serve/MUIEABKhQZtQBEauhcYKU3l3n-hkpWQzrO5xzjvf6yI0XwqVvF1MuYlACX2EVtDFWcm1w1nY6lw181I_CUGs3cYjltIR-qTgWYRKLH-zF1Ef_NONTcKn5KiY3iLDyW1Klex1c_dKo2S66mUXo6codlinm0zDopzcmgkU3wW1Wyp-T1L61TZcGWlE49DKcYAszOJj6AKW3MTxs5Q0";

const SendFeedback = () => {
  const [willHide, setWillHide] = useState(false)

  const handleOnClick = () => {
    setWillHide(true) 
  }

  return (
        <div
            style={{ backgroundColor: "#EBD0FF" }}
            className={`w-100 sticky-top ${willHide ? "d-none" : "d-flex"}`}
        >
            <section className="w-25 d-flex justify-content-center align-items-center">
                <i className="bi bi-tools" />
            </section>
            <section className="w-50">
                <span>
                    This unit is under construction. Please send your thoughts to <Link href={`mailto:${FEEDBACK_EMAIL}`}>{FEEDBACK_EMAIL}</Link>! And be sure to <Link href={SIGN_UP_FOR_EMAIL_LINK}>sign up for emails</Link> to get notified when the final version is released.
                </span>
            </section>
            <section className="w-25 d-flex justify-content-center align-items-center">
                <Button classNameStr="no-btn-styles" handleOnClick={handleOnClick}>
                    <IoIosCloseCircle />
                </Button>
            </section>
        </div>
  );
};

export default SendFeedback;