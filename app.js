const express = require("express");
const mysql = require("mysql");
const csvWriter = require("csv-write-stream");
const fs = require("fs");

const app = express();

const connection = mysql.createConnection({
  host: '119.3.241.33',
  user: 'my',
  password: 'Ggfpeitfklkimg@9527',
  database: 'yvrlinlihouse2023old',
  port: 3306,
  charset: 'utf8mb4',
});

// Establish MySQL connection
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL');

  const today = new Date().toISOString().split('T')[0];

  // Query to get UserId values
  const query = `
    SELECT UserId
    FROM \`customers\`
    WHERE CAST(datatime AS DATE) = '${today}'
      AND Assistant_name = '猫咪头'`;

  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error querying MySQL:', err);
      connection.end();
      return;
    }

    if (results.length === 0) {
      console.log('No results found for the query.');
      connection.end();
      return;
    }

    // Populate the userIdArray with UserId values
    const userIdArray = results.map(result => result.UserId);

    // Check and update the vancouver table
    let sum = 0;

    // Use a recursive function to handle asynchronous queries
    function processUserId(index) {
      if (index < userIdArray.length) {
        const userId = userIdArray[index];

        const checkQuery = `
          SELECT SUM(count) AS total_count
          FROM (
            SELECT COUNT(*) AS count
            FROM \`old_richmond_match\`
            WHERE UserId = '${userId}'
            UNION
            SELECT COUNT(*) AS count
            FROM \`old_vancouver_match\`
            WHERE UserId = '${userId}'
            UNION
            SELECT COUNT(*) AS count
            FROM \`old_coquitlam_match\`
            WHERE UserId = '${userId}'
            UNION
            SELECT COUNT(*) AS count
            FROM \`old_burnaby_match\`
            WHERE UserId = '${userId}'
            UNION
            SELECT COUNT(*) AS count
            FROM \`old_other_match\`
            WHERE UserId = '${userId}'
          ) AS subquery;`;

        connection.query(checkQuery, (err, checkResults) => {
          if (err) {
            console.error('Error checking old_vancouver_match table:', err);
            connection.end();
            return;
          }

          const total_count = checkResults[0].total_count;

          if (total_count > 0) {
            sum += 1;
          }

          // Continue processing the next UserId
          processUserId(index + 1);
        });
      } else {
        // All queries executed, now write sum to CSV
        const writer = csvWriter({ sendHeaders: false });
        const writableStream = fs.createWriteStream("test.csv", { flags: 'a' });

        writer.pipe(writableStream);
        writer.write({ sum }); // Write the sum value
        writer.end();

        writableStream.on("finish", () => {
          console.log("CSV file created successfully");
          connection.end();
        });
      }
    }

    // Start processing UserId values
    processUserId(0);
  });
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
