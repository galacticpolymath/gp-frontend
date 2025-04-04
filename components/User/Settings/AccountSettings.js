/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable react/jsx-curly-brace-presence */
/* eslint-disable quotes */
/* eslint-disable no-debugger */
/* eslint-disable no-console */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable react/jsx-indent */
/* eslint-disable indent */
import {
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    ModalTitle,
    Spinner,
} from "react-bootstrap";
import { useContext, useRef, useState } from "react";
import {
    ModalContext,
} from "../../../providers/ModalProvider";
import { CustomCloseButton } from "../../../ModalsContainer";
import { IoMdClose } from "react-icons/io";
import CheckBox from "../../General/CheckBox";
import Button from "../../General/Button";
import { getIsParsable } from "../../../globalFns";
import {
    sendDeleteUserReq,
    updateUser,
} from "../../../apiServices/user/crudFns";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import CustomLink from "../../CustomLink";
import { CONTACT_SUPPORT_EMAIL } from "../../../globalVars";

const AccountSettings = () => {
    const { _isAccountSettingModalOn, _notifyModal } =
        useContext(ModalContext);
    const [isAccountSettingsModalDisplayed, setIsAccountSettingModalDisplayed] =
        _isAccountSettingModalOn;
    const [isSavingChangesSpinnerOn, setIsSavingChangesSpinnerOn] =
        useState(false);
    const [accountForm, setAccountForm] = useState({});
    const session = useSession();
    const { token } = session?.data ?? {};
    const { email, name } = session?.data?.user ?? {};
    const [, setErrors] = useState(new Map());
    const [didServerErrOccur, setDidServerErrOccur] = useState(false);
    const router = useRouter();
    const [, setNotifyModal] = _notifyModal;

    /**
     * @type {[import('../../../providers/UserProvider').TAboutUserForm, import('react').Dispatch<import('react').SetStateAction<import('../../../providers/UserProvider').TAboutUserForm>>]} */
    const modalBodyRef = useRef();

    const handleOnHide = () => {
        setIsAccountSettingModalDisplayed(false);
        setDidServerErrOccur(false);
    };

    const handleOnShow = () => {
        setIsAccountSettingModalDisplayed(true);

        const userAccountParsable = localStorage.getItem("userAccount");

        if (
            getIsParsable(userAccountParsable) &&
            (typeof JSON.parse(userAccountParsable) === "object")
        ) {
            const userAccount = JSON.parse(userAccountParsable);
            const firstName = userAccount?.name?.first ?? (name?.first ?? "");
            const lastName = userAccount?.name?.last ?? (name?.last ?? "");

            setAccountForm({
                firstName,
                lastName,
                isOnMailingList: userAccount?.isOnMailingList ?? false,
            });
        }

        const url = router.asPath;

        if (url.includes('?')) {
            const newUrl = url.split("?")[0];
            router.replace(newUrl);
        }
    };
    const handleDeleteAccountBtnClick = async () => {
        const willDeleteAccount = confirm(
            "Are you sure you want to delete your account? This operation is irreversible."
        );

        if (!willDeleteAccount) {
            return;
        }

        let didDeleteUserSuccessfully = false;

        if (willDeleteAccount && email) {
            const { wasSuccessful } = await sendDeleteUserReq(email, token);
            didDeleteUserSuccessfully = wasSuccessful;
        }

        if (didDeleteUserSuccessfully) {
            localStorage.removeItem("userAccount");
            localStorage.removeItem("isOnMailingList");
            signOut({ callbackUrl: "/?user-deleted=true" });
            return;
        }

        alert("An error has occurred. Please refresh the page and try again.");
    };
    const handleIsOnMailingListBtnToggle = () => {
        setAccountForm((state) => ({
            ...state,
            isOnMailingList: !state.isOnMailingList,
        }));
    };

    const handleSaveBtnClick = async () => {
        setIsSavingChangesSpinnerOn(true);
        setDidServerErrOccur(false);
        const errors = new Map();

        if (!accountForm.firstName) {
            errors.set("firstName", "Please enter your first name.");
        }
        if (!accountForm.lastName) {
            errors.set("lastName", "Please enter your last name.");
        }

        if (errors.size > 0) {
            setErrors(errors);
            setTimeout(() => {
                setIsSavingChangesSpinnerOn(false);
            }, 250);
            return;
        }
        const userAccountPrevVals = localStorage.getItem("userAccount")
            ? JSON.parse(localStorage.getItem("userAccount"))
            : {};
        const willSendEmailListingSubConfirmationEmailObj =
            userAccountPrevVals.isOnMailingList === accountForm.isOnMailingList
                ? {}
                : {
                    willSendEmailListingSubConfirmationEmail:
                        accountForm.isOnMailingList,
                };
        const updatedUser = {
            name: {
                first: accountForm.firstName,
                last: accountForm.lastName,
            },
        };
        let additionalReqBodyProps = accountForm.isOnMailingList
            ? {
                clientUrl: `${window.location.origin}/mailing-list-confirmation`,
            }
            : {};
        additionalReqBodyProps = {
            ...additionalReqBodyProps,
            ...willSendEmailListingSubConfirmationEmailObj,
        };
        const responseBody = await updateUser(
            { email: email },
            updatedUser,
            additionalReqBodyProps,
            token
        );

        if (!responseBody) {
            setTimeout(() => {
                setDidServerErrOccur(true);
                setIsSavingChangesSpinnerOn(false);
            }, 250);
            return;
        }

        setTimeout(() => {
            let bodyTxt = "";

            if (!userAccountPrevVals.isOnMailingList && accountForm.isOnMailingList) {
                bodyTxt =
                    "Please check your e-mail inbox to confirm your subscription with GP's mailing list.";
            } else if (
                userAccountPrevVals.isOnMailingList &&
                accountForm.isOnMailingList === false
            ) {
                bodyTxt =
                    "You've unscribed from GP's mailing list. You will no longer receive e-mails from us.";
            }

            handleOnHide();

            setNotifyModal({
                isDisplayed: true,
                bodyTxt,
                headerTxt: "Updates saved!",
                handleOnHide: () => {
                    session.update();
                },
            });
            setIsSavingChangesSpinnerOn(false);
        }, 250);
    };

    return (
        <Modal
            show={isAccountSettingsModalDisplayed}
            onHide={handleOnHide}
            onShow={handleOnShow}
            onBackdropClick={handleOnHide}
            dialogClassName="border-0 selected-gp-web-app-dialog m-0 d-flex justify-content-center align-items-center"
            contentClassName="account-settings-modal user-modal-color"
        >
            <CustomCloseButton
                className="no-btn-styles position-absolute top-0 end-0 me-sm-2 me-sm-3 mt-1"
                handleOnClick={handleOnHide}
                style={{ zIndex: 10000000 }}
            >
                <IoMdClose color="black" size={28} />
            </CustomCloseButton>
            <ModalHeader
                className="position-relative"
                style={{
                    height: "80px",
                }}
            >
                <ModalTitle
                    style={{ maxWidth: "1800px" }}
                    className="px-2 py-3 txt-color-for-aboutme-modal w-100"
                >
                    Account Settings
                </ModalTitle>
            </ModalHeader>
            <ModalBody
                style={{ maxWidth: "1800px" }}
                ref={modalBodyRef}
                className="about-me-modal-body w-100 d-flex flex-column pt-0"
            >
                <form className="h-100 px-1 px-sm-4 position-relative d-flex flex-column">
                    <section className="d-flex flex-column">
                        <section className="row d-flex flex-column flex-lg-row px-sm-3 mt-3">
                            <CheckBox
                                isChecked={accountForm.isOnMailingList}
                                handleOnClick={handleIsOnMailingListBtnToggle}
                                checkBoxContainerClassName="d-flex"
                                txtClassName="pointer underline-on-hover"
                            >
                                Subscribe to GP mailing list.
                            </CheckBox>
                            <span className="ps-3">
                                *If you{"'"}re subscribing, please check your email inbox for
                                the confirmation email.
                            </span>
                        </section>
                    </section>
                    <section style={{ height: "55%" }} className="mt-2 mt-sm-2">
                        <h5 style={{ height: "10%" }} className="text-danger px-sm-3">
                            <i>Danger Zone</i>
                        </h5>
                        <section
                            style={{ height: "90%" }}
                            className="rounded w-100 px-2 py-2 px-sm-3 py-sm-2"
                        >
                            <div
                                style={{ border: "solid 1.75px red" }}
                                className="rounded bottom-0 w-100 row d-flex flex-column py-2 h-100"
                            >
                                <section className="w-100 d-flex flex-sm-row flex-column justify-content-between">
                                    <section className="d-flex flex-column">
                                        <span style={{ fontWeight: 600 }}>Delete your account</span>
                                        <span style={{ textWrap: "break-word", maxWidth: "450px" }}>
                                            You will no longer have access to the {"teacher's"}{" "}
                                            materials of a unit if you are a teacher.
                                        </span>
                                    </section>
                                    <section className="d-flex justify-content-sm-center align-items-sm-center pt-sm-0 pt-2">
                                        <Button
                                            classNameStr="btn bg-danger no-btn-styles rounded px-2 py-2 px-sm-4 py-sm-2 mt-2 mt-sm-0"
                                            handleOnClick={handleDeleteAccountBtnClick}
                                        >
                                            Delete account
                                        </Button>
                                    </section>
                                </section>
                            </div>
                        </section>
                    </section>
                </form>
            </ModalBody>
            <ModalFooter className="px-4 d-flex flex-column justify-content-start align-items-start">
                <Button
                    defaultStyleObj={{
                        width: "110px",
                    }}
                    handleOnClick={handleSaveBtnClick}
                    classNameStr="btn bg-primary"
                >
                    {isSavingChangesSpinnerOn ? (
                        <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                        />
                    ) : (
                        "Save"
                    )}
                </Button>
                <div className="d-inline-block error-txt-container-account-settings text-break">
                    {didServerErrOccur && (
                        <>
                            <span style={{ fontSize: '1.2em' }} className="text-danger">*</span>
                            Failed to save changes. If this error persists, please email and
                            describe the problem at{" "}
                            <CustomLink
                                hrefStr={CONTACT_SUPPORT_EMAIL}
                                className="text-primary"
                            >
                                {CONTACT_SUPPORT_EMAIL}
                            </CustomLink>
                            .
                        </>
                    )}
                </div>
            </ModalFooter>
        </Modal>
    );
};

export default AccountSettings;
