/* eslint-disable react/jsx-curly-brace-presence */
/* eslint-disable react/jsx-indent */
/* eslint-disable indent */
/* eslint-disable quotes */
/* eslint-disable react/jsx-indent-props */
import { FaUserAlt } from "react-icons/fa";
import { useContext, useState } from "react";
import { ModalContext } from "../../../providers/ModalProvider";
import Button from "../../General/Button";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";

const LoginContainerForNavbar = ({ _modalAnimation }) => {
    const router = useRouter();
    const { _isLoginModalDisplayed, _isAccountModalMobileOn } = useContext(ModalContext);
    const [, setIsLoginModalDisplayed] = _isLoginModalDisplayed;
    const [modalAnimation, setModalAnimation] = _modalAnimation;
    const { status, data } = useSession();
    const { name, image } = data?.user ?? {};
    const [, setIsAccountModalMobileOn] = _isAccountModalMobileOn;
    const [isLoadingSpinnerOn, setIsLoadingSpinnerOn] = useState(false);

    const handleSignOutBtnClick = () => {
        localStorage.clear();
        setIsLoadingSpinnerOn(true);
        signOut();
    };

    const handleAccountBtnClick = () => {
        if ((document.documentElement.clientWidth <= 767) && (status === 'authenticated')) {
            setIsAccountModalMobileOn(state => !state);
            return;
        }

        if (status === 'authenticated') {
            setModalAnimation(modalAnimation => {
                if (modalAnimation === 'fade-out-quick' || (modalAnimation === 'd-none')) {
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

    return (
        <div className='login-container position-relative'>
            <Button
                handleOnClick={handleAccountBtnClick}
                classNameStr='rounded px-2 py-2 border-0 d-flex justify-content-center align-items-center'
                isDisabled={status === 'loading'}
                backgroundColor="#333438"
                defaultStyleObj={{ width: '125px', opacity: status === 'loading' ? .3 : 1, height: '44px' }}
            >
                {(status === 'unauthenticated') && (
                    <span style={{ color: 'white', fontWeight: 410 }}>
                        LOGIN
                    </span>
                )
                }
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
                {(status === "authenticated") && (
                    image ? (
                        <img
                            src={image}
                            alt='user_img'
                            width={35}
                            height={35}
                            style={{ objectFit: 'contain' }}
                            className='rounded-circle'
                        />
                    )
                        :
                        <FaUserAlt color='#2C83C3' />

                )}
            </Button>
            <div
                style={{
                    display: modalAnimation === 'fade-out-quick' ? 'none' : 'block',
                    zIndex: modalAnimation === 'fade-out-quick' ? -1000 : 100000,
                    pointerEvents: modalAnimation === 'fade-out-quick' ? 'none' : 'auto',
                    border: '.5px solid grey',
                }}
                className={`bg-white account-sm-modal py-2 rounded ${modalAnimation}`}
            >
                <section
                    style={{ borderBottom: '.5px solid grey' }}
                    className="d-flex flex-column justify-content-center align-items-center pb-2"
                >
                    <h5 className="text-black my-3">{name?.first} {name?.last}</h5>
                </section>
                <section className='d-flex flex-column'>
                    <Button
                        handleOnClick={() => {
                            setModalAnimation('fade-out-quick');
                            router.push('/account');
                        }}
                        classNameStr="no-btn-styles text-black txt-underline-on-hover py-2"

                    >
                        View Account
                    </Button>
                    <Button
                        handleOnClick={handleSignOutBtnClick}
                        classNameStr="no-btn-styles  hover txt-underline-on-hover py-2"
                    >
                        {isLoadingSpinnerOn
                            ?
                            (
                                <div
                                    className="spinner-border spinner-border-sm text-dark"
                                    role="status"
                                >
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            )
                            :
                            <span>SIGN OUT</span>
                        }
                    </Button>
                </section>
            </div>
        </div>
    );
};

export default LoginContainerForNavbar;