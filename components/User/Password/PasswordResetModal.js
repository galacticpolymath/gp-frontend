/* eslint-disable no-console */
/* eslint-disable react/jsx-curly-brace-presence */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable react/jsx-indent */
/* eslint-disable indent */
import { useContext, useState } from 'react';
import { CloseButton, Modal, ModalBody, ModalFooter, ModalHeader, ModalTitle } from 'react-bootstrap';
import { MdOutlineMail } from 'react-icons/md';
import Button from '../../General/Button';
import { InputSection } from '../formElements';
import { defautlNotifyModalVal, ModalContext } from '../../../providers/ModalProvider';
import axios from 'axios';

const PasswordResetModal = () => {
    const { _isPasswordResetModalOn, _isLoginModalDisplayed, _customModalFooter, _notifyModal } = useContext(ModalContext);
    const [isPasswordResetModal, setIsPasswordResetModalOn] = _isPasswordResetModalOn;
    const [, setCustomModalFooter] = _customModalFooter;
    const [, setIsLoginModalDisplayed] = _isLoginModalDisplayed;
    const [, setNotifyModal] = _notifyModal;
    const [email, setEmail] = useState('');
    const [errors] = useState(new Map());

    const handleOnHide = () => {
        setIsPasswordResetModalOn(false);
    };

    const handleGoBackToLoginBtnClick = () => {
        setIsPasswordResetModalOn(false);
        setTimeout(() => {
            setIsLoginModalDisplayed(true);
        }, 300);
    };

    const closeNotifyModal = () => {
        setNotifyModal(state => ({ ...state, isDisplayed: false }));

        setTimeout(() => {
            setNotifyModal(defautlNotifyModalVal);
            setCustomModalFooter(null);
        }, 300);
    };

    const handleContinueBtnClick = async () => {
        try {
            const url = `${window.location.origin}/api/send-password-recover-email`;
            const response = await axios.post(url, { email });

            if (response.status !== 200) {
                throw new Error(`Received non 200 response from the server. From server: ${response.data}`);
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
                        handleOnClick={closeNotifyModal}
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
        } catch (error) {
            console.error('An error has occurred in sending the email to the target user: ', error);
        }
    };

    return (
        <Modal
            show={isPasswordResetModal}
            onHide={handleOnHide}
            dialogClassName='selected-gp-web-app-dialog m-0 d-flex justify-content-center align-items-center'
            contentClassName='login-ui-modal bg-white shadow-lg rounded pt-2 box-shadow-login-ui-modal'
        >
            <ModalHeader className='d-flex flex-column'>
                <CloseButton className='position-absolute top-0 end-0 me-2 mt-2 mb-3 text-grey' onClick={handleOnHide} />
                <div className="d-flex justify-content-center align-items-center">
                    <img
                        src={(typeof window === 'undefined') ? '' : `${window.location.origin}/imgs/gp_logo_gradient_transBG.png`}
                        alt="gp_logo"
                        width={75}
                        height={75}
                    />
                </div>
                <ModalTitle className="text-black mt-2 my-0 w-100 text-center">
                    Password Recover
                </ModalTitle>
            </ModalHeader>
            <ModalBody className='d-flex flex-column'>
                <h6 className='text-black text-start w-100'>
                    Tell us some information about your account.
                </h6>
                <form>
                    <InputSection
                        errors={errors}
                        errorsFieldName="email"
                        containerClassName="d-flex flex-column position-relative mt-1"
                        inputName="email"
                        inputId="email-id"
                        inputStyle={{ borderRadius: '5px', fontSize: '18px', background: '#D6D6D6', height: '35px' }}
                        label={
                            (
                                <div className='d-flex'>
                                    <div className='d-flex justify-content-center align-items-center'>
                                        <MdOutlineMail fontSize='27px' color="#D6D6D6" />
                                    </div>
                                    <span className='ms-1'>
                                        Enter your email
                                    </span>
                                </div>
                            )
                        }
                        labelClassName={`d-block pb-1 ${errors.has('email') ? 'text-danger' : ''}`}
                        inputAndLabelSectionClassName='d-flex flex-column'
                        inputClassName="px-1 pt-2 mt-1"
                        handleOnInputChange={event => {
                            setEmail(event.target.value);
                        }}

                    />
                    <Button
                        classNameStr='no-btn-styles w-100 bg-primary rounded py-2'
                        handleOnClick={handleContinueBtnClick}
                    >
                        <span className="text-white">Continue</span>
                    </Button>
                </form>
            </ModalBody>
            <ModalFooter className='d-flex justify-content-center align-items-center'>
                <Button
                    classNameStr='no-btn-styles w-100'
                    handleOnClick={handleGoBackToLoginBtnClick}
                >
                    <span className="text-primary underline-on-hover">Go Back To Login</span>
                </Button>
            </ModalFooter>
        </Modal>
    );
};

export default PasswordResetModal;