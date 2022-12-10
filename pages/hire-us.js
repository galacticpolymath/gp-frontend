/* eslint-disable indent */
/* eslint-disable react/jsx-indent */
import Hero from '../components/Hero';
import Layout from '../components/Layout';
import styles from './index.module.css';

const HireUsPage = () => {
    return (
        <Layout>
            <Hero>
                <h1 className={styles.shadow}>Hello there</h1>
                <p className={styles.shadow}></p>
            </Hero>
        </Layout>
    );
};

export default HireUsPage;
