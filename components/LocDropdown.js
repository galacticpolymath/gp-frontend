/* eslint-disable no-console */
import React from 'react';
import ReactFlagsSelect from 'react-flags-select';

const locToCountry = { 'en-US': 'US', 'en-GB': 'GB', 'en-NZ': 'NZ', 'fr': 'FR', 'de': 'DE', 'it': 'IT', 'fr-AW': 'AW' };
const countryToLoc = { 'US': 'en-US', 'GB': 'en-GB', 'NZ': 'en-NZ', 'FR': 'fr', 'DE': 'de', 'IT': 'it', 'AW': 'fr-AW' };
const countriesByLanguage = [{ language: 'English', countries: ['US', 'GB', 'NZ'] }, { language: 'French', countries: ['FR', 'AW'] }, { language: 'German', countries: ['DE'] }, { language: 'Italian', countries: ['IT'] }];

const LocDropdown = ({ id, availLocs, loc }) => {

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

  if (countries.length === 1) {
    const { language } = countriesByLanguage.find(({ countries }) => countries.includes(countries[0]));

    return <div>{language} ({countries[0]})</div>;
  }

  // if the country is an english country, then show the following on the ui: English (abbreviation of the country)

  // const flag = <Flag name={loc} />
  // i can't get the flag to show up in the middle of a string

  return (
    <div>
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