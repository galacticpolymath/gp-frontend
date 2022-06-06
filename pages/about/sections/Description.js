
import graphic from '../../../img/GP_Current_Knowledge_Splosion_rjbh11.jpeg';
import styles from '../about.module.css'

export default function SectionDescription() {

  return (
    <div>
        <h2>Our Mission</h2>
          <h4>
            To create a direct pipeline between the sources of knowledge and grade 5-12 classrooms by translating complex topics from
            researchers, non-profits, and sustainable corporations, into high-quality, open-access educational
            materials.
          </h4>

          <img src={graphic.src} style={{maxWidth:'100%'}}
          alt={"Diagram showing how the status quo for disseminating knowledge favors experts or the highly educated," +
          "neglecting K-12 students who are a much larger, more important audience representing all of society at a " +
          "critical developmental stage. By connecting Academia and K-12 classes, we can create a much more informed," +
          "engaged, and curious populace that is ready to address the challenges of tomorrow."}/>

          <h2>Our Vision</h2>
          <h4>We are a <a href={"https://en.wikipedia.org/wiki/Triple_bottom_line"}>triple bottom line </a>
            social enterprise, motivated by People, Planet, and Profit—in that order. We want to improve the lives of teachers,
            students, and researchers because we have been in all of those roles. We are also keenly interested in
            amplifying marginalized voices (particularly those of indigenous peoples around the world), not only because
            representation matters, but because diverse perspectives lead to better solutions. We are working toward a
            future where education is bolder, more creative, more equitable,
            and where organizational outreach truly has Broader Impacts.
            <br/><br/>
             <a href={"https://vimeo.com/manage/videos/448000812"}>
               &nbsp;See this talk by our founder to learn more.
            </a>
            </h4>
        <div className={styles['think_big']}>
          <h1>
            <span>Think <b>bigger</b>.</span>
          </h1>
          <h1>
            <span>Learn everything.</span>
          </h1>
        </div>
    </div>
  );
}