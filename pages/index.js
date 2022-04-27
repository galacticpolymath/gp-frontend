import Layout from './components/Layout';
import styles from '../styles/Home.module.css';
import HeroImage from '../img/city_network.jpg';

export default function Home() {
  return <Layout>
    <div style={{ backgroundImage: `url(${HeroImage.src})` }} className={styles.hero}>
      <div className="container row mx-auto align-items-start">
        <div className='col col-md-8 col-lg-6'>
          <h1 className={styles.shadow}>We are an education studio.</h1>
          <p className={styles.shadow}>We translate current research into creative, interdisciplinary lessons for grades 5+ that are free for <em>everyone</em>.</p>
        </div>
      </div>
    </div>
  </Layout>;
}
