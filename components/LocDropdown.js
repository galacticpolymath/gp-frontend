/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
import React, { useState } from 'react';
import { useEffect } from 'react';
import ReactFlagsSelect from 'react-flags-select';
import Fade from './Fade';
import { AiOutlineClose } from 'react-icons/ai';

const locToCountry = { 'en-US': 'US', 'en-GB': 'GB', 'en-NZ': 'NZ', 'fr': 'FR', 'de': 'DE', 'it': 'IT', 'fr-AW': 'AW' };
const countryToLoc = { 'US': 'en-US', 'GB': 'en-GB', 'NZ': 'en-NZ', 'FR': 'fr', 'DE': 'de', 'IT': 'it', 'AW': 'fr-AW' };
const countriesByLanguage = [{ language: 'English', countries: ['US', 'GB', 'NZ'] }, { language: 'French', countries: ['FR', 'AW'] }, { language: 'German', countries: ['DE'] }, { language: 'Italian', countries: ['IT'] }];

const LocDropdown = ({ id, availLocs, loc }) => {
  const [isToolTipModalOn, setIsToolTipModalOn] = useState(true);
  const [timer, setTimer] = useState(null);

  let countries = [];
  let labels = {};
  availLocs.forEach((availLoc) => {
    const country = locToCountry[availLoc];
    countries.push(country);
    labels[country] = availLoc;
  });

  const changeLoc = (country, id) => {
    const locDest = countryToLoc[country];
    window.location = `/lessons/${locDest}/${id}`;
  };

  const handleCloseModal = () => {
    setIsToolTipModalOn(false);
    clearTimeout(timer);
  };

  useEffect(() => {
    let timer = setTimeout(() => {
      setIsToolTipModalOn(false);
    }, 3500);
    setTimer(timer);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  if (countries.length === 1) {
    const { language } = countriesByLanguage.find(({ countries }) => countries.includes(countries[0]));

    return <div>{language} ({countries[0]})</div>;
  }

  return (
    <div className="position-relative">
      <Fade containerId='clickMoreLocalesId' showElement={isToolTipModalOn}>
        <div className="position-absolute toolTipModal">
          <div className="w-100 h-100 position-relative">
            <button className='position-absolute noBtnStyles closeToolTipModalBtn' onClick={handleCloseModal}>
              <AiOutlineClose />
            </button>
            <div className="w-100 h-100 toolTipModalWrapper">
              <h5>
                Click for more locales!
              </h5>
            </div>
          </div>
        </div>
      </Fade>
      <ReactFlagsSelect
        selected={loc}
        countries={countries}
        customLabels={labels}
        onSelect={countryCode => {
          changeLoc(countryCode, id);
        }}
        placeholder={`Current locale: ${loc}`}
        alignOptionsToRight={true}
        fullWidth={false}
      />
    </div>
  );
};

export default LocDropdown;