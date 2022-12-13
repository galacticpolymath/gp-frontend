/* eslint-disable react/no-unknown-property */
/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable object-curly-spacing */
/* eslint-disable indent */
/* eslint-disable react/jsx-indent */

import Layout from '../components/Layout';
import styles from './index.module.css';
import Button from 'react-bootstrap/Button';
import LayoutBackGroundImg from '../assets/img/1_northeast_merlot_darker.png';
import MessageBoxIcon from '../components/svgs/MessageBoxIcon';

const HireUsPage = () => {
    return (
        <Layout>
            <div className="min-vh-100 container noPadding noMargin w-100 hireUsPg position-relative heroHireUsPg">
                <section className='d-flex flex-row' style={{ backgroundImage: `url(${LayoutBackGroundImg.src})` }}>
                    <section className="d-flex w-100 noMargin col-12 introSecAndLetTalksSec">
                        <section className="w-50 d-flex flex-column align-items-center justify-content-center">
                            <section>
                                <h1 className={`${styles.shadow} display-1 headingHireUs`}>Better, Easier</h1>
                                <h1 className={`${styles.shadow} display-1 headingHireUs`}>Outreach</h1>
                            </section>
                            <section>
                                <p className={`${styles.shadow} display-6 noMargin noPadding`}>We help you make a real</p>
                                <p className={`${styles.shadow} display-6 noMargin noPadding`}>impact!</p>
                            </section>
                        </section>
                        <section className="w-50 d-flex align-items-center justify-content-center">
                            <div className="letsTalkBtnContainer border-white d-flex flex-column position-relative">
                                <div className="d-flex align-items-center justify-content-center h-50 w-100">
                                    <MessageBoxIcon />
                                </div>
                                <div className="d-flex align-items-center justify-content-center h-50 w-100">
                                    <span>Let's talk!</span>
                                </div>
                                <Button className="w-100 h-100 noBackground noBorder position-absolute" />
                            </div>
                        </section>
                    </section>
                </section>
                <section>
                    
                </section>

            </div>
        </Layout>
    );
};

export default HireUsPage;
