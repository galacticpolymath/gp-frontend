import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import Layout from "../../components/Layout";
import styles from "./student-auth.module.css";

const MIN_AGE = 13;

const calculateAge = (dateOfBirth: string) => {
  const parsedDate = new Date(dateOfBirth);
  if (Number.isNaN(parsedDate.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - parsedDate.getFullYear();
  const monthDelta = now.getMonth() - parsedDate.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && now.getDate() < parsedDate.getDate())) {
    age -= 1;
  }
  return age;
};

export default function StudentSignUpPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [classCode, setClassCode] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const externalError = useMemo(() => {
    const err = router.query?.["signin-err-type"];
    return typeof err === "string" ? err : null;
  }, [router.query]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMsg(null);
    const age = calculateAge(dateOfBirth);
    if (age === null) {
      setErrorMsg("Please enter a valid date of birth.");
      return;
    }
    if (age < MIN_AGE) {
      setErrorMsg("Students under 13 cannot create self-serve accounts yet.");
      return;
    }
    setIsSubmitting(true);
    const result = await signIn("credentials", {
      redirect: false,
      callbackUrl: "/student/sign-up",
      formType: "createAccount",
      accountType: "student",
      firstName,
      lastName,
      email,
      password,
      classCode,
      dateOfBirth,
    });
    setIsSubmitting(false);
    if (!result || result.error) {
      setErrorMsg("Unable to create account. Please verify your details.");
      return;
    }
    router.push("/jobviz?student=1");
  };

  return (
    <Layout
      title="Student Sign Up | Galactic Polymath"
      description="Create a lightweight student account to save JobViz favorites."
      url="/student/sign-up"
      canonicalLink="/student/sign-up"
      imgSrc=""
      imgAlt=""
      langLinks={[]}
    >
      <main className={styles.page}>
        <section className={styles.card}>
          <h1 className={styles.title}>Student sign up</h1>
          <p className={styles.subtitle}>
            Create an account to save your JobViz interests. No GP+ upsell for students.
          </p>
          {(errorMsg || externalError) && (
            <p className={styles.error}>
              {errorMsg ?? "Unable to complete sign up. Please try again."}
            </p>
          )}
          <form className={styles.form} onSubmit={handleSubmit}>
            <label className={styles.label}>
              First name
              <input
                className={styles.input}
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                required
              />
            </label>
            <label className={styles.label}>
              Last name
              <input
                className={styles.input}
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                required
              />
            </label>
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
                minLength={8}
              />
            </label>
            <label className={styles.label}>
              Date of birth
              <input
                className={styles.input}
                type="date"
                value={dateOfBirth}
                onChange={(event) => setDateOfBirth(event.target.value)}
                required
              />
            </label>
            <p className={styles.help}>
              You must be at least {MIN_AGE} years old to create a student account.
            </p>
            <label className={styles.label}>
              Class code (optional)
              <input
                className={styles.input}
                value={classCode}
                onChange={(event) => setClassCode(event.target.value)}
                placeholder="Example: BIO-7A"
              />
            </label>
            <div className={styles.actions}>
              <button className={styles.btnPrimary} type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create student account"}
              </button>
              <Link className={styles.btnSecondary} href="/student/login">
                I already have an account
              </Link>
            </div>
          </form>
        </section>
      </main>
    </Layout>
  );
}
