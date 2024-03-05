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

function processUserId(index, userIdArray) {
  return new Promise((resolve, reject) => {
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
          console.error('Error checking tables:', err);
          reject(err);
          return;
        }

        const total_count = checkResults[0].total_count;

        const isMatched = total_count > 0;

        // Continue processing the next UserId
        processUserId(index + 1, userIdArray)
          .then((nextSum) => resolve(nextSum + (isMatched ? 1 : 0)))
          .catch(reject);
      });
    } else {
      // All queries executed, resolve the promise with the sum value
      resolve(0);
    }
  });
}

function calculateFinalSum() {
  return new Promise((resolve, reject) => {
    connection.connect((err) => {
      if (err) {
        console.error('Error connecting to MySQL:', err);
        reject(err);
        return;
      }
    

      const today = '2024-02-14';

      const query = `
        SELECT UserId
        FROM \`customers\`
        WHERE CAST(datatime AS DATE) = '${today}'
          AND Assistant_name = '猫咪头'`;

      connection.query(query, (err, results) => {
        if (err) {
          console.error('Error querying MySQL:', err);
          connection.end();
          reject(err);
          return;
        }

        if (results.length === 0) {
          console.log('No results found for the query.');
          connection.end();
          resolve(0);
          return;
        }

        const userIdArray = results.map(result => result.UserId);

        processUserId(0, userIdArray)
          .then((result) => {
            finalSum = result;
            resolve(finalSum);
            connection.end();
          })
          .catch((error) => {
            console.error('Error processing UserId values:', error);
            connection.end();
            reject(error);
          });
      });
    });
  });
}

module.exports = calculateFinalSum;