import { LinkChecker } from "linkinator";
import ExcelJS from "exceljs";
import fs from "fs";
import { sendEmailWithRetries } from "./backend/services/emailServices";

const EXCEL_SHEET_FILE_NAME = "DeadLinksCheckResult.xlsx";

const formatNum = (num) => (num.toString().length === 1 ? `0${num}` : `${num}`);

const getCurrentDate = (
    isMilitary = false,
    separator = ".",
    willGetOnlyDate = false
) => {
    const dateObj = new Date();
    const month = formatNum(dateObj.getUTCMonth() + 1);
    const day = formatNum(dateObj.getUTCDay() + 1);
    const year = dateObj.getFullYear();

    if (willGetOnlyDate) {
        return `${month}${separator}${day}${separator}${year}`;
    }

    let hours = dateObj.getHours();
    hours = formatNum(hours > 12 ? hours - 12 : hours);
    const minutes = formatNum(dateObj.getMinutes());

    if (isMilitary) {
        return `${month}${separator}${day}${separator}${year} ${hours}:${minutes}`;
    }

    const timeOfDay = dateObj.getHours() > 12 ? "pm" : "am";

    return `${month}${separator}${day}${separator}${year} ${hours}:${minutes}${timeOfDay}`;
};

/**
 * Generates an Excel worksheet summarizing the results of a dead links check.
 *
 * @param {{ parent: string, url: string, code: number }[]} deadLinks - An array of dead link objects, each containing information about the link.
 *
 * This function creates an Excel worksheet with a title that includes the
 * date of the check. It adds column headers for "Checked Link", "Link Location",
 * and "Status", and styles them with bold font and centered alignment. The
 * columns are set to a specific width to accommodate the data.
 */
async function createDeadLinksResultsExcelSheet(deadLinks, currentDateStr) {
    console.log("will createt dead links results");
    console.log("deadLinks length: ", deadLinks.length);
    const workBook = new ExcelJS.Workbook();
    const workSheetTitle = `Dead links check on ${getCurrentDate(
        true,
        ".",
        true
    )}`;
    console.log("workSheetTitle: ", workSheetTitle);
    const worksheet = workBook.addWorksheet(workSheetTitle);
    console.log("workBook: ", workBook);
    worksheet.mergeCells("A1:B1:C1");
    const titleCell = worksheet.getCell("A1");
    titleCell.value = `Dead links check on ${currentDateStr}`;
    titleCell.font = { size: 20, bold: true };

    // Add column headers
    worksheet.getCell("A2").value = "Checked Link";
    worksheet.getCell("B2").value = "Link Location";
    worksheet.getCell("C2").value = "Status";
    worksheet.getCell("D2").value = "Code";

    // Style column headers
    ["A2", "B2", "C2", "D2"].forEach((cell) => {
        worksheet.getCell(cell).font = { size: 15, bold: true };
    });

    worksheet.columns = [{ width: 70 }, { width: 70 }];

    for (const [index, { code, url, parent }] of deadLinks.entries()) {
        const row = index + 3;
        const statusCell = worksheet.getCell(`C${row}`);
        worksheet.getCell(`A${row}`).value = url;
        worksheet.getCell(`B${row}`).value = parent;
        statusCell.value = "BROKEN";
        statusCell.font = { color: { argb: "ff0000" } };
        worksheet.getCell(`D${row}`).value = code;
    }

    try {
        workBook.xlsx.writeFile(EXCEL_SHEET_FILE_NAME);
    } catch (error) {
        console.log("Error creating Excel file: ", error);
    }
}

async function checkForDeadLinks() {
    const checker = new LinkChecker();

    // Respond to the beginning of a new page being scanned
    checker.on("pagestart", (url) => {
        console.log(`Scanning ${url}`);
    });

    // Respond to a link being scanned
    checker.on("link", (result) => {
        console.log(`link of page:  ${result.parent}`);
        console.log(`url scanned:  ${result.url}`);
        console.log(`status code:  ${result.status}`);
        console.log(`link state:  ${result.state}`);
    });

    const result = await checker.check({
        path: "http://localhost:3000/",
        recurse: true,
        timeout: 7_000,
        retryErrors: true,
        retryErrorsCount: 3,
        retryErrorsJitter: 5,
        linksToSkip(link) {
            const url = new URL(link);

            return url.pathname === "/_next/image";
        }
    });

    console.log(result.passed ? "PASSED :D" : "FAILED :(");

    console.log(`Scanned total of ${result.links.length} links!`);

    return result.links.filter((link) => link.state === "BROKEN");
}

(async () => {
    try {
        const allLinks = await checkForDeadLinks();
        let deadLinks = allLinks.filter((link) => link.state === "BROKEN")
        const currentDateStr = getCurrentDate(true, "/");
        const text = deadLinks.length
            ? `A git push has been made. Dead links check has been executed. A total of ${allLinks.length} ${allLinks.length == 1 ? "link" : "links"
            } ${allLinks.length == 1 ? "was" : "were"
            } scanned. There ${deadLinks.length == 1 ? "is" : "are"
            } ${deadLinks.length} dead ${deadLinks.length == 1 ? "link" : "links"
            }. See attached file.`
            : `A git push has been made. Dead links check has been executed. A total of ${allLinks.length} ${allLinks.length == 1 ? "link" : "links"
            } ${allLinks.length == 1 ? "was" : "were"
            } scanned.  No dead links found.`;
        console.log("text: ", text);
        let attachments = [];

        if (deadLinks.length) {
            deadLinks = deadLinks.map(deadLink => {
                const urlParentConstructor = new URL(deadLink.parent);
                const scannedUrlConstructor = new URL(deadLink.url);
                const newParentUrl = `https://dev.galacticpolymath.com${urlParentConstructor.pathname}`;

                if (scannedUrlConstructor.host === "localhost") {
                    const newScannedUrl = `https://dev.galacticpolymath.com${scannedUrlConstructor.pathname}`;

                    return {
                        ...deadLink,
                        parent: newParentUrl,
                        url: newScannedUrl
                    }
                }

                return {
                    ...deadLink,
                    parent: newParentUrl
                }
            })
            await createDeadLinksResultsExcelSheet(
                deadLinks,
                currentDateStr
            );
            attachments = [
                {
                    filename: EXCEL_SHEET_FILE_NAME,
                    path: EXCEL_SHEET_FILE_NAME,
                },
            ];
        }

        const { wasSuccessful } = await sendEmailWithRetries({
            from: "shared@galacticpolymath.com",
            to: "gtorionnotion@gmail.com",
            subject: `Deads Links Check On ${currentDateStr}`,
            text,
            attachments,
        });

        if (!wasSuccessful) {
            throw new Error("Email failed to be sent.");
        }
    } catch (error) {
        console.log("Error checking for dead links: ", error);
    } finally {
        if (fs.existsSync(EXCEL_SHEET_FILE_NAME)) {
            fs.unlinkSync(EXCEL_SHEET_FILE_NAME);
        }
    }
})();
