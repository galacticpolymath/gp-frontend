/* eslint-disable no-console */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable react/jsx-no-undef */
/* eslint-disable indent */
/* eslint-disable react/jsx-indent */
import { IoMdEyeOff, IoMdEye } from 'react-icons/io';
import { useContext, useState } from 'react';
import { InputSection } from '../formElements';
import Button from '../../General/Button';
import axios from 'axios';
import { CustomError } from '../../../backend/utils/errors';
import { defautlNotifyModalVal, ModalContext } from '../../../providers/ModalProvider';
import { CustomNotifyModalFooter } from '../../Modals/Notify';
import { useRouter } from 'next/router';

/**
 * @typedef {'input-focus-blue' | 'border-grey-dark'} TFocusCss
 */

const PasswordResetForm = () => {
    const { _notifyModal, _customModalFooter } = useContext(ModalContext);
    const [password, setPassword] = useState({ new: '', confirm: '' });
    const [, setNotifyModal] = _notifyModal;
    const [, setCustomModalFooter] = _customModalFooter;
    const [isNewPasswordShown, setIsNewPasswordShown] = useState(false);
    const router = useRouter();
    const [isConfirmPasswordShown, setIsConfirmPasswordShown] = useState(false);
    /**
     * @type {[TFocusCss, import('react').Dispatch<import('react').SetStateAction<TFocusCss>>]}
     */
    const [focusCssNewPassword, setFocusCssNewPassword] = useState('border-grey-dark');
    /**
     * @type {[TFocusCss, import('react').Dispatch<import('react').SetStateAction<TFocusCss>>]}
     */
    const [focusCssConfirmPassword, setFocusCssConfirmPassword] = useState('border-grey-dark');
    const { new: newPassword, confirm } = password;
    const [errors] = useState(new Map());

    /**
     * @param {import('react').Dispatch<import('react').SetStateAction<boolean>>} setter 
     */
    const handleShowPasswordBtnClick = setState => () => {
        setState(state => !state);
    };

    const handleOnChange = event => {
        setPassword(state => ({ ...state, [event.target.name]: event.target.value }));
    };

    const closeNotifyModal = () => {
        setNotifyModal(state => ({
            ...state,
            isDisplayed: false,
        }));

        setTimeout(() => {
            setNotifyModal(defautlNotifyModalVal);
            setCustomModalFooter(null);
        }, 200);
    };

    const handleRestartPasswordRecoverBtnClick = () => {
        closeNotifyModal();
        router.push('/?is_password_recover_modal_on=true');
    };

    const handleOnSetPasswordBtnClick = async () => {
        try {
            if (newPassword !== confirm) {
                throw new Error('Passwords do not match.');
            }

            const url = `${window.location.origin}/api/update-password`;
            const passwordResetToken = router.query?.password_reset_token; 

            if(!passwordResetToken){
                throw new Error('The password reset token is not present.');
            }

            const Authorization = `Bearer ${passwordResetToken}`;
            const response = await axios.post(url, { newPassword }, { headers: { Authorization } });

            if ((response.status !== 200) && response.errMsg) {
                throw new CustomError(`Failed to upate password. Reason: ${response?.data?.errMsg}`, null, 'updatePasswordErr');
            }

            if (response.status !== 200) {
                throw new CustomError('Failed to update password. Press "Restart Recover" to try again.', null, 'updatePasswordErr');
            }

            router.push('/account?password_changed=true');
        } catch (error) {
            setCustomModalFooter(
                <CustomNotifyModalFooter
                    footerClassName='d-flex justify-content-end'
                    closeNotifyModal={closeNotifyModal}
                    customBtnTxt="Restart Recover"
                    handleCustomBtnClick={handleRestartPasswordRecoverBtnClick}
                />
            );
            setNotifyModal({
                headerTxt: error.message ?? 'Failed to update password. Press "Restart Recover" to try again.',
                bodyTxt: '',
                isDisplayed: true,
                handleOnHide: closeNotifyModal,
            });
        }
    };

    /**
     * @param {import('react').Dispatch<import('react').SetStateAction<TFocusCss>>} setter 
     * @param {TFocusCss} state 
     */
    const handleFocusCssState = (setState, state) => () => {
        setState(state);
    };

    return (
        <form className='mt-2 d-flex justify-content-center align-items-center flex-column w-100'>
            <h4 className='col-12 col-sm-6'>Set New Password</h4>
            <InputSection
                errors={errors}
                errorsFieldName='new'
                inputId='new-password'
                label="New Password"
                labelClassName='fw-bold pb-1'
                containerClassName='col-12 col-sm-6 d-flex flex-column mt-1'
                inputElement={(
                    <div className={`position-relative w-100 ${focusCssNewPassword} rounded`}>
                        <input
                            style={{ width: '90%', height: '45px', fontSize: '20px' }}
                            autoFocus
                            id='new-password'
                            name='new'
                            onFocus={handleFocusCssState(setFocusCssNewPassword, 'input-focus-blue')}
                            onBlur={handleFocusCssState(setFocusCssNewPassword, 'border-grey-dark')}
                            type={isNewPasswordShown ? 'text' : 'password'}
                            className='px-1 py-2 position-relative no-outline border-0 rounded'
                            onChange={handleOnChange}
                        />
                        <div
                            style={{ width: '10%' }}
                            className='h-100 end-0 position-absolute top-0 transparent d-flex justify-content-center align-items-center'
                        >
                            <div style={{ height: '95%' }} className='d-flex justify-content-center align-items-center'>
                                {isNewPasswordShown ?
                                    (
                                        <IoMdEye
                                            fontSize="25px"
                                            className='pointer'
                                            onClick={handleShowPasswordBtnClick(setIsNewPasswordShown)}
                                        />
                                    )
                                    :
                                    (
                                        <IoMdEyeOff
                                            fontSize="25px"
                                            className='pointer'
                                            onClick={handleShowPasswordBtnClick(setIsNewPasswordShown)}
                                        />
                                    )
                                }
                            </div>
                        </div>
                    </div>
                )}
            />
            <InputSection
                errors={errors}
                errorsFieldName='confirm'
                label="Confirm your new password"
                labelClassName='fw-bold pb-1'
                inputId='confirm-password'
                containerClassName='col-12 col-sm-6 d-flex flex-column mt-1'
                inputElement={(
                    <div className={`position-relative w-100 ${focusCssConfirmPassword} rounded`}>
                        <input
                            style={{ width: '90%', height: '45px', fontSize: '20px' }}
                            id='confirm-password'
                            name='confirm'
                            onFocus={handleFocusCssState(setFocusCssConfirmPassword, 'input-focus-blue')}
                            onBlur={handleFocusCssState(setFocusCssConfirmPassword, 'border-grey-dark')}
                            type={isConfirmPasswordShown ? 'text' : 'password'}
                            onChange={handleOnChange}
                            className='px-1 py-2 position-relative no-outline border-0 rounded'
                        />
                        <div
                            style={{ width: '10%' }}
                            className='h-100 end-0 position-absolute top-0 transparent d-flex justify-content-center align-items-center'
                        >
                            <div style={{ height: '95%' }} className='d-flex justify-content-center align-items-center'>
                                {isConfirmPasswordShown ?
                                    (
                                        <IoMdEye
                                            fontSize="25px"
                                            className='pointer'
                                            onClick={handleShowPasswordBtnClick(setIsConfirmPasswordShown)}
                                        />
                                    )
                                    :
                                    (
                                        <IoMdEyeOff
                                            fontSize="25px"
                                            className='pointer'
                                            onClick={handleShowPasswordBtnClick(setIsConfirmPasswordShown)}
                                        />
                                    )
                                }
                            </div>
                        </div>
                    </div>
                )}
            />
            <Button
                handleOnClick={handleOnSetPasswordBtnClick}
                defaultStyleObj={{ opacity: ((newPassword && confirm) && (newPassword === confirm)) ? 1 : .3 }}
                isDisabled={(newPassword && confirm) ? password.confirm !== password.new : true}
                classNameStr='col-12 col-sm-6 no-btn-styles bg-primary rounded py-2 mt-2'
            >
                <span className='text-white'>Set Password</span>
            </Button>
        </form>
    );
};

export default PasswordResetForm;