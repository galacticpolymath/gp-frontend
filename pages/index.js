import Layout from './components/Layout';
import styles from '../styles/Home.module.css';
import HeroImage from '../img/city_network.jpg';

export default function Home() {
  return <Layout>
    <div style={{ backgroundImage: `url(${HeroImage.src})` }}>
      <div className={`container row mx-auto align-items-start ${styles.hero}`}>
        <div className='col col-md-8 col-lg-6 py-3'>
          <h1>We are an education studio.</h1>
          <p>We translate current research into creative, interdisciplinary lessons for grades 5+ that are free for <em>everyone</em>.</p>
        </div>
      </div>
    </div>
  </Layout>;
}
