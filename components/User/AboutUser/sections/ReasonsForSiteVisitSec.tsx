/* eslint-disable indent */

import React from 'react';
import { TAboutUserFormForUI } from '../../../../providers/UserProvider';
import { TUseStateReturnVal } from '../../../../types/global';

const SITE_VISIT_REASONS = [
  'interdisciplinary lessons',
  'lessons connected to research',
  'culturally responsive lessons',
  'free resources',
];

interface IProps {
  _aboutUserForm: TUseStateReturnVal<TAboutUserFormForUI>;
  handleFocusRelatedEvent: (isInputFocused: boolean) => () => void;
}

const ReasonsForSiteVisitSec = ({
  _aboutUserForm,
  handleFocusRelatedEvent,
}: IProps) => {
  const [aboutUserForm, setAboutUserForm] = _aboutUserForm;

  const handleWhatBringsYouToSiteInputChange =
    <
      TElement extends HTMLInputElement | HTMLTextAreaElement = HTMLInputElement
    >() =>
    (event: React.ChangeEvent<TElement>) => {
      if (event.target.name === 'reason-for-visit-custom') {
        setAboutUserForm({
          ...aboutUserForm,
          siteVisitReasonsCustom: event.target.value,
        });
        return;
      }

      const siteVisitReasonsDefault = aboutUserForm?.siteVisitReasonsDefault
        ?.length
        ? [...(aboutUserForm?.siteVisitReasonsDefault as string[])]
        : [];
      const siteVisitReasonsDefaultSet = new Set(siteVisitReasonsDefault);

      if ('checked' in event.target && event.target.checked) {
        siteVisitReasonsDefaultSet.add(event.target.value);
      } else {
        siteVisitReasonsDefaultSet.delete(event.target.value);
      }

      setAboutUserForm({
        ...aboutUserForm,
        siteVisitReasonsDefault: Array.from(siteVisitReasonsDefaultSet),
      });
    };

  const handleOtherCheckBoxToggle = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.checked) {
      setAboutUserForm((state) => ({
        ...state,
        siteVisitReasonsCustom: '',
      }));
      return;
    }

    setAboutUserForm((state) => ({
      ...state,
      siteVisitReasonsCustom: null,
    }));
  };

  const selectedReasons =
    (aboutUserForm.siteVisitReasonsDefault &&
      new Set(aboutUserForm.siteVisitReasonsDefault)) ??
    (aboutUserForm.reasonsForSiteVisit instanceof Map &&
      aboutUserForm.reasonsForSiteVisit);
  let customReason =
    aboutUserForm.reasonsForSiteVisit &&
    aboutUserForm.reasonsForSiteVisit instanceof Map
      ? aboutUserForm.reasonsForSiteVisit.get('reason-for-visit-custom')
      : null;

  if (
    typeof aboutUserForm.siteVisitReasonsCustom === 'string' ||
    aboutUserForm.siteVisitReasonsCustom == null
  ) {
    customReason = aboutUserForm.siteVisitReasonsCustom;
  }

  return (
    <section className='d-flex flex-column mt-2 mt-4 mt-lg-3'>
      <label htmlFor='reasonsForSiteVisit'>What brings you to our site?</label>
      <section className='d-flex flex-column flex-lg-row ps-2'>
        {SITE_VISIT_REASONS.map((opt, index) => {
          const name = `reason-for-visit-${index}`;
          let isChecked = false;

          if (
            selectedReasons instanceof Set ||
            selectedReasons instanceof Map
          ) {
            isChecked = selectedReasons.has(opt);
          }

          return (
            <div
              key={index}
              className={`d-flex mt-2 mt-sm-0 ${index === 0 ? '' : 'ms-lg-3'}`}
            >
              <input
                type='checkbox'
                value={opt}
                name={name}
                onChange={handleWhatBringsYouToSiteInputChange()}
                checked={isChecked}
              />
              <span className='capitalize ms-1'>{opt}</span>
            </div>
          );
        })}
      </section>
      <section className='d-flex flex-column ps-2'>
        <section className='d-flex'>
          <input
            type='checkbox'
            name='subject'
            className='pointer'
            onChange={handleOtherCheckBoxToggle}
            checked={customReason !== null}
          />
          <span className='ms-1'>Other:</span>
        </section>
        <textarea
          disabled={typeof customReason !== 'string'}
          id='reasonsForSiteVisit'
          name='reason-for-visit-custom'
          style={{
            outline: 'none',
            height: '115px',
          }}
          className={`rounded about-me-input-border about-user-textarea p-1 mt-2 ${
            typeof customReason !== 'string' ? 'opacity-25' : ''
          }`}
          placeholder='Your response...'
          value={customReason ?? ''}
          onChange={handleWhatBringsYouToSiteInputChange<HTMLTextAreaElement>()}
          onFocus={handleFocusRelatedEvent(true)}
          onBlur={handleFocusRelatedEvent(false)}
        />
      </section>
    </section>
  );
};

export default ReasonsForSiteVisitSec;