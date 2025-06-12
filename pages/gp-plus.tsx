import React from 'react';
import Layout from '../components/Layout';

const GpPlus: React.FC = () => {
  // make a request to the backend, within getServerSideProps to determine if the user is GpPlusMember

  return (
    <Layout
      title='GP+ - Galactic Polymath'
      description='GP+ - Galactic Polymath. Gain access to exclusive feature for GP Plus members.'
      langLinks={[]}
      imgSrc='/assets/img/galactic_polymath_logo.png'
      imgAlt='Galactic Polymath Logo'
      url='/gp-plus'
    >
      <div className='min-vh-100 min-vw-100 pt-5 ps-5'>
        <h1>GP+</h1>
        <header>
          <a href='https://galactic-polymath.outseta.com/auth?widgetMode=register&planUid=rmkkjamg&planPaymentTerm=month&skipPlanOptions=false#o-anonymous'>
            SIGN UP
          </a>
        </header>
      </div>
    </Layout>
  );
};

export default GpPlus;