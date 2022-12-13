/* eslint-disable indent */
/* eslint-disable react/jsx-indent */
import Hero from '../components/Hero';
import Layout from '../components/Layout';
import styles from './index.module.css';
import Button from 'react-bootstrap/Button';
// import Image from 'next/image';
import LayoutBackGroundImg from '../assets/img/1_northeast_merlot_darker.png';

const HireUsPage = () => {
    return (
        <Layout>
            <div style={{ backgroundImage: `url(${LayoutBackGroundImg.src})` }} className="min-vh-100 container noPadding noMargin w-100 hireUsPg position-relative">
                <Hero className='heroHireUsPg d-flex flex-row'>
                    <section className="d-flex">
                        <section>
                            <section>
                                <h1 className={`${styles.shadow} display-1 headingHireUs`}>Better, Easier </h1>
                                <h1 className={`${styles.shadow} display-1 headingHireUs`}>Outreach</h1>
                            </section>
                            <section>
                                <p className={`${styles.shadow} display-6 noMargin noPadding`}>We help you make a real</p>
                                <p className={`${styles.shadow} display-6 noMargin noPadding`}>impact!</p>
                            </section>
                        </section>
                        <section className="border-danger">
                            <div className="buttonContainer border-white">
                                <Button className="w-100 h-100 noBackground noBorder">Let's talk!</Button>
                            </div>
                        </section>
                    </section>
                </Hero>

            </div>
        </Layout>
    );
};

export default HireUsPage;
