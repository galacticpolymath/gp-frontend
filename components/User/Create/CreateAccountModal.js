/* eslint-disable react/jsx-indent-props */
/* eslint-disable react/jsx-indent */
/* eslint-disable indent */
import { useContext } from 'react';
import { Modal, ModalTitle, ModalBody } from 'react-bootstrap';
import { ModalContext } from '../../../providers/ModalProvider';
import { useLogin } from '../../../customHooks/useLogin';
import Button from '../../General/Button';
import OR from '../ORTxtDivider';
import CreateAccountWithGoogle from '../GoogleSignIn';

const CreateAccountModal = () => {
    const { _isCreateAccountModalDisplayed } = useContext(ModalContext);
    const { _loginForm, sendFormToServer } = useLogin();
    const [loginForm, setLoginForm] = _loginForm;
    const [isCreateAccountModalDisplayed, setIsCreateAccountModalDisplayed] = _isCreateAccountModalDisplayed;

    const handleOnHide = () => {
        setIsCreateAccountModalDisplayed(false);
    };

    const handleCreateBtnClick = () => {
        sendFormToServer({
            email: loginForm.email,
            password: loginForm.password,
        }, 'createAccount', 'credentials');
        // get the ip address of the user
    };

    const handleOnChange = event => {
        event.preventDefault();

        setLoginForm(form => ({
            ...form,
            [event.target.name]: event.target.value,
        }));
    };

    return (
        <Modal
            show={isCreateAccountModalDisplayed}
            onHide={handleOnHide}
            dialogClassName='selected-gp-web-app-dialog m-0 d-flex justify-content-center align-items-center'
            contentClassName='login-ui-modal rounded pt-2 box-shadow-login-ui-modal'
        >
            <ModalTitle>
                Create A Account
            </ModalTitle>
            <ModalBody>
                <form className='d-flex flex-column'>
                    <input
                        placeholder='Email'
                        name='email'
                        onChange={handleOnChange}
                    />
                    <input
                        placeholder='Password'
                        className='mt-2'
                        name='password'
                        onChange={handleOnChange}
                    />
                    <Button
                        handleOnClick={handleCreateBtnClick}
                    >
                        Create
                    </Button>
                </form>
                <OR />
                <CreateAccountWithGoogle 
                    callbackUrl={`${(typeof window !== 'undefined') ? window.location.origin : ''}/account`}
                />
            </ModalBody>
        </Modal>
    );
};

export default CreateAccountModal;
