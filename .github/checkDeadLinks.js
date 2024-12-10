import { LinkChecker } from 'linkinator';

async function checkForDeadLinks() {
    // create a new `LinkChecker` that we'll use to run the scan.
    const checker = new LinkChecker();

    // Respond to the beginning of a new page being scanned
    checker.on('pagestart', url => {
        console.log(`Scanning ${url}`);
    });

    // After a page is scanned, check out the results!
    checker.on('link', result => {
        // check the specific url that was scanned
        console.log(`link of page:  ${result.parent}`);
        console.log(`url scanned:  ${result.url}`);
        console.log(`status code:  ${result.status}`);
        console.log(`link state:  ${result.state}`);
    });

    // Go ahead and start the scan! As events occur, we will see them above.
    const result = await checker.check({
        path: 'https://dev.galacticpolymath.com/',
        recurse: true,
        timeout: 8_000,
        retry: true,
        retryErrors: true,
        retryErrorsCount: 3,
        retryErrorsJitter: 5,
    });

    // Check to see if the scan passed!
    console.log(result.passed ? 'PASSED :D' : 'FAILED :(');

    // How many links did we scan?
    console.log(`Scanned total of ${result.links.length} links!`);

    // The final result will contain the list of checked links, and the pass/fail
    const brokeLinksCount = result.links.filter(link => link.state === 'BROKEN');
    console.log(`Detected ${brokeLinksCount.length} broken links.`);
}

checkForDeadLinks();