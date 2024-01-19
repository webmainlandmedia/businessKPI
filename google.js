const express = require("express");
const { google, cloudresourcemanager_v2beta1 } = require("googleapis");
const mysql = require("mysql");
const fs = require("fs");
const calculateFinalSum1 = require('./externalSum1.js');
const calculateFinalSum2 = require('./externalSum2.js');

const app = express();

const connection = mysql.createConnection({
  host: '119.3.241.33',
  user: 'my',
  password: 'Ggfpeitfklkimg@9527',
  database: 'yvrlinlihouse2023old',
  port: 3306,
  charset: 'utf8mb4',
});

const today = new Date().toISOString().split('T')[0];

//1.无内部匹配房源的客户数（当日）
//猫咪头

//2.无外部匹配房源的客户数（当日）
//猫咪头
const query2_1 = 
  `
  SELECT COUNT(*)
  FROM \`customers\`
  WHERE CAST(datatime AS DATE) = '${today}'
    AND Assistant_name = '猫咪头'`;

let sum2_1; // Declare a variable to store the final sum
calculateFinalSum1()
  .then((finalSum) => {
    sum2_1 = finalSum; // Assign the resolved value to the 'sum' variable
    return finalSum;
  })
  .catch((error) => {
    console.error('Error calculating final sum:', error);
  });

//大黄
const query2_2 = 
  `
  SELECT COUNT(*)
  FROM \`customers\`
  WHERE CAST(datatime AS DATE) = '${today}'
    AND Assistant_name = '黄金猎犬，大黄'`
;
let sum2_2; // Declare a variable to store the final sum
calculateFinalSum2()
  .then((finalSum) => {
    sum2_2 = finalSum; // Assign the resolved value to the 'sum' variable
    return finalSum;
  })
  .catch((error) => {
    console.error('Error calculating final sum:', error);
  });

//3.新增注册用户数（当日）
// //猫咪头
const query3_1 = `
  SELECT COUNT(*)
  FROM \`UserForm\`
  WHERE CAST(Submission_Date AS DATE) = '${today}'
    AND Assistant_name = '猫咪头'`;

// //大黄
const query3_2 = `
  SELECT COUNT(*)
  FROM \`UserForm\`
  WHERE CAST(Submission_Date AS DATE) = '${today}'
    AND Assistant_name = '黄金猎犬，大黄'`;

//8.看房率（看房数量的客户/全部客户）
//9.未看房率（没有看房记录的客户/全部有效客户）
const query8_1 = `
SELECT COUNT(*) FROM \`UserForm\` WHERE rent_status = 'no'`;

const query8_2 = `
SELECT COUNT(*) FROM \`UserForm\` WHERE rent_status = '看房客户'`;

//10.外部匹配房源处理率（处理的房源/全部外部匹配房源）
const query9_1 = `
SELECT COUNT(*) FROM \`UserForm\` WHERE rent_status = 'no'AND need_help_with = '租房'`;

//12.未匹配小助手用户数（当日）
  const query12 = `
    SELECT COUNT(*)
    FROM \`customers\`
    WHERE Assistant_name IS NULL
      AND CAST(Submission_Date AS DATE) = '${today}'`;

//13.当天内部新增房源数（当日）
  const query13 = `
    SELECT COUNT(*)
    FROM \`landlord\`
    WHERE CAST(datatime AS DATE) = ${today} `;

app.get("/", async (req, res) => {
  try {
    const getCount = async (query) => {
      return new Promise((resolve, reject) => {
        connection.query(query, (err, results) => {
          if (err) {
            reject(err);
          } else {
            resolve(results[0]['COUNT(*)']);
          }
        });
      });
      
    };


    const count2_1 = await getCount(query2_1)-sum2_1;
    const count2_2 = await getCount(query2_2) -sum2_2;
    const count3_1 = await getCount(query3_1);
    const count3_2 = await getCount(query3_2);
    const count5_1 = 1 - count2_1/await getCount(query2_1);
    const count5_2 = 1 - count2_2/await getCount(query2_2);
    const count6 = 0;
    const count7 = 0;
    const count8_1 = await getCount(query8_1);
    const count8_2 = await getCount(query8_2);
    const count8 = count8_2/count8_1;
    const count9 = 1-count8;
    const count12 = await getCount(query12);
    const count13 = await getCount(query13);

    const auth = new google.auth.GoogleAuth({
      keyFile: "credentials.json",
      scopes: "https://www.googleapis.com/auth/spreadsheets",
    });

    const client = await auth.getClient();

    const googleSheets = google.sheets({ version: "v4", auth: client });

    const spreadsheetId = "15secBfkqHiqPD1s5xqbOeQ0u1S0-WKJXcH_wF36XOVg";

    await googleSheets.spreadsheets.values.append({
      auth,
      spreadsheetId,
      range: "KPI!A2",
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [[today]],
      },
    });

    await googleSheets.spreadsheets.values.append({
      auth,
      spreadsheetId,
      range: "KPI!B2",
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [["猫咪头"]],
      },
    });

    await googleSheets.spreadsheets.values.append({
      auth,
      spreadsheetId,
      range: "KPI!B3",
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [["大黄"]],
      },
    });

    await googleSheets.spreadsheets.values.append({
      auth,
      spreadsheetId,
      range: "KPI!D2",
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [[count2_1]],
      },
    });

    await googleSheets.spreadsheets.values.append({
      auth,
      spreadsheetId,
      range: "KPI!D3",
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [[count2_2]],
      },
    });
    

    await googleSheets.spreadsheets.values.append({
      auth,
      spreadsheetId,
      range: "KPI!E2",
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [[count3_1]],
      },
    });

    await googleSheets.spreadsheets.values.append({
      auth,
      spreadsheetId,
      range: "KPI!E3",
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [[count3_2]],
      },
    });

    await googleSheets.spreadsheets.values.append({
      auth,
      spreadsheetId,
      range: "KPI!G2",
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [[count5_1]],
      },
    });

    await googleSheets.spreadsheets.values.append({
      auth,
      spreadsheetId,
      range: "KPI!G3",
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [[count5_2]],
      },
    });

    await googleSheets.spreadsheets.values.append({
      auth,
      spreadsheetId,
      range: "KPI!H2",
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [[count6]],
      },
    });

    await googleSheets.spreadsheets.values.append({
      auth,
      spreadsheetId,
      range: "KPI!I2",
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [[count7]],
      },
    });

    await googleSheets.spreadsheets.values.append({
      auth,
      spreadsheetId,
      range: "KPI!J2",
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [[count8]],
      },
    });

    await googleSheets.spreadsheets.values.append({
      auth,
      spreadsheetId,
      range: "KPI!K2",
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [[count9]],
      },
    });

    await googleSheets.spreadsheets.values.append({
      auth,
      spreadsheetId,
      range: "KPI!N2",
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [[count12]],
      },
    });

    await googleSheets.spreadsheets.values.append({
      auth,
      spreadsheetId,
      range: "KPI!O2",
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [[count13]],
      },
    });

    



    res.send("Data has been appended to the Google Sheet");
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(3000, () => console.log("running on 3000"));
