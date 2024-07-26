/* eslint-disable react/jsx-indent */
/* eslint-disable indent */
/* eslint-disable react/jsx-indent-props */
import { use, useContext } from 'react';
import Button from '../General/Button';
import { useSession } from 'next-auth/react';
import { ModalContext } from '../../providers/ModalProvider';
import LoginUI from './Login/LoginUI';

const AccountPg = () => {
    const { data, status } = useSession();
    const { _isAboutMeFormModalDisplayed } = useContext(ModalContext);
    const [, setIsAboutMeFormModalDisplayed] = _isAboutMeFormModalDisplayed;
    const statusPromise = new Promise((resolve) => {
        resolve(status);
    });
    const statusResult = use(statusPromise);

    console.log('statusResult: ', statusResult);

    if (statusResult === 'loading') {
        return null;
    }

    const { image, email, name, occupation } = data.user;

    const handleBtnClick = () => {
        setIsAboutMeFormModalDisplayed(true);
    };

    if (statusResult === 'unauthenticated') {
        return (
            <div style={{ minHeight: '100vh', paddingTop: '10px' }} className="container pt-4">
                <LoginUI
                    className='pt-3'
                    headingTitleClassName='text-center text-black my-2'
                    isInputIconShow={false}
                />
            </div>
        );
    }

    return (
        <section className='row border-bottom pb-4'>
            <section className='col-12 d-flex justify-content-center align-items-center pt-4'>
                <img
                    src={image ?? '/imgs/gp_logo_gradient_transBG.png'}
                    alt='user_img'
                    width={100}
                    height={100}
                    style={{ objectFit: 'contain' }}
                    className='rounded-circle'
                />
            </section>
            <section className='col-12 d-flex justify-content-center align-items-center mt-3 flex-column'>
                <h5 className='mb-0'>{name.first} {name.last}</h5>
                <span>{email}</span>
            </section>
            <section className='col-12 d-flex justify-content-center align-items-center flex-column mt-1 pt-2'>
                <span className='d-inline-flex justify-content-center align-tiems-center'>Occupation: </span>
                <span style={{ fontStyle: 'italic' }} className='d-inline-flex justify-content-center align-tiems-center '>
                    {occupation ?? 'UNANSWERED'}
                </span>
            </section>
            <section className='col-12 d-flex justify-content-center align-items-center flex-column mt-1 pt-2'>
                <Button
                    handleOnClick={handleBtnClick}
                    classNameStr='rounded px-3 border shadow mt-2'
                >
                    <span
                        style={{ fontWeight: 410 }}
                        className='text-black'
                    >
                        View 'About Me' form
                    </span>
                </Button>
            </section>
        </section>
    );
};

export default AccountPg;