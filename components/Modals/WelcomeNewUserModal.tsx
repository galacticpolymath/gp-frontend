import React, { useState } from "react";
import { resetUrl } from "../../globalFns";
import axios from "axios";
import { PRESENT_WELCOME_MODAL_PARAM_NAME } from "../../shared/constants";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { useSearchParams } from "next/navigation";
import useSiteSession from "../../customHooks/useSiteSession";
import WelcomeModal from "./WelcomeModal";

const WelcomeNewUserModal: React.FC = () => {
  const [isWelcomeModalDisplayed, setIsWelcomeModalDisplayed] = useState(false);
  const { status, token } = useSiteSession();
  const searchParams = useSearchParams();
  const [userFirstName, setUserFirstName] = useState("");
  const router = useRouter();

  useQuery({
    refetchOnWindowFocus: false,
    queryKey: [status],
    queryFn: async () => {
      if (
        status === "authenticated" &&
        searchParams.get(PRESENT_WELCOME_MODAL_PARAM_NAME) === "true" &&
        token
      ) {
        try {
          console.log("Fetching user name for welcome modal");

          const { data } = await axios.get<
            | {
                firstName: string;
                lastName: string;
              }
            | { msg: string }
          >("/api/get-user-name", {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });

          console.log("User name data: ", data);

          if ("firstName" in data && data.firstName) {
            setUserFirstName(data.firstName);
          }

          setIsWelcomeModalDisplayed(true);
          resetUrl(router);
        } catch (error) {
          console.error("Failed to display welcome modal. Reason: ", error);
        }
      }
    },
  });

  return (
    <WelcomeModal
      show={isWelcomeModalDisplayed}
      onHide={() => {
        setIsWelcomeModalDisplayed(false);
      }}
      userFirstName={userFirstName}
    />
  );
};

export default WelcomeNewUserModal;
