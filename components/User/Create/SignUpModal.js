 
 
 
 
 
 
import { useContext, useState } from 'react';
import { CloseButton, Modal, ModalBody, ModalHeader, Spinner } from 'react-bootstrap';
import { ModalContext } from '../../../providers/ModalProvider';
import { useUserEntry } from '../../../customHooks/useUserEntry';
import Button from '../../General/Button';
import CreateAccountWithGoogle from '../GoogleSignIn';
import { FcGoogle } from 'react-icons/fc';
import { CustomInput } from '../formElements';
import { signIn } from 'next-auth/react';
import { BiCheckbox, BiCheckboxChecked } from 'react-icons/bi';

export const FONT_SIZE_CHECKBOX = '28px';

const SignUpModal = () => {
    const { _isCreateAccountModalDisplayed } = useContext(ModalContext);
    const { _createAccountForm, sendFormToServer, validateForm, _isUserTeacher } = useUserEntry();
    const [errors, setErrors] = useState(new Map());
    const [isLoadingSpinnerOn, setIsLoadingSpinnerOn] = useState(false);
    const [isGoogleLoadingSpinnerOn, setIsGoogleLoadingSpinnerOn] = useState(false);
    const [createAccountForm, setCreateAccountForm] = _createAccountForm;
    const [, setIsUserTeacher] = _isUserTeacher;
    const [passwordInputType, setPasswordInputType] = useState('password');
    const [isCreateAccountModalDisplayed, setIsCreateAccountModalDisplayed] = _isCreateAccountModalDisplayed;
    /**
     * @typedef {"I solemnly swear I'm not a student just trying to get the answer key."} TUserIsTeacherTxt
     * @type {[TUserIsTeacherTxt, import('react').Dispatch<import('react').SetStateAction<TUserIsTeacherTxt>>]}
     */
    const [, setUserIsTeacherTxt] = useState("I solemnly swear I'm not a student just trying to get the answer key.");

    const handlePasswordTxtShowBtnClick = () => {
        setPasswordInputType(state => state === 'password' ? 'text' : 'password');
    };

    const handleOnHide = () => {
        setIsCreateAccountModalDisplayed(false);
        setTimeout(() => {
            setIsUserTeacher(false);
            setErrors(new Map());
            setUserIsTeacherTxt("I solemnly swear I'm not a student just trying to get the answer key.");
        }, 200);
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
            setErrors(errors);
            setIsLoadingSpinnerOn(false);
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

        if (name === "confirmPassword" || name === "password") {
            setErrors(errors => {
                const errorsClone = structuredClone(errors);

                errorsClone.delete("confirmPassword");
                errorsClone.delete("password");

                return errorsClone;
            });
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
            setErrors(errors);
            setIsGoogleLoadingSpinnerOn(false);
            return;
        }

        // put the request that updates the mailing list logic for the target user into a global component
        const callbackUrl = `${(typeof window !== 'undefined') ? window.location.origin : ''}/account?show_about_user_form=true`;

        if (createAccountForm.isOnMailingList) {
            localStorage.setItem('isOnMailingList', JSON.stringify(true));
        } else {
            localStorage.removeItem('isOnMailingList');
        }

        localStorage.setItem('userEntryType', JSON.stringify('create-account'));

        signIn('google', { callbackUrl: callbackUrl });
    };

    return (
        <Modal
            show={isCreateAccountModalDisplayed}
            onHide={handleOnHide}
            onBackdropClick={handleOnHide}
            dialogClassName='selected-gp-web-app-dialog login-modal-dialog m-0 d-flex justify-content-center align-items-center'
            contentClassName='login-ui-modal login-ui-modal--refresh create-account-modal box-shadow-login-ui-modal'
        >
            <ModalHeader className='login-modal-header border-0'>
                <CloseButton onClick={handleOnHide} className='position-absolute top-0 end-0 me-2 mt-2 mb-3 text-grey login-modal-close-btn' />
                <div className="login-modal-brand">
                    <img
                        className='login-modal-logo'
                        src='/GP_bubbleLogo300px.png'
                        alt="gp_logo"
                        width={48}
                        height={48}
                    />
                    <div>
                        <h5 className="login-modal-title">Create your account</h5>
                        <p className="login-modal-subtitle">
                            Access 100+ free STEM resources and personalized tools.
                        </p>
                    </div>
                </div>
            </ModalHeader>
            <ModalBody className='login-modal-body create-account-modal-body'>
                <div className='create-account-mailing-wrap'>
                    <button
                        type="button"
                        className='create-account-mailing-toggle'
                        onClick={handleToAddToMailingListToggleBtnClick}
                    >
                        <span className="create-account-mailing-icon" aria-hidden="true">
                            {createAccountForm.isOnMailingList ? (
                                <BiCheckboxChecked fontSize={FONT_SIZE_CHECKBOX} />
                            ) : (
                                <BiCheckbox fontSize={FONT_SIZE_CHECKBOX} />
                            )}
                        </span>
                        <span className='create-account-mailing-label'>
                            Send me updates about new/free resources.
                            You&apos;ll get a confirmation email.
                        </span>
                    </button>
                </div>
                <section className='my-3 mt-md-2 d-flex justify-content-center align-items-center'>
                    <CreateAccountWithGoogle
                        handleGoogleBtnClickCustom={handleCreateAnAccountWithGoogleBtnClick}
                        callbackUrl={`${(typeof window !== 'undefined') ? window.location.origin : ''}/account?show_about_user_form=true`}
                        className='login-modal-google-btn create-account-google-btn position-relative'
                        style={{ maxWidth: 'none' }}

                    >
                        <FcGoogle
                            className="mx-2"
                            size={31}
                            style={{ opacity: isGoogleLoadingSpinnerOn ? 0 : 1 }}
                        />
                        {isGoogleLoadingSpinnerOn && (
                            <div className='center-absolutely'>
                                <Spinner size="lg" className='text-center' />
                            </div>
                        )}
                        <span className="login-modal-google-label">
                            <span style={{ opacity: isGoogleLoadingSpinnerOn ? 0 : 1 }}>Continue with Google</span>
                        </span>
                    </CreateAccountWithGoogle>
                </section>
                <div className="auth-divider">
                    <div className="auth-divider-line" />
                    <span>OR</span>
                    <div className="auth-divider-line" />
                </div>
                <form className='create-account-form'>
                    <div className='create-account-grid'>
                        <div className="login-modal-field-group">
                            <label className={`login-modal-label ${errors.has('firstName') ? 'text-danger' : ''}`} htmlFor="first-name">
                                First name
                            </label>
                            <input
                                id="first-name"
                                placeholder="First name"
                                className={`create-account-text-input w-100 ${errors.has('firstName') ? 'border-red text-danger' : ''}`}
                                autoFocus
                                name="firstName"
                                onChange={handleOnInputChange}
                            />
                            <span className="login-modal-error">{errors.get('firstName') ?? ''}</span>
                        </div>
                        <div className="login-modal-field-group">
                            <label className={`login-modal-label ${errors.has('lastName') ? 'text-danger' : ''}`} htmlFor="last-name-id">
                                Last name
                            </label>
                            <input
                                id="last-name-id"
                                placeholder="Last name"
                                className={`create-account-text-input w-100 ${errors.has('lastName') ? 'border-red text-danger' : ''}`}
                                name="lastName"
                                onChange={handleOnInputChange}
                            />
                            <span className="login-modal-error">{errors.get('lastName') ?? ''}</span>
                        </div>
                    </div>
                    <div className='create-account-grid create-account-grid-single'>
                        <div className="login-modal-field-group">
                            <label className={`login-modal-label ${errors.has('email') ? 'text-danger' : ''}`} htmlFor="email-input">
                                Email
                            </label>
                            <input
                                id="email-input"
                                placeholder="Email"
                                className={`create-account-text-input w-100 ${errors.has('email') ? 'border-red text-danger' : ''}`}
                                name="email"
                                onChange={handleOnInputChange}
                            />
                            <span className="login-modal-error">{errors.get('email') ?? ''}</span>
                        </div>
                    </div>
                    <div className='create-account-grid'>
                        <div className="login-modal-field-group">
                            <label className={`login-modal-label ${errors.has('password') ? 'text-danger' : ''}`} htmlFor="password">
                                Password
                            </label>
                            <CustomInput
                                inputId="password"
                                isPasswordInput
                                handleShowPasswordTxtBtnClick={handlePasswordTxtShowBtnClick}
                                inputType={passwordInputType}
                                placeholder="Enter your password"
                                inputContainerCss={`d-flex flex-column position-relative p-0 login-modal-input-container ${errors.has('password') ? 'border-red' : ''}`}
                                inputContainerStyle={{ borderRadius: '8px' }}
                                inputStyle={{
                                    borderRadius: '8px',
                                    paddingLeft: '0.75rem',
                                }}
                                inputClassName={`p-1 w-100 py-2 no-outline ${errors.has('password') ? 'text-danger border-0' : 'border-0'}`}
                                inputName="password"
                                onChange={handleOnInputChange}
                                iconContainerClassName="h-100 end-0 position-absolute top-0 d-flex justify-content-center align-items-center login-modal-password-toggle"
                                iconContainerStyle={{
                                    borderTopRightRadius: '8px',
                                    borderBottomRightRadius: '8px',
                                    zIndex: 1,
                                    width: "14%",
                                }}
                                noInputBorderColorOnBlur
                            />
                            <span className="login-modal-error">{errors.get('password') ?? ''}</span>
                        </div>
                        <div className="login-modal-field-group">
                            <label className={`login-modal-label ${errors.has('confirmPassword') ? 'text-danger' : ''}`} htmlFor="confirm-password-id">
                                Confirm password
                            </label>
                            <CustomInput
                                inputId="confirm-password-id"
                                isPasswordInput
                                handleShowPasswordTxtBtnClick={handlePasswordTxtShowBtnClick}
                                inputType={passwordInputType}
                                placeholder="Enter your password"
                                inputContainerCss={`d-flex flex-column position-relative p-0 login-modal-input-container ${errors.has('confirmPassword') ? 'border-red' : ''}`}
                                inputContainerStyle={{
                                    borderRadius: '8px',
                                }}
                                inputStyle={{
                                    borderRadius: '8px',
                                    paddingLeft: '0.75rem',
                                }}
                                inputClassName={`p-1 w-100 py-2 no-outline ${errors.has('confirmPassword') ? 'text-danger border-0' : 'border-0'}`}
                                inputName="confirmPassword"
                                onChange={handleOnInputChange}
                                iconContainerClassName="h-100 end-0 position-absolute top-0 d-flex justify-content-center align-items-center login-modal-password-toggle"
                                iconContainerStyle={{
                                    borderTopRightRadius: '8px',
                                    borderBottomRightRadius: '8px',
                                    zIndex: 1,
                                    width: "14%",
                                }}
                                noInputBorderColorOnBlur
                            />
                            <span className="login-modal-error">{errors.get('confirmPassword') ?? ''}</span>
                        </div>
                    </div>
                    <Button
                        handleOnClick={handleSubmitCredentialsBtnClick}
                        classNameStr="login-modal-submit-btn create-account-submit rounded border-0 py-2 text-white"
                    >
                        {isLoadingSpinnerOn ?
                            <Spinner size="sm" className='text-white' />
                            :
                            (
                                <span className="text-white">
                                    Create account
                                </span>
                            )
                        }
                    </Button>
                </form>
            </ModalBody>
        </Modal>
    );
};

export default SignUpModal;
