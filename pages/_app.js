import { ModalProvider } from "../providers/ModalProvider";
import { LessonsCarouselProvider } from "../providers/LessonsCarouselProvider";
import ModalsContainer from "../ModalsContainer";
import { GoogleAnalytics } from "nextjs-google-analytics";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import "../styles/pages/gpPlus.scss";
import "./style.scss";
import "../styles/pages/Lessons/lessons.scss";
import "../styles/pages/JobViz/jobviz-page.scss";
import "../styles/icons/icons.scss";
import "../styles/comps/carousel.scss";
import "../styles/comps/modal.scss";
import "../styles/pages/home.scss";
import "../styles/modals/signUp.scss";
import "../styles/pages/JobViz/heros/gp-plus-user.scss";
import "../styles/pages/JobViz/heros/free-user.scss";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { useEffect, useState } from "react";
import { UserProvider } from "../providers/UserProvider";
import { LessonProvider } from "../providers/LessonProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GoogleDrivePickerProvider } from "@geniux/google-drive-picker-react";


import { CookiesProvider } from "react-cookie";
import CookieConsentBanner, {
  COOKIE_CONSENT_STORAGE_KEY,
} from "../components/CookieConsentBanner";

const queryClient = new QueryClient();

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  const [cookieConsentStatus, setCookieConsentStatus] = useState(null);

  useEffect(() => {
    import("bootstrap/dist/js/bootstrap.bundle.min.js").catch(() => {});

    if (typeof window === "undefined") {
      return;
    }

    const savedPreference = window.localStorage.getItem(
      COOKIE_CONSENT_STORAGE_KEY
    );

    if (savedPreference === "granted" || savedPreference === "denied") {
      setCookieConsentStatus(savedPreference);
    }
  }, []);

  const handleCookieDecision = (nextStatus) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, nextStatus);

      if (typeof window.gtag === "function") {
        window.gtag("consent", "update", {
          analytics_storage: nextStatus === "granted" ? "granted" : "denied",
        });
      }
    }

    setCookieConsentStatus(nextStatus);
  };

  return (
    <>
      {cookieConsentStatus === "granted" && (
        <GoogleAnalytics gaMeasurementId="G-8B58Y7HD3T" trackPageViews />
      )}
      <SessionProvider session={session}>
        <LessonsCarouselProvider>
          <UserProvider>
            <LessonProvider>
              <ModalProvider>
                <QueryClientProvider client={queryClient}>
                  <CookiesProvider>
                    <GoogleDrivePickerProvider
                      clientId={
                        process.env
                          .NEXT_PUBLIC_GOOGLE_DRIVE_PROJECT_CLIENT_ID_TEST
                      }
                      apiKey={process.env.NEXT_PUBLIC_GOOGLE_DRIVE_AUTH_API_KEY}
                    >
                      <Toaster />
                      <Component {...pageProps} />
                      <ModalsContainer />
                      <CookieConsentBanner
                        consentStatus={cookieConsentStatus}
                        onDecision={handleCookieDecision}
                      />
                    </GoogleDrivePickerProvider>
                  </CookiesProvider>
                </QueryClientProvider>
              </ModalProvider>
            </LessonProvider>
          </UserProvider>
        </LessonsCarouselProvider>
      </SessionProvider>
    </>
  );
}

export default MyApp;
