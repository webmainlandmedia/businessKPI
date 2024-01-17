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

  //1.无内部匹配房源的客户数（当日）
    //猫咪头
    // const queries = [
    //   `
    //   SELECT UserId
    //   FROM \`customers\`
    //   WHERE CAST(datatime AS DATE) = '${today}'
    //     AND Assistant_name = '猫咪头'`,
    // ];
  


  //2.无外部匹配房源的客户数（当日）

  //3.新增注册用户数（当日）
  //猫咪头
  const query1 = `
  SELECT COUNT(*)
  FROM \`UserForm\`
  WHERE CAST(Submission_Date AS DATE) = '${today}'
    AND Assistant_name = '猫咪头'`;
  //大黄
  const query2 = `
  SELECT COUNT(*)
  FROM \`UserForm\`
  WHERE CAST(Submission_Date AS DATE) = '${today}'
    AND Assistant_name = '黄金猎犬，大黄'`;
  

  //4.部覆盖率（内部有匹配房源的客户/全部有效客户）

  //5.外部覆盖率（外部有匹配房源的客户/全部有效客户）

  //6.本周累计看房数

  //7.当日新增看房数

  //8.看房率（看房数量的客户/全部客户）

  //9.未看房率（没有看房记录的客户/全部有效客户）
  
  //10.外部匹配房源处理率（处理的房源/全部外部匹配房源）
  //11.内部匹配房源处理率（处理的房源/全部内部匹配房源）

  //12.未匹配小助手用户数（当日）
  const query3 = `SELECT COUNT(*) FROM \`customers\` WHERE Assistant_name IS NULL AND CAST(Submission_Date AS DATE) = '${today}'`;

  //13.当天新增房源数（当日）
  const query4 = `SELECT COUNT(*) FROM \`new_houses\` WHERE CAST(data_time AS DATE) = '${today}'`;

  // Execute the query
//   connection.query(query, (err, results) => {
//     if (err) {
//       console.error('Error querying MySQL:', err);
//       connection.end();
//       return;
//     }

//     if (results.length === 0) {
//       console.log('No results found for query 1.');
//       connection.end();
//       return;
//     }

//     // Create a CSV writer
//     const writer = csvWriter({ headers: Object.keys(results[0]) });
//     const writableStream = fs.createWriteStream("test.csv", { flags: 'a' });

//     // Pipe the query results to the CSV writer
//     writer.pipe(writableStream);
//     results.forEach(result => writer.write(result));
//     writer.end();

//     writableStream.on("finish", () => {
//       console.log("CSV file created successfully");

//       connection.end();
//     });
//   });
// });

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