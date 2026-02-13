import React, { useState } from 'react';
import axios from 'axios';
import { PRESENT_WELCOME_MODAL_PARAM_NAME } from '../../shared/constants';
import { useQuery } from '@tanstack/react-query';
import useSiteSession from '../../customHooks/useSiteSession';
import WelcomeModal from './WelcomeModal';
import { getSessionStorageItem, setSessionStorageItem } from '../../shared/fns';

const WelcomeNewUserModal: React.FC = () => {
  const [isWelcomeModalDisplayed, setIsWelcomeModalDisplayed] = useState(false);
  const { status, token } = useSiteSession();
  const [userFirstName, setUserFirstName] = useState('');

  useQuery({
    refetchOnWindowFocus: false,
    queryKey: [status],
    queryFn: async () => {
      if (typeof window === 'undefined') {
        return null;
      }

      const url = new URL(window.location.href);
      const wasWelcomeNewUserModalShown = getSessionStorageItem(
        'wasWelcomeNewUserModalShown'
      );

      if (
        status === 'authenticated' &&
        url.searchParams.get(PRESENT_WELCOME_MODAL_PARAM_NAME) === 'true' &&
        token &&
        !wasWelcomeNewUserModalShown
      ) {
        try {
          const { data } = await axios.get<
            | {
                firstName: string;
                lastName: string;
              }
            | { msg: string }
          >('/api/get-user-name', {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if ('firstName' in data && data.firstName) {
            setUserFirstName(data.firstName);
          }

          setIsWelcomeModalDisplayed(true);
          setSessionStorageItem('wasWelcomeNewUserModalShown', true);
        } catch (error) {
          console.error('Failed to display welcome modal. Reason: ', error);
        }
      }

      return null;
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
