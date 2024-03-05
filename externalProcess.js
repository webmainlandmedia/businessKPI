const express = require("express");
const mysql = require("mysql");

const app = express();

const connection = mysql.createConnection({
  host: '119.3.241.33',
  user: 'my',
  password: 'Ggfpeitfklkimg@9527',
  database: 'yvrlinlihouse2023old',
  port: 3306,
  charset: 'utf8mb4',
});

let finalSum;  // Variable to store the final sum

function calculateExternalProcess() {
  return new Promise((resolve, reject) => {
    connection.connect((err) => {
      if (err) {
        console.error('Error connecting to MySQL:', err);
        reject(err);
        return;
      }

      const query = `
        SELECT SUM(count) AS total_count
        FROM (
          SELECT COUNT(*) AS count
          FROM \`old_richmond_match\`
          WHERE match_level != ''
          UNION
          SELECT COUNT(*) AS count
          FROM \`old_vancouver_match\`
          WHERE match_level != ''
          UNION
          SELECT COUNT(*) AS count
          FROM \`old_coquitlam_match\`
          WHERE match_level != ''
          UNION
          SELECT COUNT(*) AS count
          FROM \`old_burnaby_match\`
          WHERE match_level != ''
          UNION
          SELECT COUNT(*) AS count
          FROM \`old_other_match\`
          WHERE match_level != ''
        ) AS subquery;`;

      connection.query(query, (err, results) => {
        if (err) {
          console.error('Error querying MySQL:', err);
          connection.end();
          reject(err);
          return;
        }

        finalSum = results[0].total_count;
        resolve(finalSum);
        connection.end();
      });
    });
  });
}


module.exports = calculateExternalProcess;
