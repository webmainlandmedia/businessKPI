const express = require("express");
const { google } = require("googleapis");
const mysql = require("mysql");
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

const today = new Date().toISOString().split('T')[0];

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

//12.未匹配小助手用户数（当日）
  const query12 = `
    SELECT COUNT(*)
    FROM \`customers\`
    WHERE Assistant_name IS NULL
      AND CAST(Submission_Date AS DATE) = '${today}'`;

//13.当天新增房源数（当日）
  const query13 = `
    SELECT COUNT(*)
    FROM \`new_houses\`
    WHERE CAST(data_time AS DATE) = '${today}'`;

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



    const count3_1 = await getCount(query3_1);
    const count3_2 = await getCount(query3_2);
    const count6 = 0;
    const count7 = 0;
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
        values: [["大黄"]],
      },
    });

    await googleSheets.spreadsheets.values.append({
      auth,
      spreadsheetId,
      range: "KPI!B3",
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [["猫咪头"]],
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
