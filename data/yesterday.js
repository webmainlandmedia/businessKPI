const moment = require('moment');

// Function to get yesterday's date
function getYesterday() {
  return moment().subtract(1, 'day').format('YYYY-MM-DD');
}

// Export the function so it can be used in other files
module.exports = { getYesterday };