/* eslint-disable react/jsx-curly-brace-presence */
/* eslint-disable quotes */
/* eslint-disable no-debugger */
/* eslint-disable no-console */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable react/jsx-indent */
/* eslint-disable indent */
import {
    Accordion,
    Modal,
    ModalBody,
    ModalTitle,
    useAccordionButton,
} from "react-bootstrap";
import { useContext, useEffect, useRef, useState } from "react";
import { ModalContext } from "../../../providers/ModalProvider";
import GradesOrYearsSelection from "./sections/GradesOrYearsSelection";
import { UserContext } from "../../../providers/UserProvider";
import CountrySection from "./sections/CountrySection";
import SubjectOption from "./sections/SubjectOption";
import SubmitAboutUserFormBtn from "./SubmitAboutUserFormBtn";
import { getAboutUserFormForClient } from "../../../pages/account";
import { CustomCloseButton } from "../../../ModalsContainer";
import { IoIosArrowDown, IoIosArrowUp, IoMdClose } from "react-icons/io";
import { BiCheckbox, BiCheckboxChecked } from "react-icons/bi";
import { ErrorTxt } from "../formElements";
import { useRouter } from "next/router";
import Link from "next/link";
import { TROUBLE_LOGGING_IN_LINK } from "../../../globalVars";
import CheckBox from "../../General/CheckBox";

const AccordionToggleBtn = ({
    children = <></>,
    btnClassName = "",
    eventKey,
    handleBtnClick,
}) => {
    const handleAccordionToggleBtnClick = useAccordionButton(
        eventKey,
        (event) => {
            event.preventDefault();

            if (typeof handleBtnClick === "function") {
                handleBtnClick();
            }
        }
    );

    return (
        <button
            type="button"
            onClick={handleAccordionToggleBtnClick}
            className={btnClassName}
        >
            {children}
        </button>
    );
};

const SUBJECTS_OPTIONS = [
    "science",
    "math",
    "english language arts",
    "social studies",
    "STEM",
    "other:",
    "other:",
];
const WHAT_BRINGS_YOU_TO_SITE_OPTS = [
    "interdisciplinary lessons",
    "lessons connected to research",
    "culturally responsive lessons",
    "free resources",
];

const AboutUserModal = () => {
    const { _isAboutMeFormModalDisplayed } = useContext(ModalContext);
    const { _aboutUserForm } = useContext(UserContext);
    const [isAboutMeFormModalDisplayed, setIsAboutMeFormModalDisplayed] =
        _isAboutMeFormModalDisplayed;
    const [textareaMaxHeight, setTextareaMaxHeight] = useState(0);
    const [countryNames, setCountryNames] = useState([]);
    const [errors, setErrors] = useState(new Map());
    const [, setIsInputFocused] = useState(false);
    const [wasBtnClicked, setWasBtnClicked] = useState(false);
    const router = useRouter();
    /**
     * @type {[import('../../../providers/UserProvider').TAboutUserForm, import('react').Dispatch<import('react').SetStateAction<import('../../../providers/UserProvider').TAboutUserForm>>]} */
    const [aboutUserForm, setAboutUserForm] = _aboutUserForm;
    const modalBodyRef = useRef();

    const handleIsTeacherConfirmationCheckBoxClick = () => {
        setAboutUserForm(state => ({
            ...state,
            isTeacherConfirmed: !state.isTeacherConfirmed
        }))
    }

    const handleFocusRelatedEvent = (isInputFocused) => () => {
        setIsInputFocused(isInputFocused);
    };

    const handleOnHide = () => {
        const userAccountStringified = localStorage.getItem("userAccount");

        if (userAccountStringified) {
            setTimeout(() => {
                // resetting reseting user account data
                /** @type {import('../../../providers/UserProvider').TUserAccount} */
                const userAccount = JSON.parse(userAccountStringified);
                setAboutUserForm(getAboutUserFormForClient(userAccount));
            }, 300);
        }

        setErrors(new Map());
        setIsAboutMeFormModalDisplayed(false);
    };

    const handleAreYouATeacherBtnClick = () => {
        setAboutUserForm((state) => ({ ...state, isTeacher: !state.isTeacher }));
    };

    const handleOnClassRoomSizeInputChange = (event) => {
        const num = Number.isInteger(+event.target.value)
            ? Number.parseInt(event.target.value)
            : 0;

        setErrors((state) => {
            const stateClone = structuredClone(state);

            stateClone.delete("classroomSize");

            return stateClone;
        });

        setAboutUserForm((state) => ({
            ...state,
            classroomSize: {
                ...state.classroomSize,
                num: num <= 0 ? 0 : event.target.value,
            },
        }));
    };
    const handleIsTeachingInputToggle = () => {
        setErrors((state) => {
            const stateClone = structuredClone(state);

            stateClone.delete("classroomSize");

            return stateClone;
        });

        setAboutUserForm((state) => ({
            ...state,
            classroomSize: {
                num: 0,
                isNotTeaching: !state.classroomSize.isNotTeaching,
            },
        }));
    };

    const handleWhatBringsYouToSiteInputChange = (event) => {
        const reasonsForSiteVisit =
            structuredClone(aboutUserForm.reasonsForSiteVisit) ?? new Map();

        if (event.target.name === "reason-for-visit-custom") {
            reasonsForSiteVisit.set(event.target.name, event.target.value);

            setAboutUserForm({
                ...aboutUserForm,
                reasonsForSiteVisit: reasonsForSiteVisit,
            });

            return;
        }

        if (reasonsForSiteVisit.has(event.target.name)) {
            reasonsForSiteVisit.delete(event.target.name);
        } else {
            reasonsForSiteVisit.set(event.target.name, event.target.value);
        }

        setAboutUserForm({
            ...aboutUserForm,
            reasonsForSiteVisit: reasonsForSiteVisit,
        });
    };

    const handleToggleTextareaDisability = () => {
        const reasonsForSiteVisit =
            structuredClone(aboutUserForm.reasonsForSiteVisit) ?? new Map();

        if (reasonsForSiteVisit.has("reason-for-visit-custom")) {
            reasonsForSiteVisit.delete("reason-for-visit-custom");

            setAboutUserForm({
                ...aboutUserForm,
                reasonsForSiteVisit: reasonsForSiteVisit,
            });

            return;
        }

        reasonsForSiteVisit.set("reason-for-visit-custom", "");

        setAboutUserForm({
            ...aboutUserForm,
            reasonsForSiteVisit: reasonsForSiteVisit,
        });
    };

    const handleOnInputChange = (event) => {
        if (errors.has(event.target.name)) {
            const errorsClone = structuredClone(errors);

            errorsClone.delete(event.target.name);

            setErrors(errorsClone);
        }

        setAboutUserForm((state) => ({
            ...state,
            [event.target.name]: event.target.value,
        }));
    };

    useEffect(() => {
        if (
            modalBodyRef?.current?.clientHeight &&
            isAboutMeFormModalDisplayed &&
            !textareaMaxHeight
        ) {
            const height = modalBodyRef.current.clientHeight * 0.27;
            setTextareaMaxHeight(height);
        }
    }, [isAboutMeFormModalDisplayed]);

    useEffect(() => {
        (async () => {
            try {
                const response = await fetch(
                    "https://restcountries.com/v3.1/all?fields=name,flags"
                );
                const responseBodyData = await response.json();

                if (responseBodyData?.length) {
                    const countryNamesReceived = responseBodyData.map(
                        (country) => country.name.common
                    );

                    countryNamesReceived.sort();

                    setCountryNames(countryNamesReceived);
                }
            } catch (error) {
                console.error("Failed to retrieve countries. Reason: ", error);
            }
        })();
    }, []);

    return (
        <Modal
            show={isAboutMeFormModalDisplayed}
            onHide={handleOnHide}
            onShow={() => {
                setTimeout(() => {
                    const url = router.asPath;
                    router.replace(url.split("?")[0]);
                }, 250);
            }}
            dialogClassName="border-0 selected-gp-web-app-dialog m-0 d-flex justify-content-center align-items-center"
            contentClassName="about-me-modal user-modal-color rounded-0"
        >
            <CustomCloseButton
                className="no-btn-styles position-absolute top-0 end-0 me-2"
                handleOnClick={handleOnHide}
            >
                <IoMdClose color="black" size={28} />
            </CustomCloseButton>
            <ModalTitle
                style={{ maxWidth: "1800px" }}
                className="px-3 txt-color-for-aboutme-modal w-100"
            >
                About Me
            </ModalTitle>
            <ModalBody
                style={{ maxWidth: "1800px" }}
                ref={modalBodyRef}
                className="about-me-modal-body w-100"
            >
                <form className="position-relative  h-100 w-100">
                    <section className="row d-flex flex-column flex-lg-row">
                        <section className="d-flex flex-column col-12 col-sm-8 col-lg-4">
                            <label
                                htmlFor="country-input"
                                className={`${errors.has("occupation") ? "text-danger" : ""}`}
                            >
                                *Occupation:
                            </label>
                            <input
                                name="occupation"
                                onChange={handleOnInputChange}
                                placeholder="What do you do?"
                                value={aboutUserForm?.occupation ?? ""}
                                onFocus={handleFocusRelatedEvent(true)}
                                onBlur={handleFocusRelatedEvent(false)}
                                style={{ maxWidth: "400px" }}
                                autoFocus={!aboutUserForm?.occupation}
                                className={`ms-2 ms-sm-0 aboutme-txt-input no-outline pt-1 ${errors.has("occupation") ? "text-danger border-danger" : ""
                                    }`}
                            />
                            <span
                                style={{ fontSize: "16px" }}
                                className="text-danger ms-2 ms-sm-0"
                            >
                                {errors.get("occupation") ?? ""}
                            </span>
                        </section>
                        <CountrySection
                            setIsInputFocused={setIsInputFocused}
                            countryNames={countryNames}
                            _errors={[errors, setErrors]}
                        />
                        <section className="d-flex flex-column col-12 col-sm-8 col-lg-2">
                            <label
                                htmlFor="zipCode-input"
                                className={`${errors.has("zipCode") ? "text-danger" : ""}`}
                                style={{
                                    opacity:
                                        aboutUserForm?.country?.toLowerCase() === "united states"
                                            ? 1
                                            : 0.3,
                                }}
                            >
                                *Zip Code:
                            </label>
                            <input
                                placeholder="Your zip code"
                                type="number"
                                name="zipCode"
                                id="zipCode-input"
                                disabled={
                                    aboutUserForm?.country?.toLowerCase() !== "united states"
                                }
                                value={aboutUserForm?.zipCode ?? ""}
                                onChange={handleOnInputChange}
                                style={{
                                    outline: "none",
                                    borderTop: "none",
                                    borderRight: "none",
                                    borderLeft: "none",
                                    borderBottom: errors.has("zipCode")
                                        ? "solid 1px red"
                                        : "solid 1px grey",
                                    opacity:
                                        aboutUserForm?.country?.toLowerCase() !== "united states"
                                            ? 0.3
                                            : 1,
                                }}
                                onFocus={handleFocusRelatedEvent(true)}
                                onBlur={handleFocusRelatedEvent(false)}
                                className={`aboutme-txt-input pt-1 ms-2 ms-sm-0 ${errors.has("zipCode") ? "border-danger text-danger" : ""
                                    }`}
                            />
                            <section style={{ height: "47px" }}>
                                <ErrorTxt>{errors.get("zipCode") ?? ""}</ErrorTxt>
                            </section>
                        </section>
                    </section>
                    <Accordion activeKey={aboutUserForm.isTeacher ? "0" : ""}>
                        <div
                            style={{
                                border: "3.5px solid #EEB7DA",
                                transition: "border .3s",
                            }}
                            className="px-3 py-2 rounded mt-0 mt-sm-3"
                        >
                            <div className="d-flex justify-content-between">
                                <section className="d-flex flex-column justify-content-center align-items-center w-100">
                                    <section className="d-flex col-12  flex-column">
                                        <h3>Help us to keep the content free for everyone!</h3>
                                        <span>
                                            <b>For access to teacher guides</b>, we need to know a bit
                                            more about who you are.
                                        </span>
                                    </section>
                                    <section className="col-12 px-lg3">
                                        <div
                                            style={{ borderBottom: "solid 1.7px lightgrey" }}
                                            className="d-flex col-12 position-relative"
                                        >
                                            <AccordionToggleBtn
                                                btnClassName="no-btn-styles"
                                                eventKey="0"
                                                handleBtnClick={handleAreYouATeacherBtnClick}
                                            >
                                                {aboutUserForm.isTeacher ? (
                                                    <BiCheckboxChecked fontSize="21px" />
                                                ) : (
                                                    <BiCheckbox fontSize="21px" />
                                                )}
                                            </AccordionToggleBtn>
                                            <span className="pt-1">I am a teacher.</span>
                                            {aboutUserForm.isTeacher ? (
                                                <IoIosArrowDown className="position-absolute end-0 bottom-0 mb-1" />
                                            ) : (
                                                <IoIosArrowUp className="position-absolute end-0 bottom-0 mb-1" />
                                            )}
                                        </div>
                                    </section>
                                </section>
                            </div>
                            <Accordion.Item
                                eventKey="0"
                                className="p-0 rounded-0 border-0 col-12 px-lg-4"
                            >
                                <Accordion.Body className="p-0 rounded-0">
                                    <section style={{ columnCount: 2 }} className="mt-3 mb-2 row">
                                        <GradesOrYearsSelection _errors={[errors, setErrors]} />
                                        <section className="d-flex flex-column col-12 col-lg-6 mt-2 mt-sm-0">
                                            <label style={{ lineHeight: "25px" }}>
                                                *How many students do you teach?
                                            </label>
                                            <input
                                                type={
                                                    aboutUserForm.classroomSize.isNotTeaching
                                                        ? "text"
                                                        : "number"
                                                }
                                                name="classroomSize"
                                                value={
                                                    aboutUserForm.classroomSize.isNotTeaching
                                                        ? "N/A"
                                                        : aboutUserForm?.classroomSize?.num == 0 ? "" : aboutUserForm?.classroomSize?.num
                                                }
                                                disabled={aboutUserForm.classroomSize.isNotTeaching}
                                                onChange={handleOnClassRoomSizeInputChange}
                                                style={{
                                                    maxWidth: "200px",
                                                    opacity: aboutUserForm.classroomSize.isNotTeaching
                                                        ? 0.3
                                                        : 1,
                                                }}
                                                className="aboutme-txt-input no-outline mt-1"
                                                onFocus={handleFocusRelatedEvent(true)}
                                                onBlur={handleFocusRelatedEvent(false)}
                                            />
                                            <section className="mt-1">
                                                <input
                                                    value={!!aboutUserForm?.classroomSize?.isNotTeaching}
                                                    checked={
                                                        !!aboutUserForm?.classroomSize?.isNotTeaching
                                                    }
                                                    type="checkbox"
                                                    name="isNotTeaching"
                                                    onChange={handleIsTeachingInputToggle}
                                                    onFocus={handleFocusRelatedEvent(true)}
                                                    onBlur={handleFocusRelatedEvent(false)}
                                                />
                                                <label
                                                    htmlFor="isNotTeaching"
                                                    className="fw-normal ms-1 pb-1"
                                                >
                                                    I{"'"}m not teaching.
                                                </label>
                                            </section>
                                            <section className="border-danger">
                                                <ErrorTxt>{errors.get("classroomSize") ?? ""}</ErrorTxt>
                                            </section>
                                        </section>
                                    </section>
                                    <section className="d-flex flex-column mt-4 mt-lg-3">
                                        <label>*Subject(s) Taught:</label>
                                        <section className="row d-flex flex-column flex-sm-row ps-2">
                                            <div className="pt-1 subjects-taught-container col-12 col-sm-6">
                                                {SUBJECTS_OPTIONS.slice(0, 5).map((subject, index) => (
                                                    <SubjectOption
                                                        key={index}
                                                        index={index}
                                                        _errors={[errors, setErrors]}
                                                        subjectFieldNameForMapTracker={`subject-${index}`}
                                                        customCssClassses={
                                                            index !== 0 ? "mt-2 mt-sm-0" : ""
                                                        }
                                                        subject={subject}
                                                    />
                                                ))}
                                            </div>
                                            <div className="pt-1 subjects-taught-container col-12 col-sm-6">
                                                {SUBJECTS_OPTIONS.slice(5).map((subject, index) => (
                                                    <SubjectOption
                                                        key={index}
                                                        index={index}
                                                        _errors={[errors, setErrors]}
                                                        subjectFieldNameForMapTracker={`other-subject-${index}`}
                                                        customCssClassses="mt-2 mt-sm-0"
                                                        subject={subject}
                                                    />
                                                ))}
                                            </div>
                                        </section>
                                        <section style={{ height: "28px" }}>
                                            <ErrorTxt>{errors.get("subjects") ?? ""}</ErrorTxt>
                                        </section>
                                    </section>
                                    <section>
                                        <CheckBox
                                            handleOnClick={handleIsTeacherConfirmationCheckBoxClick}
                                            isChecked={aboutUserForm.isTeacherConfirmed}
                                            txtClassName={`${!errors.has("isTeacherConfirmedErr") ? 'text-danger' : ''} pointer`}
                                            txtStyle={{ fontSize: "18px", }}
                                        >

                                        </CheckBox>
                                    </section>
                                </Accordion.Body>
                            </Accordion.Item>
                        </div>
                    </Accordion>
                    <section className="d-flex flex-column mt-2 mt-4 mt-lg-3">
                        <label htmlFor="reasonsForSiteVisit">
                            What brings you to our site?
                        </label>
                        <section className="d-flex flex-column flex-lg-row ps-2">
                            {WHAT_BRINGS_YOU_TO_SITE_OPTS.map((opt, index) => {
                                const name = `reason-for-visit-${index}`;
                                const isChecked =
                                    aboutUserForm.reasonsForSiteVisit &&
                                        aboutUserForm.reasonsForSiteVisit instanceof Map
                                        ? aboutUserForm.reasonsForSiteVisit.has(name)
                                        : false;

                                return (
                                    <div
                                        key={index}
                                        className={`d-flex mt-2 mt-sm-0 ${index === 0 ? "" : "ms-lg-3"
                                            }`}
                                    >
                                        <input
                                            type="checkbox"
                                            value={opt}
                                            name={name}
                                            onChange={handleWhatBringsYouToSiteInputChange}
                                            checked={isChecked}
                                        />
                                        <span className="capitalize ms-1">{opt}</span>
                                    </div>
                                );
                            })}
                        </section>
                        <section className="d-flex flex-column ps-2">
                            <section className="d-flex">
                                <input
                                    type="checkbox"
                                    name="subject"
                                    onChange={handleToggleTextareaDisability}
                                    checked={
                                        aboutUserForm.reasonsForSiteVisit &&
                                            aboutUserForm.reasonsForSiteVisit instanceof Map
                                            ? aboutUserForm.reasonsForSiteVisit.has(
                                                "reason-for-visit-custom"
                                            )
                                            : false
                                    }
                                />
                                <span className="ms-1">Other:</span>
                            </section>
                            <textarea
                                disabled={
                                    !(aboutUserForm.reasonsForSiteVisit &&
                                        aboutUserForm.reasonsForSiteVisit instanceof Map
                                        ? aboutUserForm.reasonsForSiteVisit.has(
                                            "reason-for-visit-custom"
                                        )
                                        : false)
                                }
                                id="reasonsForSiteVisit"
                                name="reason-for-visit-custom"
                                style={{
                                    outline: "none",
                                    opacity: !aboutUserForm?.reasonsForSiteVisit?.has(
                                        "reason-for-visit-custom"
                                    )
                                        ? 0.3
                                        : 1,
                                    height: "115px",
                                }}
                                className="rounded about-me-input-border about-user-textarea p-1 mt-2"
                                placeholder="Your response..."
                                value={
                                    aboutUserForm?.reasonsForSiteVisit?.has(
                                        "reason-for-visit-custom"
                                    )
                                        ? aboutUserForm.reasonsForSiteVisit.get(
                                            "reason-for-visit-custom"
                                        )
                                        : ""
                                }
                                onChange={handleWhatBringsYouToSiteInputChange}
                                onFocus={handleFocusRelatedEvent(true)}
                                onBlur={handleFocusRelatedEvent(false)}
                            />
                        </section>
                    </section>
                    <section className="d-flex justify-content-between">
                        <Link
                            href={TROUBLE_LOGGING_IN_LINK}
                            className="no-link-decoration underline-on-hover ms-1 mt-2 p-2 text-primary"
                        >
                            Trouble logging in?
                        </Link>
                        <SubmitAboutUserFormBtn
                            setErrors={setErrors}
                            countryNames={countryNames}
                            _wasBtnClicked={[wasBtnClicked, setWasBtnClicked]}
                        />
                    </section>
                </form>
            </ModalBody>
        </Modal>
    );
};

export default AboutUserModal;
