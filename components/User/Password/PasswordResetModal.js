 
 
 
 
 
import { useContext, useEffect, useState } from 'react';
import { CloseButton, Modal, ModalBody, ModalFooter, ModalHeader } from 'react-bootstrap';
import { MdOutlineMail } from 'react-icons/md';
import Button from '../../General/Button';
import { CustomInput } from '../formElements';
import { defautlNotifyModalVal, ModalContext } from '../../../providers/ModalProvider';
import axios from 'axios';
import { getTargetKeyValFromUrl, resetUrl, validateEmail } from '../../../globalFns';
import { useRouter } from 'next/router';
import { CustomError } from '../../../backend/utils/errors';
import CustomLink from '../../CustomLink';
import { CONTACT_SUPPORT_EMAIL } from '../../../globalVars';

const PasswordResetModal = () => {
    const { _isPasswordResetModalOn, _isLoginModalDisplayed, _customModalFooter, _notifyModal } = useContext(ModalContext);
    const [isPasswordResetModal, setIsPasswordResetModalOn] = _isPasswordResetModalOn;
    const [, setCustomModalFooter] = _customModalFooter;
    const [, setIsLoginModalDisplayed] = _isLoginModalDisplayed;
    const [, setNotifyModal] = _notifyModal;
    const [email, setEmail] = useState('');
    const [isLoadingSpinnerOn, setIsLoadingSpinner] = useState(false);
    const [errors, setErrors] = useState(new Map());
    const router = useRouter();

    const handleOnHide = () => {
        const url = router.asPath;
        router.replace(url.split('?')[0]);
        setIsLoadingSpinner(false);
        setIsPasswordResetModalOn(false);
    };

    const handleGoBackToLoginBtnClick = () => {
        setIsLoadingSpinner(false);

        if (getTargetKeyValFromUrl(router, 'is_password_recover_modal_on')) {
            resetUrl(router);
        }

        setIsPasswordResetModalOn(false);
        setTimeout(() => {
            setIsLoginModalDisplayed(true);
        }, 300);
    };

    const closeNotifyModal = () => {
        if (getTargetKeyValFromUrl(router, 'is_password_recover_modal_on')) {
            resetUrl(router);
        }

        setNotifyModal(state => ({ ...state, isDisplayed: false }));

        setTimeout(() => {
            setNotifyModal(defautlNotifyModalVal);
            setCustomModalFooter(null);
        }, 300);
    };

    const handleStartOverBtnClick = () => {
        setNotifyModal(state => ({ ...state, isDisplayed: false }));

        setTimeout(() => {
            setIsPasswordResetModalOn(true);
            setNotifyModal(defautlNotifyModalVal);
            setCustomModalFooter(null);
        }, 300);
    };

    const handleContinueBtnClick = async event => {
        try {
            event.preventDefault();

            setIsLoadingSpinner(true);
            setErrors(new Map());
            const isEmailValid = !!validateEmail(email);
            const errorsClone = structuredClone(errors);

            if (!isEmailValid) {
                errorsClone.set('email', 'Email must be in a valid format.');
                setErrors(errorsClone);
                return;
            }

            const url = `${window.location.origin}/api/send-password-recover-email`;
            const response = await axios.post(url, { email, clientOrigin: window.location.origin }, {
                timeout: 13_000,
            });

            if (response.status !== 200) {
                throw new CustomError(`Server error: ${response.data}`);
            }

            setCustomModalFooter(
                <Modal.Footer className='d-flex justify-content-center'>
                    <Button
                        handleOnClick={closeNotifyModal}
                        defaultStyleObj={{
                            width: '120px',
                        }}
                        classNameStr="px-3 py-1 no-btn-styles rounded"
                        backgroundColor='#6C757D'
                    >
                        <span className='text-white'>
                            Close
                        </span>
                    </Button>
                    <Button
                        handleOnClick={handleStartOverBtnClick}
                        defaultStyleObj={{
                            width: '120px',
                        }}
                        classNameStr="px-3 py-1 no-btn-styles rounded"
                        backgroundColor='#007BFF'
                    >
                        <span className='text-white'>
                            Start Over
                        </span>
                    </Button>
                </Modal.Footer>
            );

            setIsPasswordResetModalOn(false);

            setTimeout(() => {
                setNotifyModal({
                    isDisplayed: true,
                    headerTxt: 'Email Sent!',
                    bodyTxt: 'Please check your email inbox. If you have a account with us, you will receive a reset password link. Click on it to reset your password.',
                    handleOnHide: closeNotifyModal,
                });
            }, 300);

            setIsPasswordResetModalOn(false);

            if (getTargetKeyValFromUrl(router, 'is_password_recover_modal_on')) {
                resetUrl(router);
            }
        } catch (error) {
            setNotifyModal({
                isDisplayed: true,
                headerTxt: error?.message ? 'SERVER ERROR. Please refresh the page and try again.' : 'Unable to send password link. Please refresh the page and try again.',
                bodyElements: (
                    <>
                        If this error persists, please contact <CustomLink className='text-primary' hrefStr={CONTACT_SUPPORT_EMAIL}>support</CustomLink>.
                    </>
                ),
                handleOnHide: closeNotifyModal,
            });

            console.error('An error has occurred in sending the email to the target user: ', error);
        } finally {
            setIsLoadingSpinner(false);
        }
    };

    useEffect(() => {
        const isPasswordRecoverModalOnVarInUrl = router ? !!getTargetKeyValFromUrl(router, 'is_password_recover_modal_on') : false;

        if (isPasswordRecoverModalOnVarInUrl) {
            setIsPasswordResetModalOn(true);
        }
    }, [router, router.asPath, setIsPasswordResetModalOn]);

    return (
        <Modal
            show={isPasswordResetModal}
            onHide={handleOnHide}
            onShow={() => {
                const url = router.asPath;

                if (url.includes('?')) {
                    setTimeout(() => {
                        router.replace(url.split('?')[0]);
                    }, 300);
                }
            }}
            dialogClassName='selected-gp-web-app-dialog login-modal-dialog m-0 d-flex justify-content-center align-items-center'
            contentClassName='login-ui-modal login-ui-modal--refresh password-recovery-modal box-shadow-login-ui-modal'
        >
            <ModalHeader className='login-modal-header border-0'>
                <CloseButton className='position-absolute top-0 end-0 me-2 mt-2 mb-3 text-grey login-modal-close-btn' onClick={handleOnHide} />
                <div className="login-modal-brand">
                    <img
                        className="login-modal-logo"
                        src='/GP_bubbleLogo300px.png'
                        alt="gp_logo"
                        width={48}
                        height={48}
                    />
                    <div>
                        <h5 className="login-modal-title">Password recovery</h5>
                        <p className="login-modal-subtitle">Enter your account email and we&apos;ll send reset instructions.</p>
                    </div>
                </div>
            </ModalHeader>
            <ModalBody className='d-flex flex-column login-modal-body pt-1'>
                <form>
                    <div className="login-modal-field-group mt-1">
                        <label className="login-modal-label" htmlFor="email-id">Email</label>
                        <div className="login-modal-input-row position-relative">
                            <span className="login-modal-input-icon" aria-hidden="true">
                                <MdOutlineMail
                                    fontSize="20px"
                                    color={errors.has('email') ? '#ff6b6b' : '#7a8ec2'}
                                />
                            </span>
                            <CustomInput
                                inputContainerCss={`no-outline position-relative rounded w-100 login-modal-input-container ${errors.has('email') ? 'border-red' : ''}`}
                                inputName="email"
                                inputId="email-id"
                                inputType="email"
                                placeholder="you@example.com"
                                inputClassName={`px-1 py-2 position-relative no-outline border-0 rounded bg-transparent w-100 ${errors.has('email') ? 'text-danger' : ''}`}
                                onChange={event => {
                                    setErrors(new Map());
                                    setEmail(event.target.value);
                                }}
                                onKeyDown={event => {
                                    if (event.key === 'Enter') {
                                        event.preventDefault();
                                    }
                                }}
                            />
                        </div>
                        <span className="login-modal-error">{errors.get('email') ?? ''}</span>
                    </div>
                    <Button
                        classNameStr='no-btn-styles w-100 login-modal-submit-btn rounded py-2 mt-2'
                        handleOnClick={handleContinueBtnClick}
                    >
                        {isLoadingSpinnerOn
                            ?
                            (
                                <div
                                    className="spinner-border spinner-border-sm text-light"
                                    role="status"
                                >
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            )
                            :
                            <span className="text-white">Send reset link</span>
                        }
                    </Button>
                </form>
            </ModalBody>
            <ModalFooter className='login-modal-footer d-flex justify-content-center align-items-center'>
                <Button
                    classNameStr='no-btn-styles w-100'
                    handleOnClick={handleGoBackToLoginBtnClick}
                >
                    <span className="login-modal-link">Go back to login</span>
                </Button>
            </ModalFooter>
        </Modal>
    );
};

export default PasswordResetModal;
