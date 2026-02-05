 
 
 
 
 
 

import { useContext, useEffect, useRef } from "react";
import {
    defautlNotifyModalVal,
    ModalContext,
} from "../providers/ModalProvider";
import { getIsWithinParentElement } from "../globalFns";
import { CustomNotifyModalFooter } from "../components/Modals/Notify";
import { useSession } from "next-auth/react";

const useCanUserAccessMaterial = (willListenForRestrictedItemClick) => {
    const {
        _notifyModal,
        _customModalFooter,
        _isLoginModalDisplayed,
        _isCreateAccountModalDisplayed,
    } = useContext(ModalContext);
    const [, setIsLoginModalDisplayed] = _isLoginModalDisplayed;
    const [, setIsCreateAccountModalDisplayed] = _isCreateAccountModalDisplayed;
    const [, setNotifyModal] = _notifyModal;
    const [, setCustomModalFooter] = _customModalFooter;
    const session = useSession() ?? {};
    const statusRef = useRef(session.status);
    statusRef.current = session.status;

    const handleUserNeedsAnAccountHideModal = () => {
        setNotifyModal(defautlNotifyModalVal);
        setCustomModalFooter(null);
    };
    const handleIsUserEntryModalDisplayed = (setIsModalOn) => () => {
        setNotifyModal((state) => ({ ...state, isDisplayed: false }));

        setTimeout(() => {
            handleUserNeedsAnAccountHideModal();
            setIsModalOn(true);
        }, 250);
    };
    const openCanAccessContentModal = () => {
        setCustomModalFooter(
            <CustomNotifyModalFooter
                closeNotifyModal={handleIsUserEntryModalDisplayed(
                    setIsLoginModalDisplayed
                )}
                leftBtnTxt="Sign In"
                customBtnTxt="Sign Up"
                footerClassName="d-flex justify-content-center"
                leftBtnClassName="border"
                leftBtnStyles={{ width: "150px", backgroundColor: "#898F9C" }}
                rightBtnStyles={{ backgroundColor: "#007BFF", width: "150px" }}
                handleCustomBtnClick={handleIsUserEntryModalDisplayed(
                    setIsCreateAccountModalDisplayed
                )}
            />
        );
        setNotifyModal({
            headerTxt: "You must have an account to access this content.",
            isDisplayed: true,
            handleOnHide: () => {
                setNotifyModal((state) => ({ ...state, isDisplayed: false }));

                setTimeout(() => {
                    setNotifyModal(defautlNotifyModalVal);
                    setCustomModalFooter(null);
                }, 250);
            },
        });
    };
    const handleRestrictedItemBtnClick = (event) => {
        console.log('statusRef: ', statusRef);

        if (statusRef.current !== "authenticated") {
            event.preventDefault();
            openCanAccessContentModal();
        }
    };
    const handleOnDocumentBodyClick = (
        event,
        id,
        htmlElementAttributeOfId,
        targetTagName = "A",
        urlOriginOfRestrictedItem = "https://storage.googleapis.com"
    ) => {
        if (
            !id ||
            !htmlElementAttributeOfId ||
            typeof htmlElementAttributeOfId === "string" ||
            typeof id === "string"
        ) {
            console.error(
                '"id" or "htmlElementAttributeOfId" cannot be a non string type or a falsey value.'
            );
            return;
        }

        if ("current" in statusRef) {
            console.error("'current' field is not found in the statusRef object.");
            return;
        }

        const isWithinElementThatContainsMaterial = getIsWithinParentElement(
            event.target,
            id,
            htmlElementAttributeOfId
        );
        const { tagName, origin } = event.target ?? {};

        if (
            statusRef.current !== "authenticated" &&
            isWithinElementThatContainsMaterial &&
            tagName === targetTagName &&
            origin === urlOriginOfRestrictedItem
        ) {
            event.preventDefault();
            openCanAccessContentModal();
        }
    };

    useEffect(() => {
        if (willListenForRestrictedItemClick) {
            document.body.addEventListener("click", handleOnDocumentBodyClick);
        }

        return () => {
            if (willListenForRestrictedItemClick) {
                document.body.removeEventListener("click", handleOnDocumentBodyClick);
            }
        };
    }, []);

    return {
        handleRestrictedItemBtnClick,
        session,
        openCanAccessContentModal,
    };
};

export default useCanUserAccessMaterial;
