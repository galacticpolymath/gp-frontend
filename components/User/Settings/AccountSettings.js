/* eslint-disable react/jsx-curly-brace-presence */
/* eslint-disable quotes */
/* eslint-disable no-debugger */
/* eslint-disable no-console */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable react/jsx-indent */
/* eslint-disable indent */
import { Modal, ModalBody, ModalFooter, ModalHeader, ModalTitle } from 'react-bootstrap';
import { useContext, useRef, useState } from 'react';
import { ModalContext } from '../../../providers/ModalProvider';
import { CustomCloseButton } from '../../../ModalsContainer';
import { IoMdClose } from 'react-icons/io';
import CheckBox from '../../General/CheckBox';
import { UserContext } from '../../../providers/UserProvider';
import Button from '../../General/Button';

const AccountSettings = () => {
    const { _isAccountSettingModalOn } = useContext(ModalContext);
    const { _accountForm } = useContext(UserContext);
    const [isAccountSettingsModalDisplayed, setIsAccountSettingModalDisplayed] = _isAccountSettingModalOn;
    const [isDeleteAccountBtnSpinnerOn, setIsDeleteAccountBtnSpinnerOn] = useState(false);
    const [isSavingChangesSpinnerOn, setIsSavingChangesSpinnerOn] = useState(false);
    // when the user opens the modal, get the first name and the last name of the user, get from the db
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
                className='no-btn-styles position-absolute top-0 end-0 me-sm-2 me-sm-3 mt-1'
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
                <form className='h-100 px-1 px-sm-4 position-relative d-flex flex-column justify-content-between'>
                    <section className='d-flex flex-column'>
                        <section className='row d-flex flex-column flex-lg-row px-sm-3'>
                            <section className='d-flex flex-column col-12 col-sm-8 col-lg-6'>
                                <label htmlFor='country-input' className={`${errors.has('occupation') ? 'text-danger' : ''}`}>
                                    First name:
                                </label>
                                <input
                                    name='occupation'
                                    onChange={handleOnInputChange}
                                    placeholder='First name'
                                    value={accountForm.firstName}
                                    className={`account-settings-input no-outline pt-1 ${errors.has('occupation') ? 'text-danger border-danger' : ''}`}
                                />
                                <span style={{ height: '25px', fontSize: '16px' }} className='text-danger ms-sm-2 ms-sm-0'>{errors.get('occupation') ?? ''}</span>
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
                                    className={`account-settings-input pt-1 ${errors.has('lastName') ? 'border-danger' : ''}`}
                                />
                                <span style={{ height: '25px', fontSize: '16px' }} className='text-danger ms-2 ms-sm-0'>{errors.get('lastName') ?? ''}</span>
                            </section>
                        </section>
                        <section className='row d-flex flex-column flex-lg-row px-sm-3'>
                            <CheckBox
                                isChecked={accountForm.isOnMailingList}
                                handleOnClick={handleCheckBoxClick}
                            >
                                Subscribe to GP mailing list.
                            </CheckBox>
                        </section>
                    </section>
                    <section style={{ height: '55%' }} className='mt-2 mt-sm-2'>
                        <h5 style={{ height: '10%' }} className='text-danger px-sm-3'>
                            <i>
                                Danger Zone
                            </i>
                        </h5>
                        <section style={{ height: '90%' }} className='rounded w-100 px-2 py-2 px-sm-3 py-sm-2'>
                            <div
                                style={{ border: 'solid 1.75px red' }}
                                className='rounded bottom-0 w-100 row d-flex flex-column py-2 h-100'
                            >
                                <section
                                    className="w-100 d-flex flex-sm-row flex-column justify-content-between"
                                >
                                    <section className='d-flex flex-column'>
                                        <span style={{ fontWeight: 600 }}>Delete your account</span>
                                        <span style={{ textWrap: 'break-word', maxWidth: '450px' }}>You will no longer have access to the {"teacher's"} materials of a unit if you are a teacher.</span>
                                    </section>
                                    <section className='d-flex justify-content-sm-center align-items-sm-center pt-sm-0 pt-2'>
                                        <Button
                                            classNameStr='bg-danger no-btn-styles rounded px-2 py-2 px-sm-4 py-sm-2 mt-2 mt-sm-0'
                                            onClick={handleCheckBoxClick}
                                        >
                                            <span className='text-white'>
                                                Delete account
                                            </span>
                                        </Button>
                                    </section>
                                </section>
                            </div>
                        </section>
                    </section>
                </form>
            </ModalBody>
            <ModalFooter className='px-4'>
                <Button classNameStr='btn bg-primary'>
                    Save
                </Button>
            </ModalFooter>
        </Modal>
    );
};

export default AccountSettings;
