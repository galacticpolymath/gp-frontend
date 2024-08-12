/* eslint-disable quotes */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable react/jsx-indent */
/* eslint-disable indent */
import { useContext, useState } from 'react';
import { CloseButton, Modal, ModalBody, ModalHeader } from 'react-bootstrap';
import { ModalContext } from '../../../providers/ModalProvider';
import { useUserEntry } from '../../../customHooks/useUserEntry';
import Button from '../../General/Button';
import CreateAccountWithGoogle from '../GoogleSignIn';
import { FcGoogle } from 'react-icons/fc';
import { CreateAccountInputSection, ErrorTxt } from '../formElements';

const SignUpModal = () => {
    const { _isCreateAccountModalDisplayed } = useContext(ModalContext);
    const { _createAccountForm, sendFormToServer, validateForm } = useUserEntry();
    const [errors, setErrors] = useState(new Map());
    const [createAccountForm, setCreateAccountForm] = _createAccountForm;
    const [isCreateAccountModalDisplayed, setIsCreateAccountModalDisplayed] = _isCreateAccountModalDisplayed;

    const handleOnHide = () => {
        setIsCreateAccountModalDisplayed(false);
    };

    const handleSubmitBtnClick = () => {
        if (createAccountForm.confirmPassword !== createAccountForm.password) {
            const errors = new Map([['password', 'Paswords must match'], ['confirmPassword', 'Passwords must match']]);
            setErrors(errors);
            return;
        }

        const url = window.location.href.includes('?') ? window.location.href.split('?')[0] : window.location.href;
        const errors = validateForm("createAccount");

        if (errors.size > 0) {
            alert("An error has occurred. Please check your inputs.");
            console.log('errors: ', errors);
            setErrors(errors);
            return;
        }

        sendFormToServer(
            'createAccount',
            'credentials',
            {
                createAccount: {
                    email: createAccountForm.email,
                    firstName: createAccountForm.firstName,
                    lastName: createAccountForm.lastName,
                    password: createAccountForm.password,
                },
                callbackUrl: `${url}/yo-there`,
            }
        );
    };

    const handleOnInputChange = event => {
        setCreateAccountForm(form => ({
            ...form,
            [event.target.name]: event.target.value,
        }));
    };

    return (
        <Modal
            show={isCreateAccountModalDisplayed}
            onHide={handleOnHide}
            dialogClassName='selected-gp-web-app-dialog m-0 d-flex justify-content-center align-items-center'
            contentClassName='create-account-ui-modal pt-2 box-shadow-login-ui-modal'
        >
            <ModalHeader className='d-flex flex-column'>
                <CloseButton onClick={handleOnHide} className='position-absolute top-0 end-0 me-1 mt-1' />
                <div className="d-flex justify-content-center align-items-center">
                    <img
                        src='imgs/gp_logo_gradient_transBG.png'
                        alt="gp_logo"
                        width={75}
                        height={75}
                    />
                </div>
                <h5 className="text-black text-center mt-2 my-0">
                    Sign up
                </h5>
            </ModalHeader>
            <ModalBody>
                <section className='d-flex justify-content-center align-items-center'>
                    <CreateAccountWithGoogle
                        callbackUrl={`${(typeof window !== 'undefined') ? window.location.origin : ''}/account?show_about_user_form=true`}
                        className='rounded p-2 w-50 d-flex flex-column flex-sm-row justify-content-center align-items-center border google-sign-in-btn'
                    >
                        <FcGoogle className="mx-2" size={31} />
                        <span className='d-inline-flex justify-content-center align-items-center h-100'>
                            Sign up with Google.
                        </span>
                    </CreateAccountWithGoogle>
                </section>
                <div className="d-flex justify-content-center mt-3 mb-2">
                    <div style={{ width: '48%' }} className='d-flex justify-content-center justify-content-sm-end align-items-center'>
                        <div style={{ height: '3px', width: '95%' }} className="bg-black rounded me-3 me-sm-2" />
                    </div>
                    <div style={{ width: '4%' }} className='d-flex justify-content-center align-items-center'>
                        <span className='text-black'>OR</span>
                    </div>
                    <div style={{ width: '48%' }} className='d-flex justify-content-center justify-content-sm-start align-items-center'>
                        <div style={{ height: '3px', width: '95%' }} className="bg-black rounded ms-3 ms-sm-2" />
                    </div>
                </div>
                <form className='mt-3 row d-flex justify-content-center align-items-center flex-column'>
                    <div className='row d-flex justify-content-center align-items-center'>
                        <div className="d-flex col-sm-6 flex-column ">
                            <label
                                className="d-block w-75 pb-1 fw-bold"
                                htmlFor="first-name"
                            >
                                First name:
                            </label>
                            <input
                                id="first-name"
                                placeholder="First Name"
                                style={{ borderRadius: '5px', fontSize: '18px', background: '#D6D6D6' }}
                                className="border-0 p-1 w-100 py-2"
                                autoFocus
                                name="firstName"
                                onChange={event => {
                                    handleOnInputChange(event);
                                }}
                            />
                            <section style={{ height: '29px' }}>
                                {errors.has('firstName') && <span>{errors.get('firstName')}</span>}
                            </section>
                        </div>
                        <CreateAccountInputSection
                            errors={errors}
                            errorsFieldName="lastName"
                            labelHtmlFor="last-name-id"
                            inputId="lastName"
                            inputName="lastName"
                            inputPlaceholder="Last Name"
                            labelTxt="Last Name"
                        />
                    </div>
                    <div className='row'>
                        <div className="d-flex flex-column position-relative col-sm-6">
                            <label
                                className="d-block w-75 pb-1 fw-bold"
                                htmlFor="email-input"
                            >
                                Email:
                            </label>
                            <input
                                id="email-input"
                                placeholder="Email"
                                style={{
                                    borderRadius: '5px',
                                    fontSize: '18px',
                                    border: errors.has('email') ? 'solid 1px red' : '',
                                    background: '#D6D6D6',
                                }}
                                className={`${errors.has('email') ? '' : 'border-0'} p-1 w-100 py-2`}
                                name="email"
                                onChange={event => {
                                    handleOnInputChange(event);
                                }}
                            />
                            <section style={{ height: '29px' }}>
                                {errors.has('email') && <ErrorTxt>{errors.get('email')}</ErrorTxt>}
                            </section>
                        </div>
                        <div className='col-6 d-none d-sm-block' />
                    </div>
                    <div className='row d-flex justify-content-center align-items-center'>
                        <div className="d-flex flex-column position-relative col-sm-6">
                            <label
                                className="d-block w-75 pb-1 fw-bold"
                                htmlFor="email-input"
                            >
                                Password:
                            </label>
                            <input
                                id="email-input"
                                placeholder="Enter Your Password"
                                style={{
                                    borderRadius: '5px',
                                    fontSize: '18px',
                                    background: '#D6D6D6',
                                    border: errors.has('password') ? 'solid 1px red' : '',
                                }}
                                className={`p-1 w-100 py-2 ${errors.has('password') ? 'text-danger' : 'border-0'}`}
                                name="password"
                                onChange={event => {
                                    handleOnInputChange(event);
                                }}
                            />
                            <section style={{ height: '29px' }}>
                                {errors.has('password') && (
                                    <ErrorTxt>
                                        {errors.get('password')}
                                    </ErrorTxt>
                                )}
                            </section>
                        </div>
                        <div className="d-flex flex-column position-relative col-sm-6">
                            <label
                                className="d-block w-100 pb-1 fw-bold"
                                htmlFor="email-input"
                            >
                                Confirm Password:
                            </label>
                            <input
                                id="email-input"
                                placeholder="Confirm Your Password"
                                style={{
                                    borderRadius: '5px',
                                    fontSize: '18px',
                                    background: '#D6D6D6',
                                    border: errors.has('password') ? 'solid 1px red' : '',
                                }}
                                className={`${(errors.size === 0) ? 'border-0' : ''} p-1 w-100 py-2`}
                                name="confirmPassword"
                                onChange={event => {
                                    handleOnInputChange(event);
                                }}
                            />
                            <section style={{ height: '29px' }}>
                                {errors.has('password') && (
                                    <ErrorTxt>
                                        {errors.get('password')}
                                    </ErrorTxt>
                                )}
                            </section>
                        </div>
                    </div>
                    <div className='d-flex justify-content-center align-items-center py-2 mt-3'>
                        <Button
                            handleOnClick={handleSubmitBtnClick}
                            classNameStr="bg-primary rounded border-0 py-2 w-50 text-white underline-on-hover"
                        >
                            SIGN UP
                        </Button>
                    </div>
                </form>
            </ModalBody>
        </Modal>
    );
};

export default SignUpModal;
