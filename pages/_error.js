/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable curly */
/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable react/jsx-closing-bracket-location */
/* eslint-disable react/jsx-closing-tag-location */
/* eslint-disable no-unused-vars */
/* eslint-disable semi */
/* eslint-disable quotes */
/* eslint-disable no-console */
import CustomLink from '../components/CustomLink';
import Layout from '../components/Layout';
import { CONTACT_SUPPORT_EMAIL } from '../globalVars';

const ErrorPg = () => (
  <Layout>
    <div className="lessonDetailsContainer min-vh-100 pt-5 ps-3 ps-xxl-5 pt-xxl-4 d-flex flex-column">
      <span>404 page not found 😔.</span>
      <span className='mt-2'>If this link used to work or you think we should be aware of this issue, please email:
        <CustomLink hrefStr={CONTACT_SUPPORT_EMAIL} className='ms-1 mt-2 text-break'>feedback@galacticpolymath.com</CustomLink>.
      </span>
    </div>
  </Layout>
);

export default ErrorPg;