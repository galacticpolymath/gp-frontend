import { FormEvent, useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import Layout from "../../components/Layout";
import styles from "./student-auth.module.css";

export default function StudentLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);
    const result = await signIn("credentials", {
      redirect: false,
      callbackUrl: "/student/login",
      formType: "login",
      email,
      password,
    });
    setIsSubmitting(false);
    if (!result || result.error) {
      setErrorMsg("Unable to sign in. Please check your email and password.");
      return;
    }
    router.push("/jobviz?student=1");
  };

  return (
    <Layout
      title="Student Login | Galactic Polymath"
      description="Student login for JobViz saved progress."
      url="/student/login"
      canonicalLink="/student/login"
      imgSrc=""
      imgAlt=""
      langLinks={[]}
    >
      <main className={styles.page}>
        <section className={styles.card}>
          <h1 className={styles.title}>Student login</h1>
          <p className={styles.subtitle}>Continue exploring JobViz and saved jobs.</p>
          {errorMsg && <p className={styles.error}>{errorMsg}</p>}
          <form className={styles.form} onSubmit={handleSubmit}>
            <label className={styles.label}>
              Email
              <input
                className={styles.input}
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>
            <label className={styles.label}>
              Password
              <input
                className={styles.input}
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </label>
            <div className={styles.actions}>
              <button className={styles.btnPrimary} type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Signing in..." : "Sign in"}
              </button>
              <Link className={styles.btnSecondary} href="/student/sign-up">
                Create student account
              </Link>
            </div>
          </form>
        </section>
      </main>
    </Layout>
  );
}
