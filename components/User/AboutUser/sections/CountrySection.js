/* eslint-disable react/jsx-indent */
/* eslint-disable quotes */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable indent */
import { useContext, useEffect, useState } from "react";
import Button from "../../../General/Button";
import { UserContext } from "../../../../providers/UserProvider";

const CountrySection = () => {
    const [countries, setCountries] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [isInputFocused, setIsInputFocused] = useState(false);
    const { _aboutUserForm } = useContext(UserContext);
    /** @type {[import("../../../../providers/UserProvider").TAboutUserForm, Function]} */
    const [aboutUserForm, setAboutUserForm] = _aboutUserForm;

    const handleOnInputFocus = () => {
        setIsInputFocused(true);
    };

    const handleCountrySelectionBtnClick = ({ target }) => {
        let aboutUserFormUpdated = { ...aboutUserForm };

        if (target.value.toLowerCase() !== 'united states') {
            aboutUserFormUpdated = {
                ...aboutUserFormUpdated,
                zipCode: '',
            };
        }

        setAboutUserForm({
            ...aboutUserFormUpdated,
            country: target.value,
        });
        setIsInputFocused(false);
    };

    const handleInputOnChange = ({ target }) => {
        setAboutUserForm(state => ({ ...state, country: target.value }));

        if (!target.value.length) {
            setSearchResults([]);
            return;
        }

        const searchedCountries = countries.filter(countryName => countryName.toLowerCase().includes(target.value.toLowerCase()));

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
                *Country:
            </label>
            <div className='position-relative'>
                <input
                    placeholder='Your country'
                    style={{ maxWidth: '400px' }}
                    className='aboutme-txt-input no-outline w-100 pt-1'
                    defaultValue={aboutUserForm.country}
                    value={aboutUserForm.country}
                    onChange={handleInputOnChange}
                    onFocus={handleOnInputFocus}
                />
                {isInputFocused && (
                    <div
                        id='searchResultsModal'
                        style={{ zIndex: 100, maxHeight: '400px', width: '100%' }}
                        className="position-absolute border bg-white rounded shadow overflow-scroll"
                    >
                        <section className='d-flex flex-column p-2'>
                            <h6>Common Selections: </h6>
                            <Button
                                value="United States"
                                handleOnClick={handleCountrySelectionBtnClick}
                                classNameStr="border-bottom no-btn-styles py-2 d-flex ps-2 border-bottom"
                            >
                                United States
                            </Button>
                            <Button
                                value="New Zealand"
                                handleOnClick={handleCountrySelectionBtnClick}
                                classNameStr="no-btn-styles py-2 d-flex ps-2"
                            >
                                New Zealand
                            </Button>
                        </section>
                        <section style={{ borderTop: 'solid 1.3px gray' }} className="d-flex flex-column p-2">
                            <h6>
                                Search Result(s):
                            </h6>
                            {searchResults?.length ? searchResults.map(country => {
                                return (
                                    <Button
                                        defaultStyleObj={{ width: '80%' }}
                                        key={country}
                                        value={country}
                                        handleOnClick={handleCountrySelectionBtnClick}
                                        classNameStr="ps-2 border-bottom no-btn-styles py-2 d-flex text-wrap"
                                    >
                                        {country}
                                    </Button>
                                );
                            })
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