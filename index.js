const express = require("express");
const connection = require('./database.js');
const { google, cloudresourcemanager_v2beta1 } = require("googleapis");
const fs = require("fs");
const { getYesterday } = require('./data/yesterday.js');
const calculateFinalSum1 = require('./externalSum1.js');
const calculateFinalSum2 = require('./externalSum2.js');
const calculateFinalSum3 = require('./externalSum3.js');
const calculateFinalSum4 = require('./internalSum1.js');
const calculateFinalSum5 = require('./internalSum2.js');
const calculateFinalSum6 = require('./internalSum3.js');

const app = express();


const yesterday = getYesterday();


//1.无内部匹配房源的客户数（当日）
//猫咪头
let sum1_1; // Declare a variable to store the final sum
calculateFinalSum4()
  .then((finalSum) => {
    sum1_1 = finalSum; // Assign the resolved value to the 'sum' variable
    return finalSum;
  })
  .catch((error) => {
    console.error('Error calculating final sum:', error);
  });






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


    const count1_1 = await getCount(query2_1)-sum1_1;
    console.log("123")
    // const count1_2 = await getCount(query2_2)-sum1_2;
    // const count1_3 = await getCount(query2_3)-sum1_3;


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
      range: "KPI!A34",
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [[yesterday]],
      },
    });

    await googleSheets.spreadsheets.values.append({
      auth,
      spreadsheetId,
      range: "KPI!B36",
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [["猫咪头"]],
      },
    });

    await googleSheets.spreadsheets.values.append({
      auth,
      spreadsheetId,
      range: "KPI!B37",
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [["大黄"]],
      },
    });

    await googleSheets.spreadsheets.values.append({
      auth,
      spreadsheetId,
      range: "KPI!B38",
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [["鹅妈妈"]],
      },
    });


    await googleSheets.spreadsheets.values.append({
      auth,
      spreadsheetId,
      range: "KPI!C36",
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [[count1_1]],
      },
    });

    // await googleSheets.spreadsheets.values.append({
    //   auth,
    //   spreadsheetId,
    //   range: "KPI!C37",
    //   valueInputOption: "USER_ENTERED",
    //   resource: {
    //     values: [[count1_2]],
    //   },
    // });

    // await googleSheets.spreadsheets.values.append({
    //   auth,
    //   spreadsheetId,
    //   range: "KPI!C38",
    //   valueInputOption: "USER_ENTERED",
    //   resource: {
    //     values: [[count1_3]],
    //   },
    // });

  

    



    res.send("Data has been appended to the Google Sheet");
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(3000, () => console.log("running on 3000"));
