/* eslint-disable react/jsx-indent-props */
/* eslint-disable react/jsx-indent */
/* eslint-disable indent */
import { useContext, useState } from 'react';
import { CloseButton, Modal, ModalBody, ModalHeader } from 'react-bootstrap';
import { ModalContext } from '../../../providers/ModalProvider';
import { useUserEntry } from '../../../customHooks/useUserEntry';
import Button from '../../General/Button';
import CreateAccountWithGoogle from '../GoogleSignIn';
import ORTxtDivider from '../ORTxtDivider';

const CreateAccountModal = () => {
    const { _isCreateAccountModalDisplayed } = useContext(ModalContext);
    const { _createAccountForm, sendFormToServer } = useUserEntry();
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
                callbackUrl: url,
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
            contentClassName='create-account-ui-modal rounded pt-2 box-shadow-login-ui-modal'
        >
            <ModalHeader className='d-flex flex-column'>
                <CloseButton className='position-absolute top-0 end-0 me-1 mt-1' />
                <div className="d-flex justify-content-center align-items-center">
                    <img
                        src='imgs/gp_logo_gradient_transBG.png'
                        alt="gp_logo"
                        width={75}
                        height={75}
                    />
                </div>
                <h5 className="text-black text-center mt-2 my-0">
                    Create An Account
                </h5>
            </ModalHeader>
            <ModalBody>
                <section className='d-flex justify-content-center align-items-center'>
                    <CreateAccountWithGoogle
                        callbackUrl={`${(typeof window !== 'undefined') ? window.location.origin : ''}/account`}
                        txt="Create An Account With Google"
                        className='rounded p-2 w-50 d-flex justify-content-center align-items-center border'
                    />
                </section>
                <ORTxtDivider color="black" />
                <form className='row d-flex justify-content-center align-items-center flex-column'>
                    <div className='row d-flex justify-content-center align-items-center'>
                        <div className="d-flex col-6 flex-column ">
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
                                name="firstName"
                                onChange={event => {
                                    handleOnInputChange(event);
                                }}
                            />
                            <section style={{ height: '29px' }}>
                                {errors.has('firstName') && <span>{errors.get('firstName')}</span>}
                            </section>
                        </div>
                        <div className="d-flex flex-column col-6 position-relative">
                            <label
                                className="d-block w-100 pb-1 fw-bold"
                                htmlFor="last-name"
                            >
                                Last name:
                            </label>
                            <input
                                id="last-name"
                                placeholder="Last Name"
                                style={{ borderRadius: '5px', fontSize: '18px', background: '#D6D6D6' }}
                                className="border-0 p-1 w-100 py-2"
                                name="lastName"
                                onChange={event => {
                                    handleOnInputChange(event);
                                }}
                            />
                            <section style={{ height: '29px' }}>
                                {errors.has('lastName') && <span>{errors.get('lastName')}</span>}
                            </section>
                        </div>
                    </div>
                    <div className='row'>
                        <div className="d-flex flex-column position-relative col-6">
                            <label
                                className="d-block w-75 pb-1 fw-bold"
                                htmlFor="email-input"
                            >
                                Email:
                            </label>
                            <input
                                id="email-input"
                                placeholder="Email"
                                style={{ borderRadius: '5px', fontSize: '18px', background: '#D6D6D6' }}
                                className="border-0 p-1 w-100 py-2"
                                name="email"
                                onChange={event => {
                                    handleOnInputChange(event);
                                }}
                            />
                            <section style={{ height: '29px' }}>
                                {errors.has('email') && <span>{errors.get('email')}</span>}
                            </section>
                        </div>
                        <div className='col-6' />
                    </div>
                    <div className='row d-flex justify-content-center align-items-center'>
                        <div className="d-flex flex-column position-relative col-6">
                            <label
                                className="d-block w-75 pb-1 fw-bold"
                                htmlFor="email-input"
                            >
                                Password:
                            </label>
                            <input
                                id="email-input"
                                placeholder="Enter Your Password"
                                style={{ borderRadius: '5px', fontSize: '18px', background: '#D6D6D6' }}
                                className="border-0 p-1 w-100 py-2"
                                name="password"
                                onChange={event => {
                                    handleOnInputChange(event);
                                }}
                            />
                            <section style={{ height: '29px' }}>
                                {errors.has('password') && <span>{errors.get('password')}</span>}
                            </section>
                        </div>
                        <div className="d-flex flex-column position-relative col-6">
                            <label
                                className="d-block w-100 pb-1 fw-bold"
                                htmlFor="email-input"
                            >
                                Confirm Password:
                            </label>
                            <input
                                id="email-input"
                                placeholder="Confirm Your Password"
                                style={{ borderRadius: '5px', fontSize: '18px', background: '#D6D6D6' }}
                                className="border-0 p-1 w-100 py-2"
                                name="confirmPassword"
                                onChange={event => {
                                    handleOnInputChange(event);
                                }}
                            />
                            <section style={{ height: '29px' }}>
                                {errors.has('confirmPassword') && <span>{errors.get('confirmPassword')}</span>}
                            </section>
                        </div>
                    </div>
                    <div className='d-flex justify-content-center align-items-center py-2 mt-3'>
                        <Button
                            handleOnClick={handleSubmitBtnClick}
                            classNameStr="bg-primary rounded border-0 py-2 w-50 text-white underline-on-hover"
                        >
                            CREATE
                        </Button>
                    </div>
                </form>
            </ModalBody>
        </Modal>
    );
};

export default CreateAccountModal;
