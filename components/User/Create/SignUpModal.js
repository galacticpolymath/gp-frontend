/* eslint-disable no-debugger */
/* eslint-disable no-console */
/* eslint-disable no-useless-escape */
/* eslint-disable quotes */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable react/jsx-indent */
/* eslint-disable indent */
import { useContext, useState } from 'react';
import { CloseButton, Modal, ModalBody, ModalFooter, ModalHeader, Spinner } from 'react-bootstrap';
import { ModalContext } from '../../../providers/ModalProvider';
import { useUserEntry } from '../../../customHooks/useUserEntry';
import Button from '../../General/Button';
import CreateAccountWithGoogle from '../GoogleSignIn';
import { FcGoogle } from 'react-icons/fc';
import { CustomInput, ErrorTxt, InputSection } from '../formElements';
import { signIn } from 'next-auth/react';
import { BiCheckbox, BiCheckboxChecked } from 'react-icons/bi';
import { INPUT_FOCUS_BLUE_CLASSNAME, USER_INPUT_BACKGROUND_COLOR } from '../../../globalVars';

const inputElementsFocusedDefault = new Map();

inputElementsFocusedDefault.set('email', false);
inputElementsFocusedDefault.set('firstName', false);
inputElementsFocusedDefault.set('lastName', false);

const SignUpModal = () => {
    const { _isCreateAccountModalDisplayed } = useContext(ModalContext);
    const { _createAccountForm, sendFormToServer, validateForm, _isUserTeacher } = useUserEntry();
    const [errors, setErrors] = useState(new Map());
    const didIsUserTeacherErr = errors.has('isUserTeacherErr');
    const [isLoadingSpinnerOn, setIsLoadingSpinnerOn] = useState(false);
    const [isGoogleLoadingSpinnerOn, setIsGoogleLoadingSpinnerOn] = useState(false);
    const [inputElementsFocused, setInputElementsFocused] = useState(inputElementsFocusedDefault);
    const [createAccountForm, setCreateAccountForm] = _createAccountForm;
    const [isUserTeacher, setIsUserTeacher] = _isUserTeacher;
    const [passwordInputType, setPasswordInputType] = useState('password');
    const [isCreateAccountModalDisplayed, setIsCreateAccountModalDisplayed] = _isCreateAccountModalDisplayed;
    /**
     * @typedef {"I solemnly swear I'm not a student just trying to get the answer key 🤨."} TUserIsTeacherTxt
     * @type {[TUserIsTeacherTxt, import('react').Dispatch<import('react').SetStateAction<TUserIsTeacherTxt>>]}
     */
    const [userIsTeacherTxt, setUserIsTeacherTxt] = useState("I solemnly swear I'm not a student just trying to get the answer key 🤨.");
    const callbackUrl = `${(typeof window !== 'undefined') ? window.location.origin : ''}/account?show_about_user_form=true`;

    const handlePasswordTxtShowBtnClick = () => {
        setPasswordInputType(state => state === 'password' ? 'text' : 'password');
    };

    const handleOnHide = () => {
        setIsCreateAccountModalDisplayed(false);
        setTimeout(() => {
            setIsUserTeacher(false);
            setErrors(new Map());
            setUserIsTeacherTxt("I solemnly swear I'm not a student just trying to get the answer key 🤨.");
        }, 200);
    };

    const handleOnFocus = event => {
        setInputElementsFocused(state => {
            const stateClone = structuredClone(state);

            stateClone.set(event.target.name, !stateClone.get(event.target.name));

            return stateClone;
        });
    };

    const handleOnBlur = event => {
        setInputElementsFocused(state => {
            const stateClone = structuredClone(state);

            stateClone.set(event.target.name, false);

            return stateClone;
        });
    };

    const handleIsUserATeacherCheckBoxClick = () => {
        setErrors(errors => {
            const errorsClone = structuredClone(errors);

            errorsClone.delete("isUserTeacherErr");

            return errorsClone;
        });
        setIsUserTeacher(state => !state);
    };

    const handleToAddToMailingListToggleBtnClick = () => {
        setCreateAccountForm(state => ({
            ...state,
            isOnMailingList: !state.isOnMailingList,
        }));
    };

    const handleSubmitCredentialsBtnClick = async () => {
        setIsLoadingSpinnerOn(true);

        const errors = await validateForm("credentials");

        if (errors.size > 0) {
            alert("An error has occurred. Please check your inputs.");
            setTimeout(() => {
                setErrors(errors);
                setIsLoadingSpinnerOn(false);
            });
            return;
        }

        const {
            email,
            firstName,
            lastName,
            password,
            isOnMailingList,
        } = createAccountForm;
        const signUpForm = {
            createAccount: {
                email,
                firstName,
                lastName,
                password,
                isOnMailingList,
            },
            callbackUrl: `${window.location.origin}/account?show_about_user_form=true`, 
        };

        sendFormToServer(
            'createAccount',
            'credentials',
            signUpForm,
        );
    };

    const handleOnInputChange = event => {
        const { name, value } = event.target;

        if (errors.has(name)) {
            const errorsClone = structuredClone(errors);

            errorsClone.delete(name);

            setErrors(errorsClone);
        }

        setCreateAccountForm(form => ({
            ...form,
            [name]: value,
        }));
    };

    const handleCreateAnAccountWithGoogleBtnClick = async (event) => {
        event.preventDefault();
        setIsGoogleLoadingSpinnerOn(true);

        const errors = await validateForm("google");

        if (errors.has("isUserTeacherErr")) {
            setTimeout(() => {
                alert("An error has occurred. Please check your inputs.");
                setErrors(errors);
                setIsGoogleLoadingSpinnerOn(false);
            }, 250);
            return;
        }

        if (!callbackUrl) {
            console.error('The callback url cannot be empty.');
            setIsGoogleLoadingSpinnerOn(false);
            return;
        }

        if (createAccountForm.isOnMailingList) {
            localStorage.setItem('isOnMailingList', JSON.stringify(true));
        } else {
            localStorage.removeItem('isOnMailingList');
        }

        signIn('google', { callbackUrl: callbackUrl });
    };

    return (
        <Modal
            show={isCreateAccountModalDisplayed}
            onHide={handleOnHide}
            onBackdropClick={handleOnHide}
            dialogClassName='selected-gp-web-app-dialog m-0 d-flex justify-content-center align-items-center'
            contentClassName='create-account-ui-modal pt-2 box-shadow-login-ui-modal'
        >
            <ModalHeader style={{ height: "60px" }} className='d-flex flex-column'>
                <CloseButton onClick={handleOnHide} className='position-absolute top-0 end-0 me-1 mt-1' />
                <img
                    className='position-absolute top-0 start-0 me-5 mt-1'
                    src='/imgs/gp_logo_gradient_transBG.png'
                    alt="gp_logo"
                    width={50}
                    height={50}
                    style={{
                        transform: 'translate(17%, 6%)',
                    }}
                />
                <h5 className="text-black text-center mt-2 my-0">
                    Sign up
                </h5>
            </ModalHeader>
            <ModalBody className='pt-1 px-1 pb-1'>
                <section className='my-3 mt-md-1 d-flex justify-content-center align-items-center'>
                    <CreateAccountWithGoogle
                        handleGoogleBtnClickCustom={handleCreateAnAccountWithGoogleBtnClick}
                        callbackUrl={`${(typeof window !== 'undefined') ? window.location.origin : ''}/account?show_about_user_form=true`}
                        className='rounded shadow position-relative w-75 p-4 p-sm-5 p-lg-4 w-50 d-flex flex-column flex-sm-row justify-content-center align-items-center border google-sign-in-btn'
                        style={{ maxWidth: '400px' }}

                    >
                        <FcGoogle
                            className="mx-2"
                            size={35}
                            style={{ opacity: isGoogleLoadingSpinnerOn ? 0 : 1 }}
                        />
                        {isGoogleLoadingSpinnerOn && (
                            <div className='center-absolutely'>
                                <Spinner size="lg" className='text-center' />
                            </div>
                        )}
                        <span style={{ fontSize: "24px" }} className='d-inline-flex justify-content-center align-items-center h-100'>
                            <span style={{ opacity: isGoogleLoadingSpinnerOn ? 0 : 1 }}>Sign up with Google.</span>
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
                <form className='mt-2 row d-flex justify-content-center align-items-center flex-column'>
                    <div className='row d-flex justify-content-center align-items-center'>
                        <div className="d-flex col-sm-6 flex-column">
                            <label
                                className={`d-block w-75 pb-1 fw-bold ${errors.has('firstName') ? 'text-danger' : ''}`}
                                htmlFor="first-name"
                            >
                                First name:
                            </label>
                            <input
                                id="first-name"
                                placeholder="First name"
                                style={{
                                    borderRadius: '5px',
                                    fontSize: '18px',
                                    border: errors.has('firstName') ? 'solid 1px red' : '',
                                    background: USER_INPUT_BACKGROUND_COLOR,
                                }}
                                className={`${inputElementsFocused.get('firstName') ? INPUT_FOCUS_BLUE_CLASSNAME : ''} ${errors.has('firstName') ? 'border-danger' : 'border-0 no-outline'} p-1 w-100 py-2`}
                                autoFocus
                                name="firstName"
                                onChange={event => {
                                    handleOnInputChange(event);
                                }}
                                onFocus={handleOnFocus}
                                onBlur={handleOnBlur}
                            />
                            <section style={{ height: '29px' }}>
                                {errors.has('firstName') && <ErrorTxt>{errors.get('firstName')}</ErrorTxt>}
                            </section>
                        </div>
                        <InputSection
                            errors={errors}
                            errorsFieldName="lastName"
                            labelHtmlFor="last-name-id"
                            inputId="lastName"
                            inputName="lastName"
                            inputStyle={{
                                borderRadius: '5px',
                                fontSize: '18px',
                                background: USER_INPUT_BACKGROUND_COLOR,
                            }}
                            labelClassName={`d-block w-100 pb-1 fw-bold ${errors.has('lastName') ? 'text-danger' : ''}`}
                            inputPlaceholder="Last name"
                            label="Last Name"
                            inputClassName={`${inputElementsFocused.get('lastName') ? INPUT_FOCUS_BLUE_CLASSNAME : 'no-outline'} ${errors.has('lastName') ? 'border-danger' : 'border-0'} p-1 w-100 py-2 no-outline`}
                            onFocus={handleOnFocus}
                            onBlur={handleOnBlur}
                            handleOnInputChange={event => {
                                handleOnInputChange(event);
                            }}
                        />
                    </div>
                    <div className='row mt-2'>
                        <div className="d-flex flex-column position-relative col-sm-6">
                            <label
                                className={`${errors.has('email') ? 'text-danger' : ''} d-block w-75 pb-1 fw-bold`}
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
                                    background: USER_INPUT_BACKGROUND_COLOR,
                                }}
                                onFocus={handleOnFocus}
                                onBlur={handleOnBlur}
                                className={`${errors.has('email') ? 'error-border' : 'border-0 no-outline'} ${inputElementsFocused.get('email') ? INPUT_FOCUS_BLUE_CLASSNAME : ''} ${errors.has('email') ? 'text-danger' : ''} p-1 w-100 py-2`}
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
                                className={`d-block w-75 pb-1 fw-bold ${errors.has('password') ? 'text-danger' : ''}`}
                                htmlFor="email-input"
                            >
                                Password:
                            </label>
                            <CustomInput
                                inputId="password"
                                isPasswordInput
                                handleShowPasswordTxtBtnClickCustom={handlePasswordTxtShowBtnClick}
                                inputType={passwordInputType}
                                errors={errors}
                                placeholder="Enter your password"
                                inputContainerCss="d-flex flex-column position-relative col-12 p-0"
                                inputContainerStyle={{ borderRadius: '5px' }}
                                inputStyle={{
                                    borderRadius: '5px',
                                    fontSize: '18px',
                                    background: '#E8F0FE',
                                    border: errors.has('password') ? 'solid 1px red' : '',
                                }}
                                inputClassName={`p-1 w-100 py-2 no-outline ${errors.has('password') ? 'text-danger' : 'border-0'}`}
                                inputName="password"
                                onChange={event => {
                                    handleOnInputChange(event);
                                }}
                                iconContainerStyle={{
                                    borderTopRightRadius: '5px',
                                    borderBottomRightRadius: '5px',
                                    zIndex: 1,
                                }}
                                noInputBorderColorOnBlur
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
                                className={`d-block w-75 pb-1 fw-bold ${errors.has('confirmPassword') ? 'text-danger' : ''}`}
                                htmlFor="email-input"
                            >
                                Confirm password:
                            </label>
                            <CustomInput
                                inputId="confirm-password-id"
                                isPasswordInput
                                handleShowPasswordTxtBtnClickCustom={handlePasswordTxtShowBtnClick}
                                inputType={passwordInputType}
                                placeholder="Enter your password"
                                inputContainerCss="d-flex flex-column position-relative col-12 p-0"
                                iconContainerStyle={{
                                    borderTopRightRadius: '5px',
                                    borderBottomRightRadius: '5px',
                                    zIndex: 1,
                                    width: "10%",
                                }}
                                inputContainerStyle={{
                                    borderRadius: '5px',
                                }}
                                inputStyle={{
                                    borderRadius: '5px',
                                    fontSize: '18px',
                                    background: '#E8F0FE',

                                    border: errors.has('confirmPassword') ? 'solid 1px red' : '',
                                }}
                                inputClassName={`p-1 w-100 py-2 no-outline ${errors.has('confirmPassword') ? 'text-danger' : 'border-0'}`}
                                inputName="confirmPassword"
                                onChange={event => {
                                    handleOnInputChange(event);
                                }}
                                noInputBorderColorOnBlur
                            />
                            <section style={{ height: '29px' }}>
                                {errors.has('confirmPassword') && (
                                    <ErrorTxt>
                                        {errors.get('confirmPassword')}
                                    </ErrorTxt>
                                )}
                            </section>
                        </div>
                    </div>
                    <div className='d-flex justify-content-center align-items-center py-1 mt-3 mb-2 row'>
                        <Button
                            handleOnClick={handleSubmitCredentialsBtnClick}
                            classNameStr="bg-primary rounded border-0 py-2 col-11 col-sm-10 col-lg-7 text-white underline-on-hover sign-up-btn"
                        >
                            {isLoadingSpinnerOn ?
                                <Spinner size="sm" className='text-white' />
                                :
                                (
                                    <span className="text-white">
                                        SIGN UP
                                    </span>
                                )
                            }
                        </Button>
                    </div>
                </form>
            </ModalBody>
            <ModalFooter className='position-relative px-0 pb-2 pt-1'>
                <section className='d-flex flex-sm-row w-100'>
                </section>
                <section className='p-0 row w-100 m-0'>
                    <div className='w-100 d-flex justify-content-center align-items-center'>
                        <div className='col-sm-6 col-11 d-flex justify-content-center align-items-center'>
                            <div style={{ width: '100%' }} className='d-flex create-account-toggle-btn-container'>
                                <div>
                                    {isUserTeacher ? (
                                        <BiCheckboxChecked
                                            onClick={handleIsUserATeacherCheckBoxClick}
                                            fontSize="21px"
                                        />
                                    )
                                        : (
                                            <BiCheckbox
                                                onClick={handleIsUserATeacherCheckBoxClick}
                                                color={didIsUserTeacherErr ? 'red' : ""}
                                                fontSize="21px"
                                            />
                                        )}
                                </div>
                                <label
                                    className={`${didIsUserTeacherErr ? 'text-danger' : ''}`}
                                    style={{
                                        fontSize: "18px",

                                    }}
                                >
                                    *{userIsTeacherTxt}
                                </label>
                            </div>
                        </div>
                    </div>
                </section>
                <section className='p-0 row w-100 m-0 mt-2 mb-1'>
                    <div className='w-100 d-flex justify-content-center align-items-center'>
                        <div className='col-sm-6 col-11 d-flex justify-content-center align-items-center'>
                            <div style={{ width: '100%' }} className='d-flex create-account-toggle-btn-container'>
                                <div>
                                    {createAccountForm.isOnMailingList ? (
                                        <BiCheckboxChecked
                                            onClick={handleToAddToMailingListToggleBtnClick}
                                            fontSize="21px"
                                        />
                                    )
                                        : (
                                            <BiCheckbox
                                                onClick={handleToAddToMailingListToggleBtnClick}
                                                fontSize="21px"
                                            />
                                        )}
                                </div>
                                <label
                                    style={{
                                        fontSize: "18px",
                                    }}
                                >
                                    *Opt in to our mailing list 📧.
                                </label>
                            </div>
                        </div>
                    </div>
                </section>
            </ModalFooter>
        </Modal>
    );
};

export default SignUpModal;
