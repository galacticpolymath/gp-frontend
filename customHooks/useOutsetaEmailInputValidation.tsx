import { useEffect, useState } from "react";
import useSiteSession from "./useSiteSession";
import CustomLink from "../components/CustomLink";
import { CONTACT_SUPPORT_EMAIL } from "../globalVars";
import { defautlNotifyModalVal, useModalContext } from "../providers/ModalProvider";
import { updateUser } from "../apiServices/user/crudFns";

const useOutsetaEmailInputValidation = () => {
  const { status, token, user } = useSiteSession();
  const { _notifyModal } = useModalContext();
  const [, setNotifyModal] = _notifyModal;

  useEffect(() => {
    if (status === "authenticated") {
      const observer = new MutationObserver((mutations) => {
        for (const _ of mutations) {
          const btnsContainer = document.querySelector(
            ".o--StickyActionRow--forceRow"
          );
          const emailInput = document.querySelector('[name="Person.Email"]') as HTMLInputElement | null;
          const token = (window as any).Outseta.getAccessToken();
          
          if (
            btnsContainer &&
            btnsContainer.firstChild?.nodeName === "BUTTON" &&
            emailInput?.value &&
            user?.email
          ) {
            (btnsContainer.firstChild as HTMLButtonElement).addEventListener(
              "click",
              async (event) => {
                event.preventDefault();
                const updateUserResponse = await updateUser(
                  { email: user.email as string },
                  { outsetaAccountEmail: emailInput?.value },
                  {},
                  token
                );

                if (!updateUserResponse?.wasSuccessful) {
                  setNotifyModal({
                    headerTxt: "An error has occurred",
                    bodyTxt: (
                      <>
                        An error has occurred while trying to update the user's
                        email. If this error persists, please contact{" "}
                        <CustomLink
                          hrefStr={CONTACT_SUPPORT_EMAIL}
                          className="ms-1 mt-2 text-break"
                        >
                          feedback@galacticpolymath.com
                        </CustomLink>
                        .
                      </>
                    ),
                    isDisplayed: true,
                    handleOnHide() {
                      setNotifyModal(defautlNotifyModalVal);
                      window.location.reload();
                    },
                  });
                  return;
                }
              }
            );
          } else if (btnsContainer && btnsContainer.firstChild?.nodeName) {
            (window as any).Outseta?.profile?.close();

            setNotifyModal({
              isDisplayed: true,
              headerTxt: "GP Plus data retrieval error",
              bodyTxt: (
                <>
                  Unable to retrieve your GP Plus email. If this error persists,
                  please contact{" "}
                  <CustomLink
                    hrefStr={CONTACT_SUPPORT_EMAIL}
                    className="ms-1 mt-2 text-break"
                  >
                    feedback@galacticpolymath.com
                  </CustomLink>
                  .
                </>
              ),
              handleOnHide: () => {
                setNotifyModal((state) => ({
                  ...state,
                  isDisplayed: false,
                }));
              },
            });
          }
        }
      });
      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }
  }, [status]);
};

export default useOutsetaEmailInputValidation;
