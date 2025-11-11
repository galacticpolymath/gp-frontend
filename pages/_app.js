import { useEffect } from "react";
import { ModalProvider } from "../providers/ModalProvider";
import { LessonsCarouselProvider } from "../providers/LessonsCarouselProvider";
import ModalsContainer from "../ModalsContainer";
import { GoogleAnalytics } from "nextjs-google-analytics";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import "../styles/pages/gpPlus.scss";
import "./style.scss";
import "../styles/pages/HireUs/hireUs.scss";
import "../styles/pages/Lessons/lessons.scss";
import "../styles/pages/JobViz/jobviz-page.scss";
import "../styles/icons/icons.scss";
import "../styles/comps/carousel.scss";
import "../styles/comps/modal.scss";
import "../styles/pages/home.scss";
import "../styles/pages/About/about.scss";
import "../styles/modals/signUp.scss";
import "../styles/pages/JobViz/heros/gp-plus-user.scss";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { UserProvider } from "../providers/UserProvider";
import { LessonProvider } from "../providers/LessonProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GoogleDrivePickerProvider } from "@geniux/google-drive-picker-react";


import { CookiesProvider } from "react-cookie";

const queryClient = new QueryClient();

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  useEffect(() => {
    import("bootstrap/dist/js/bootstrap");
  }, []);

  return (
    <>
      <GoogleAnalytics gaMeasurementId="G-8B58Y7HD3T" trackPageViews />
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
