import React from 'react';
import { useRouter } from 'next/router';
import CustomLink from '../components/CustomLink';
import { CONTACT_SUPPORT_EMAIL } from '../globalVars';
import Layout from '../components/Layout';

const GpSignUpResult: React.FC = () => {
  const router = useRouter();
  const { confirmationToken } = router.query;

  return (
    <Layout
      title='GP Plus Sign Up Set password'
      description='GP Plus set password page.'
      url='/gp-sign-up-result'
      imgSrc='/assets/img/galactic_polymath_logo.png'
      imgAlt='Galactic Polymath Logo'
      langLinks={[]}
    >
      <div className='mt-5 min-vh-100 min-vw-100 ps-5'>
        {confirmationToken ? (
          <>
            <p>
              Please enter your password in the pop-up dialog that has opened.
            </p>
            <p>
              If the pop-up does not display, please refresh the page or check
              the link sent to your email inbox.
            </p>
            <p>If there is no pop-up showing, please email: </p>
            <CustomLink
              hrefStr={CONTACT_SUPPORT_EMAIL}
              className='ms-1 mt-2 text-break'
            >
              feedback@galacticpolymath.com
            </CustomLink>
            .
          </>
        ) : (
          <>
            <p>
              No confirmation token found. Please check the link sent to your
              email inbox.
            </p>
            <div className='d-flex'>
              <p>If you think this is an error, please email:</p>
              <CustomLink
                hrefStr={CONTACT_SUPPORT_EMAIL}
                className='ms-1 text-break'
              >
                feedback@galacticpolymath.com
              </CustomLink>
              .
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default GpSignUpResult;