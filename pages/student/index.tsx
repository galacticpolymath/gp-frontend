import Link from "next/link";
import Layout from "../../components/Layout";
import styles from "./student-auth.module.css";

export default function StudentLandingPage() {
  return (
    <Layout
      title="Student Hub | Galactic Polymath"
      description="Student access for JobViz tours and saved interests."
      url="/student"
      canonicalLink="/student"
      imgSrc=""
      imgAlt=""
      langLinks={[]}
    >
      <main className={styles.page}>
        <section className={styles.card}>
          <h1 className={styles.title}>Student Hub</h1>
          <p className={styles.subtitle}>
            Jump into JobViz tours from your teacher, or create a student account
            to save jobs you care about.
          </p>
          <div className={styles.actions}>
            <Link className={styles.btnPrimary} href="/jobviz?student=1">
              Open JobViz
            </Link>
            <Link className={styles.btnSecondary} href="/student/login">
              Student login
            </Link>
            <Link className={styles.btnSecondary} href="/student/sign-up">
              Student sign up
            </Link>
          </div>
        </section>
      </main>
    </Layout>
  );
}
