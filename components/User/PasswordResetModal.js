/* eslint-disable react/jsx-curly-brace-presence */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable react/jsx-indent */
/* eslint-disable indent */
import { useContext, useState } from 'react';
import { CloseButton, Modal, ModalBody, ModalHeader, ModalTitle } from 'react-bootstrap';
import { ModalContext } from '../../providers/ModalProvider';
import { InputSection } from './formElements';
import { MdOutlineMail } from 'react-icons/md';

const PasswordResetModal = () => {
    const { _isPasswordResetModalOn } = useContext(ModalContext);
    const [isPasswordResetModal, setIsPasswordResetModalOn] = _isPasswordResetModalOn;
    const [errors, setErrors] = useState(new Map());

    const handleOnHide = () => {
        setIsPasswordResetModalOn(false);
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
                <InputSection
                    errors={errors}
                    errorsFieldName="email"
                    containerClassName="d-flex flex-column position-relative"
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
                    labelClassName={`d-block pb-1 ${errors.has('lastName') ? 'text-danger' : ''}`}
                    inputAndLabelSectionClassName='d-flex flex-column'
                    inputClassName="px-1 py-2"
                />
            </ModalBody>
            {/* <InputSection /> */}
        </Modal>
    );
};

export default PasswordResetModal;