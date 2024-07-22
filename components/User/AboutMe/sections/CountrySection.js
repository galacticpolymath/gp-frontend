/* eslint-disable react/jsx-indent */
/* eslint-disable quotes */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable indent */

import { useEffect, useState } from "react";
import Button from "../../../General/Button";

const CountrySection = () => {
    const [countries, setCountries] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [isInputFocused, setIsInputFocused] = useState(false);

    const handleOnInputFocus = () => {
        setIsInputFocused(true);
    };

    const handleOnInputBlur = () => {
        setIsInputFocused(false);
    };

    const handleInputOnChange = ({ target }) => {
        if (!target.value.length) {
            setSearchResults([]);
            return;
        }

        const searchedCountries = countries.filter(countryName => countryName.includes(target.value));

        setSearchResults(searchedCountries);
    };

    useEffect(() => {
        (async () => {
            try {
                const response = await fetch('https://restcountries.com/v3.1/all?fields=name,flags');
                const responseBodyData = await response.json();

                if (responseBodyData?.length) {
                    const countryNames = responseBodyData.map(country => country.name.common);

                    countryNames.sort();

                    setCountries(countryNames);
                }
            } catch (error) {
                console.error('Failed to retrieve countries. Reason: ', error);
            }
        })();
    }, []);

    return (
        <section className='d-flex flex-column my-4 my-lg-0 col-8 col-lg-4'>
            <label htmlFor='country-input'>
                Country:
            </label>
            <div className='position-relative'>
                <input
                    placeholder='Your country'
                    style={{ maxWidth: '400px' }}
                    className='aboutme-txt-input no-outline w-100'
                    value={"hi"}
                    onChange={handleInputOnChange}
                    onFocus={handleOnInputFocus}
                    onBlur={handleOnInputBlur}
                />
                {isInputFocused && (
                    <div style={{ zIndex: 100, maxHeight: '400px', width: '100%' }} className="position-absolute border bg-white rounded shadow overflow-scroll">
                        <section className='d-flex flex-column p-2'>
                            <h6>Common Selections: </h6>
                            <Button classNameStr="border-bottom no-btn-styles py-2 d-flex ps-2 border-bottom">
                                United States
                            </Button>
                            <Button classNameStr="no-btn-styles py-2 d-flex ps-2">
                                New Zealand
                            </Button>
                        </section>
                        <section style={{ borderTop: 'solid 1.3px gray' }} className="d-flex flex-column p-2">
                            <h6>
                                Search Result(s):
                            </h6>
                            {searchResults?.length ? searchResults.map(country => (
                                <Button
                                    defaultStyleObj={{ width: '80%' }}
                                    key={country}
                                    classNameStr="ps-2 border-bottom no-btn-styles py-2 d-flex text-wrap"
                                >
                                    <span className="text-start">{country}</span>
                                </Button>
                            ))
                                :
                                <span className="ps-2" style={{ fontStyle: "italic" }}>Find your country.</span>
                            }
                        </section>
                    </div>
                )
                }
            </div>
        </section>
    );
};

export default CountrySection;