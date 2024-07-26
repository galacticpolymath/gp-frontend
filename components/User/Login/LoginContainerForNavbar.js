/* eslint-disable react/jsx-curly-brace-presence */
/* eslint-disable react/jsx-indent */
/* eslint-disable indent */
/* eslint-disable quotes */
/* eslint-disable react/jsx-indent-props */
import { useContext, useState } from "react";
import { ModalContext } from "../../../providers/ModalProvider";
import Button from "../../General/Button";
import { signOut, useSession } from "next-auth/react";
import CustomLink from "../../CustomLink";

const LoginContainerForNavbar = () => {
    const { _isLoginModalDisplayed } = useContext(ModalContext);
    const [, setIsLoginModalDisplayed] = _isLoginModalDisplayed;
    const [modalAnimation, setModalAnimation] = useState('');
    const { status, data } = useSession();
    const { name, image } = data?.user ?? {};

    const handleOnClick = () => {
        if (status === 'authenticated') {
            setModalAnimation(modalAnimation => {
                if (modalAnimation === 'fade-out-quick' || modalAnimation === '') {
                    return 'fade-in-quick';
                }

                if (modalAnimation === 'fade-in-quick') {
                    return 'fade-out-quick';
                }

                return modalAnimation;
            });
            return;
        }

        setIsLoginModalDisplayed(true);
    };

    let buttonTxt = 'ACCOUNT';

    if (status === 'unauthenticated') {
        buttonTxt = 'LOGIN';
    } else if (status === 'loading') {
        buttonTxt = '';
    }

    return (
        <div className='login-container position-relative'>
            <Button
                handleOnClick={handleOnClick}
                classNameStr='rounded px-3 border-0'
                isDisabled={status === 'loading'}
                backgroundColor="#333438"
                defaultStyleObj={{ width: '125px', opacity: status === 'loading' ? .3 : 1 }}
            >
                <span style={{ color: 'white', fontWeight: 410 }}>
                    {buttonTxt}
                </span>
                {(status === 'loading') && (
                    <>
                        <span
                            className="spinner-border spinner-border-sm text-white"
                            role="status"
                            aria-hidden="true"
                        >
                        </span>
                        <span className="sr-only text-white">Loading...</span>
                    </>
                )}
            </Button>
            <div
                style={{
                    backgroundColor: '#333438',
                    // minWidth: '120%',
                    width: '21vw',
                    right: '30%',
                    maxWidth: '300px',
                    minWidth: '270px',
                    opacity: 0,
                    pointerEvents: modalAnimation === 'fade-out-quick' ? 'none' : 'auto',
                }}
                className={`position-absolute account-modal py-2 rounded ${modalAnimation}`}
            >
                <section
                    style={{ borderBottom: '1px solid grey' }}
                    className="d-flex flex-column justify-content-center align-items-center pb-2"
                >
                    <img
                        src={image ?? '/imgs/gp_logo_gradient_transBG.png'}
                        alt='user_img'
                        width={75}
                        height={75}
                        style={{ objectFit: 'contain' }}
                        className='rounded-circle'
                    />
                    <span className="text-white my-3">{name?.first} {name?.last}</span>
                </section>
                <section className='d-flex flex-column'>
                    <CustomLink
                        hrefStr="/account"
                        className="text-white hover txt-underline-on-hover py-2 w-100 text-center"
                    >
                        View Account
                    </CustomLink>
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
            </div>
        </div>
    );
};

export default LoginContainerForNavbar;