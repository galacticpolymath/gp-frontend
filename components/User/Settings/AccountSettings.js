/* eslint-disable quotes */
/* eslint-disable no-debugger */
/* eslint-disable no-console */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable react/jsx-indent */
/* eslint-disable indent */
import { Button, Modal, ModalBody, ModalFooter, ModalHeader, ModalTitle } from 'react-bootstrap';
import { useContext, useEffect, useRef, useState } from 'react';
import { ModalContext } from '../../../providers/ModalProvider';
import { CustomCloseButton } from '../../../ModalsContainer';
import { IoMdClose } from 'react-icons/io';
import { useSession } from 'next-auth/react';
import { INPUT_FOCUS_BLUE_CLASSNAME, USER_INPUT_BACKGROUND_COLOR } from '../../../globalVars';
import { ErrorTxt, InputSection } from '../formElements';
import CheckBox from '../../General/CheckBox';
import { UserContext } from '../../../providers/UserProvider';

const AccountSettings = () => {
    const { _isAccountSettingModalOn } = useContext(ModalContext);
    const { _accountForm } = useContext(UserContext);
    const [isAccountSettingsModalDisplayed, setIsAccountSettingModalDisplayed] = _isAccountSettingModalOn;
    const [isDeleteAccountBtnSpinnerOn, setIsDeleteAccountBtnSpinnerOn] = useState(false);
    const [isSavingChangesSpinnerOn, setIsSavingChangesSpinnerOn] = useState(false);
    const [accountForm, setAccountForm] = _accountForm;
    const [inputElementsFocused, setInputElementsFocused] = useState(new Map());
    const [errors, setErrors] = useState(new Map());

    /**
     * @type {[import('../../../providers/UserProvider').TAboutUserForm, import('react').Dispatch<import('react').SetStateAction<import('../../../providers/UserProvider').TAboutUserForm>>]} */
    const modalBodyRef = useRef();

    const handleOnHide = () => {
        setIsAccountSettingModalDisplayed(false);
    };
    const handleOnInputChange = () => {

    };
    const handleOnShow = () => {
        setIsAccountSettingModalDisplayed(true);
    };
    const handleDeleteAccountBtnClick = () => {
        console.log('delete account');
    };
    const handleInputOnChange = (event) => {
        const { name, value } = event.target;
        setAccountForm(state => ({ ...state, [name]: value }));
    };
    const handleCheckBoxClick = () => {

    };

    // display the first name
    // displasy the last name
    // get the status if the user is on the mailing list
    // give the option for the user to delete their account

    return (
        <Modal
            show={isAccountSettingsModalDisplayed}
            onHide={handleOnHide}
            onShow={handleOnShow}
            dialogClassName='border-0 selected-gp-web-app-dialog m-0 d-flex justify-content-center align-items-center'
            contentClassName='account-settings-modal user-modal-color'
        >
            <CustomCloseButton
                className='no-btn-styles position-absolute top-0 end-0 me-2'
                handleOnClick={handleOnHide}
            >
                <IoMdClose color="black" size={28} />
            </CustomCloseButton>
            <ModalHeader
                className='position-relative'
                style={{
                    height: '80px',
                }}
            >
                <ModalTitle style={{ maxWidth: '1800px' }} className='px-2 py-3 txt-color-for-aboutme-modal w-100'>
                    Account Settings
                </ModalTitle>
            </ModalHeader>
            <ModalBody
                style={{ maxWidth: '1800px' }}
                ref={modalBodyRef}
                className='about-me-modal-body w-100 d-flex flex-column'
            >
                <form className='h-100 px-4'>
                    <section className='row d-flex flex-column flex-lg-row px-3'>
                        <section className='d-flex flex-column col-12 col-sm-8 col-lg-6'>
                            <label htmlFor='country-input' className={`${errors.has('occupation') ? 'text-danger' : ''}`}>
                                First name:
                            </label>
                            <input
                                name='occupation'
                                onChange={handleOnInputChange}
                                placeholder='First name'
                                value={accountForm.firstName}
                                className={`ms-2 ms-sm-0 account-settings-input no-outline pt-1 ${errors.has('occupation') ? 'text-danger border-danger' : ''}`}
                            />
                            <span style={{ height: '25px', fontSize: '16px' }} className='text-danger ms-2 ms-sm-0'>{errors.get('occupation') ?? ''}</span>
                        </section>
                        <section className='d-flex flex-column col-12 col-sm-8 col-lg-6'>
                            <label
                                htmlFor='last-name'
                                className={`${errors.has('zipCode') ? 'text-danger' : ''}`}
                            >
                                Last name:
                            </label>
                            <input
                                placeholder='Last name'
                                type='number'
                                name='lastName'
                                id='last-name'
                                value={accountForm.lastName}
                                onChange={handleOnInputChange}
                                style={{
                                    outline: 'none',
                                    borderTop: 'none',
                                    borderRight: 'none',
                                    borderLeft: 'none',
                                }}
                                className={`account-settings-input pt-1 ms-2 ms-sm-0 ${errors.has('lastName') ? 'border-danger' : ''}`}
                            />
                            <span style={{ height: '25px', fontSize: '16px' }} className='text-danger ms-2 ms-sm-0'>{errors.get('lastName') ?? ''}</span>
                        </section>
                    </section>
                    <section className='row d-flex flex-column flex-lg-row px-3 border'>
                        <CheckBox
                            isChecked={accountForm.isOnMailingList}
                            handleOnClick={handleCheckBoxClick}
                        >
                            Subscribe to GP mailing list.
                        </CheckBox>
                        {/* </section> */}
                    </section>
                </form>
                <ModalFooter className='px-4'>
                    {/* make the button green */}
                    <Button className='btn btn-success'>
                        Save
                    </Button>
                </ModalFooter>
            </ModalBody>
        </Modal>
    );
};

export default AccountSettings;
