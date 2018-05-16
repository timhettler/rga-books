import config from "../config";
/**
 * Load the data from the spreadsheet
 * Get the right values from it and assign.
 */
export function load(callback) {
  window.gapi.client.load("sheets", "v4", () => {
    window.gapi.client.sheets.spreadsheets.values
      .get({
        spreadsheetId: config.spreadsheetId,
        range: "results"
      })
      .then(
        response => {
          const data = response.result.values || [];
          callback(parseBookData(data));
        },
        response => {
          callback(false, response.result.error);
        }
      );
  });
}

function parseBookData(data) {
  // Remove header row and convert to object
  return data.slice(1).map(book => ({
    id: book[0],
    title: book[1],
    discipline: book[2],
    note: book[3],
    submitDate: book[5],
    amazonUrl: book[7],
    imageUrl: book[8]
  }));
}
