import { useState, useEffect, } from 'react';
import {
  defautlNotifyModalVal,
  useModalContext,
} from '../providers/ModalProvider';
import { CONTACT_SUPPORT_EMAIL } from '../globalVars';
import CustomLink from '../components/CustomLink';
import {
  updateUser,
} from '../apiServices/user/crudFns';
import useSiteSession from './useSiteSession';

const useOutsetaInputValidation = () => {
  const { _notifyModal } = useModalContext();
  const [, setNotifyModal] = _notifyModal;
  const [isSignupModalDisplayed, setIsSignupModalDisplayed] = useState(false);
  const { token, status, user } = useSiteSession();
  const [didUserSignUp, setDidUserSignUp] = useState(false);

  const mututationCallback = (mutationsList: MutationRecord[]) => {
    let isGpPlusSignUpModalDisplayed = false;

    for (const mutation of mutationsList) {
      const element = mutation.target as HTMLElement;

      if (element.childNodes.length) {
        for (const childNode of Array.from(element.childNodes)) {
          if (
            (childNode as HTMLElement)?.classList?.contains('state-Register')
          ) {
            isGpPlusSignUpModalDisplayed = true;
          }
        }
      }
    }

    if (isGpPlusSignUpModalDisplayed) {
      const _emailInput = document.querySelector(
        'input[name="Person.Email"]'
      ) as HTMLInputElement | null;
      const _continueToCheckoutBtn = document.querySelector(
        '.o--Register--nextButton'
      ) as HTMLButtonElement | null;

      if (!_emailInput || !_continueToCheckoutBtn || !token || !user?.email) {
        setNotifyModal({
          headerTxt: 'An error has occurred',
          bodyTxt:
            'Unable to perform validation. The page will now be reloaded. Please try again.',
          isDisplayed: true,
          handleOnHide() {
            setNotifyModal(defautlNotifyModalVal);
            window.location.reload();
          },
        });
        setIsSignupModalDisplayed(false);
        return;
      }

      if (!user?.email) {
        setNotifyModal({
          headerTxt: 'An error has occurred',
          bodyTxt: (
            <>
              Unable to perform validation. The page will now be reloaded.
              Please try again. If this issue persists, please contact{' '}
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
        setIsSignupModalDisplayed(false);
        return;
      }

      let userGpAccountEmail = user?.email;

      _continueToCheckoutBtn.addEventListener('click', async (event) => {
        console.log('The continue button was clicked...');

        if ((event.target as HTMLButtonElement).disabled) {
          console.log('The button is disabled.');
          return;
        }

        const emailInput = document.querySelector('[name="Person.Email"]');
        const outsetaEmail = emailInput
          ? (emailInput as HTMLInputElement).value
          : '';

        console.log('outsetaEmail, sup there: ', outsetaEmail);

        if (!outsetaEmail) {
          setNotifyModal({
            headerTxt: 'An error has occurred',
            bodyTxt: (
              <>
                Unable to start your checkout session. If this error persists,
                please contact{' '}
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
          setIsSignupModalDisplayed(false);
          return;
        }

        const updateUserResponse = await updateUser(
          { email: userGpAccountEmail },
          { outsetaAccountEmail: outsetaEmail },
          {},
          token
        );

        console.log('updateUserResponse: ', updateUserResponse);

        if (!updateUserResponse?.wasSuccessful) {
          setNotifyModal({
            headerTxt: 'An error has occurred',
            bodyTxt: (
              <>
                An error has occurred while trying to update the user&apos;s email.
                If this error persists, please contact{' '}
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
          setIsSignupModalDisplayed(false);
          return;
        }
      });
    }
  };

  useEffect(() => {
    let observer: MutationObserver | undefined;
    console.log('The current status: ', status);
    if (status === 'authenticated') {
      console.log('will watch the dom...');
      observer = new MutationObserver(mututationCallback);
      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }

    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, [status]);

  return {
    _isSignupModalDisplayed: [
      isSignupModalDisplayed,
      setIsSignupModalDisplayed,
    ],
    _didUserSignUp: [didUserSignUp, setDidUserSignUp],
  } as const;
};

export default useOutsetaInputValidation;
