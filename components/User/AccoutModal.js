/* eslint-disable react/jsx-indent-props */
/* eslint-disable react/jsx-indent */
/* eslint-disable indent */

import { useContext } from 'react';
import { Modal } from 'react-bootstrap';
import { ModalContext } from '../../providers/ModalProvider';
import { signOut, useSession } from 'next-auth/react';
import Button from '../General/Button';
import { useRouter } from 'next/router';
import { CustomCloseButton } from '../../ModalsContainer';

const AccountModal = () => {
    const { _isAccountModalMobileOn } = useContext(ModalContext);
    const router = useRouter();
    const [isAccountModalMobileOn, setIsAccountModalMobileOn] = _isAccountModalMobileOn;
    const { data } = useSession();
    const { image, name } = data?.user ?? {};

    const handleOnHide = () => {
        setIsAccountModalMobileOn(false);
    };

    const handleOnShow = () => {

    };

    return (
        <Modal
            show={isAccountModalMobileOn}
            onHide={handleOnHide}
            onShow={handleOnShow}
            dialogClassName='border-0 selected-gp-web-app-dialog m-0'
            contentClassName='account-modal user-modal-color rounded-0 pt-3'
        >
            <section
                style={{ borderBottom: '1px solid grey' }}
                className="d-flex flex-column justify-content-center align-items-center pb-2 position-relative"
            >
                <img
                    src={image ?? '/imgs/gp_logo_gradient_transBG.png'}
                    alt='user_img'
                    width={75}
                    height={75}
                    style={{ objectFit: 'contain' }}
                    className='rounded-circle'
                />
                <h5 className="text-white my-3">{name?.first} {name?.last}</h5>
                <CustomCloseButton
                    className='no-btn-styles position-absolute top-0 end-0 me-2'
                    style={{ transform: 'translateY(-40%)' }}
                    handleOnClick={handleOnHide}
                />
            </section>
            <section className='d-flex flex-column'>
                <Button
                    handleOnClick={() => {
                        handleOnHide();
                        router.push('/account');
                    }}
                    classNameStr="no-btn-styles text-white txt-underline-on-hover py-2"

                >
                    View Account
                </Button>
                <Button
                    handleOnClick={() => {
                        localStorage.clear();
                        signOut();
                    }}
                    classNameStr="no-btn-styles text-danger hover txt-underline-on-hover py-2"
                >
                    SIGN OUT
                </Button>
            </section>
        </Modal>
    );
};

export default AccountModal;