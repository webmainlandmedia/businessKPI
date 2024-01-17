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

  //3.新增注册用户数（当日）
  // //猫咪头
  const query1 = `
    SELECT COUNT(*)
    FROM \`UserForm\`
    WHERE CAST(Submission_Date AS DATE) = '${today}'
      AND Assistant_name = '猫咪头'`;
  // //大黄
  const query2 = `
    SELECT COUNT(*)
    FROM \`UserForm\`
    WHERE CAST(Submission_Date AS DATE) = '${today}'
      AND Assistant_name = '黄金猎犬，大黄'`;

  //12.未匹配小助手用户数（当日）
  const query3 = `
    SELECT COUNT(*)
    FROM \`customers\`
    WHERE Assistant_name IS NULL
      AND CAST(Submission_Date AS DATE) = '${today}'`;

  //13.当天新增房源数（当日）
  const query4 = `
    SELECT COUNT(*)
    FROM \`new_houses\`
    WHERE CAST(data_time AS DATE) = '${today}'`;

  const queries = [query1, query2, query3, query4];

  const writer = csvWriter({ sendHeaders: false });
  const writableStream = fs.createWriteStream("test.csv", { flags: 'a' });

  // Pipe the CSV writer to the file
  writer.pipe(writableStream);

  // Execute queries sequentially
  executeQueriesSequentially(0);

  function executeQueriesSequentially(index) {
    if (index < queries.length) {
      const query = queries[index];

      connection.query(query, (err, results) => {
        if (err) {
          console.error('Error querying MySQL:', err);
          connection.end();
          return;
        }

        if (results.length === 0) {
          console.log(`No results found for query ${index + 1}.`);
        } else {
          // Write results to CSV
          results.forEach(result => writer.write(result));
        }

        // Move on to the next query
        executeQueriesSequentially(index + 1);
      });
    } else {
      // All queries executed, end the CSV writing process
      writer.end();

      writableStream.on("finish", () => {
        console.log("CSV file created successfully");
        connection.end();
      });
    }
  }
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});