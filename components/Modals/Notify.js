/* eslint-disable no-console */
/* eslint-disable react/jsx-indent */
/* eslint-disable quotes */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable indent */
import { useContext, useEffect } from "react";
import { Button, Modal } from "react-bootstrap";
import { ModalContext, defautlNotifyModalVal } from "../../providers/ModalProvider";
import { useRouter } from "next/router";

export const CustomNotifyModalFooter = ({
    footerClassName = 'd-flex justify-content-center',
    closeNotifyModal,
    customBtnTxt,
    handleCustomBtnClick,
}) => {
    return (
        <Modal.Footer className={footerClassName}>
            <Button
                onClick={closeNotifyModal}
                style={{
                    width: '120px',
                    backgroundColor: '#898F9C',
                }}
                className="border"
            >
                <span className='text-white'>
                    Close
                </span>
            </Button>
            <Button
                onClick={handleCustomBtnClick}
                backgroundColor='#007BFF'
            >
                <span className='text-white'>
                    {customBtnTxt}
                </span>
            </Button>
        </Modal.Footer>
    );
};

const Notify = () => {
    const { _notifyModal, _customModalFooter } = useContext(ModalContext);
    const router = useRouter();
    /** @type {[JSX.Element | null]} */
    const [customModalFooter] = _customModalFooter;
    const [notifyModal, setNotifyModal] = _notifyModal;
    const { bodyTxt, headerTxt, handleOnHide, bodyElements } = notifyModal;

    const closeModal = () => {
        if (typeof handleOnHide === 'function') {
            handleOnHide();
        }

        setNotifyModal(state => ({ ...state, isDisplayed: false }));

        setTimeout(() => {
            setNotifyModal(defautlNotifyModalVal);
        }, 300);
    };

    useEffect(() => {
        let paramsStr = window.location.search.replace(/\?/, '');
        const params = paramsStr.split('=');

        console.log('params, yo there meng: ', params);

        if ((params[0] === 'signin-err-type') && (params[1] === 'duplicate-user-try-google')) {
            setNotifyModal({
                headerTxt: "ERROR! Couldn't create account.",
                bodyTxt: "This account already exist. Try signing in with Google instead.",
                isDisplayed: true,
                handleOnHide: () => {
                    const url = router.asPath;
                    router.replace(url.split("?")[0]);
                },
            });
        } else if ((params[0] === 'signin-err-type') && (params[1] === 'duplicate-user-try-creds')) {
            setNotifyModal({
                headerTxt: "ERROR! Couldn't create account.",
                bodyTxt: "This account already exist. Try signing in with your email and password instead.",
                isDisplayed: true,
                handleOnHide: () => {
                    const url = router.asPath;
                    router.replace(url.split("?")[0]);
                },
            });
        } else if (params[0] === 'signin-err-type' || params[0] === 'user-creation-err') {
            setNotifyModal({
                isDisplayed: true,
                headerTxt: 'ERROR! Unable sign in or create your account.',
                bodyTxt: 'Contact support if this error persists.',
                handleOnHide: () => {
                    const url = router.asPath;
                    router.replace(url.split("?")[0]);
                },
            });
        } else if (params[0] === 'user-account-creation-err-type' && params[1] === 'duplicate-user-try-google') {
            setNotifyModal({
                isDisplayed: true,
                headerTxt: 'ERROR! Unable to create your account.',
                bodyTxt: 'This email already exist. Try signing up with Google instead.',
                handleOnHide: () => {
                    const url = router.asPath;
                    router.replace(url.split("?")[0]);
                },
            });
        } else if (params[0] === 'user-account-creation-err-type' && params[1] === 'duplicate-user-try-creds') {
            setNotifyModal({
                isDisplayed: true,
                headerTxt: 'ERROR! Unable to create your account.',
                bodyTxt: 'This email already exist. Try signing up using an email and password instead.',
                handleOnHide: () => {
                    const url = router.asPath;
                    router.replace(url.split("?")[0]);
                },
            });
        } else if ((params[0] === 'user-deleted') && (params[1] === 'true')) {
            setNotifyModal({
                isDisplayed: true,
                headerTxt: 'Success!',
                bodyTxt: 'Your account was successfully deleted. Fairwell 👋! We hope to see you again .',
                handleOnHide: () => {
                    const url = router.asPath;
                    router.replace(url.split("?")[0]);
                },
            });
        }
    }, [router.asPath]);

    return (
        <Modal
            size="md"
            show={notifyModal.isDisplayed}
            onHide={closeModal}
            aria-labelledby="example-modal-sizes-title-sm"
        >
            <Modal.Header>
                <Modal.Title id="example-modal-sizes-title-sm" className="text-center w-100">
                    {headerTxt}
                </Modal.Title>
            </Modal.Header>
            {bodyTxt && (
                <Modal.Body className="text-center notify-modal-body">
                    {bodyTxt}
                </Modal.Body>
            )}
            {bodyElements && (
                <Modal.Body className="text-center notify-modal-body">
                    {bodyElements}
                </Modal.Body>
            )}
            {customModalFooter ?? (
                <Modal.Footer>
                    <Button onClick={closeModal} className="px-3 py-1">
                        CLOSE
                    </Button>
                </Modal.Footer>
            )}
        </Modal>
    );
};

export default Notify;