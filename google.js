const express = require("express");
const connection = require('./database.js');
const { google, cloudresourcemanager_v2beta1 } = require("googleapis");
// const { getYesterday } = require('./dateUtils');
const fs = require("fs");
const calculateFinalSum1 = require('./externalSum1.js');
const calculateFinalSum2 = require('./externalSum2.js');
const calculateFinalSum3 = require('./externalSum3.js');
const calculateFinalSum4 = require('./internalSum1.js');
const calculateFinalSum5 = require('./internalSum2.js');
const calculateFinalSum6 = require('./internalSum3.js');
const calculateExternalProcess = require('./externalProcess.js');
const calculateInternalProcess = require('./internalProcess.js');
const totalInternal = require('./totalInternal.js');
const totalExternal = require('./totalExternal.js');


const app = express();


const today = '2024-03-05';

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

  //大黄
let sum1_2; // Declare a variable to store the final sum
calculateFinalSum5()
  .then((finalSum) => {
    sum1_2 = finalSum; // Assign the resolved value to the 'sum' variable
    return finalSum;
  })
  .catch((error) => {
    console.error('Error calculating final sum:', error);
  });

    //加拿大鹅妈妈
let sum1_3; // Declare a variable to store the final sum
calculateFinalSum6()
  .then((finalSum) => {
    sum1_3 = finalSum; // Assign the resolved value to the 'sum' variable
    return finalSum;
  })
  .catch((error) => {
    console.error('Error calculating final sum:', error);
  });





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

  //加拿大鹅妈妈
  const query2_3 = 
  `
  SELECT COUNT(*)
  FROM \`customers\`
  WHERE CAST(datatime AS DATE) = '${today}'
    AND Assistant_name = '加拿大鹅妈妈'`;
let sum2_3; // Declare a variable to store the final sum
calculateFinalSum3()
  .then((finalSum) => {
    sum2_3 = finalSum; // Assign the resolved value to the 'sum' variable
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

// //加拿大鹅妈妈
const query3_3 = `
SELECT COUNT(*)
FROM \`UserForm\`
WHERE CAST(Submission_Date AS DATE) = '${today}'
  AND Assistant_name = '加拿大鹅妈妈'`;

//8.看房率（看房数量的客户/全部客户）
//9.未看房率（没有看房记录的客户/全部有效客户）
const query8_1 = `
SELECT COUNT(*) FROM \`UserForm\` WHERE rent_status = 'no'`;

const query8_2 = `
SELECT COUNT(*) FROM \`UserForm\` WHERE rent_status = '看房客户'`;

//10.外部匹配房源处理率（处理的房源/全部外部匹配房源）
let sum10; // Declare a variable to store the final sum
calculateExternalProcess()
  .then((finalSum) => {
    sum10 = finalSum; // Assign the resolved value to the 'sum' variable
    return finalSum;
  })
  .catch((error) => {
    console.error('Error calculating final sum:', error);
  });

  let sum10_1; // Declare a variable to store the final sum
totalExternal()
  .then((finalSum) => {
    sum10_1 = finalSum; // Assign the resolved value to the 'sum' variable
    return finalSum;
  })
  .catch((error) => {
    console.error('Error calculating final sum:', error);
  });

  //11.内部匹配房源处理率（处理的房源/全部内部匹配房源）
  let sum11; // Declare a variable to store the final sum
calculateInternalProcess()
  .then((finalSum) => {
    sum11 = finalSum; // Assign the resolved value to the 'sum' variable
    return finalSum;
  })
  .catch((error) => {
    console.error('Error calculating final sum:', error);
  });

  let sum11_1; // Declare a variable to store the final sum
  totalInternal()
    .then((finalSum) => {
      sum11_1 = finalSum; // Assign the resolved value to the 'sum' variable
      return finalSum;
    })
    .catch((error) => {
      console.error('Error calculating final sum:', error);
    });
  
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
    WHERE CAST(creatingtime AS DATE) = ${today} `;

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
    const count1_2 = await getCount(query2_2)-sum1_2;
    const count1_3 = await getCount(query2_3)-sum1_3;
    const count2_1 = await getCount(query2_1)-sum2_1;
    const count2_2 = await getCount(query2_2) -sum2_2;
    const count2_3 = await getCount(query2_3) -sum2_3;
    const count3_1 = await getCount(query3_1);
    const count3_2 = await getCount(query3_2);
    const count3_3 = await getCount(query3_3);
    const count4_1 = (100 - count1_1/await getCount(query2_1)* 100).toFixed(2);
    const count4_2 = (100 - count1_2/await getCount(query2_2)* 100).toFixed(2);
    const count4_3 = (100 - count1_3/await getCount(query2_3)* 100).toFixed(2);
    const count5_1 = (100 - count2_1/await getCount(query2_1)* 100).toFixed(2);
    const count5_2 = (100 - count2_2/await getCount(query2_2)* 100).toFixed(2);
    const count5_3 = (100 - count2_3/await getCount(query2_3)* 100).toFixed(2);
    const count6 = 0;
    const count7 = 0;
    const count8_1 = await getCount(query8_1);
    const count8_2 = await getCount(query8_2);
    const count8 = (count8_2/count8_1* 100).toFixed(2);
    const count9 = 100-count8;
    const count10 = (sum10 / sum10_1 * 100).toFixed(2);
    const count11 = (sum11 / sum11_1 * 100).toFixed(2);
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
      range: "KPI!A66",
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [[today]],
      },
    });

    await googleSheets.spreadsheets.values.append({
      auth,
      spreadsheetId,
      range: "KPI!B66",
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [["猫咪头"]],
      },
    });

    await googleSheets.spreadsheets.values.append({
      auth,
      spreadsheetId,
      range: "KPI!B67",
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [["大黄"]],
      },
    });

    await googleSheets.spreadsheets.values.append({
      auth,
      spreadsheetId,
      range: "KPI!B68",
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [["鹅妈妈"]],
      },
    });


    await googleSheets.spreadsheets.values.append({
      auth,
      spreadsheetId,
      range: "KPI!C66",
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [[count1_1]],
      },
    });

    await googleSheets.spreadsheets.values.append({
      auth,
      spreadsheetId,
      range: "KPI!C67",
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [[count1_2]],
      },
    });

    await googleSheets.spreadsheets.values.append({
      auth,
      spreadsheetId,
      range: "KPI!C68",
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [[count1_3]],
      },
    });

    await googleSheets.spreadsheets.values.append({
      auth,
      spreadsheetId,
      range: "KPI!D66",
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [[count2_1]],
      },
    });

    await googleSheets.spreadsheets.values.append({
      auth,
      spreadsheetId,
      range: "KPI!D67",
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [[count2_2]],
      },
    });

    await googleSheets.spreadsheets.values.append({
      auth,
      spreadsheetId,
      range: "KPI!D68",
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [[count2_3]],
      },
    });
    

    await googleSheets.spreadsheets.values.append({
      auth,
      spreadsheetId,
      range: "KPI!E66",
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [[count3_1]],
      },
    });

    await googleSheets.spreadsheets.values.append({
      auth,
      spreadsheetId,
      range: "KPI!E67",
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [[count3_2]],
      },
    });

    await googleSheets.spreadsheets.values.append({
      auth,
      spreadsheetId,
      range: "KPI!E68",
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [[count3_3]],
      },
    });

    await googleSheets.spreadsheets.values.append({
      auth,
      spreadsheetId,
      range: "KPI!F66",
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [[count4_1+ "%"]],
      },
    });

    await googleSheets.spreadsheets.values.append({
      auth,
      spreadsheetId,
      range: "KPI!F67",
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [[count4_2+ "%"]],
      },
    });

    await googleSheets.spreadsheets.values.append({
      auth,
      spreadsheetId,
      range: "KPI!F68",
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [[count4_3+ "%"]],
      },
    });

    await googleSheets.spreadsheets.values.append({
      auth,
      spreadsheetId,
      range: "KPI!G66",
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [[count5_1+ "%"]],
      },
    });

    await googleSheets.spreadsheets.values.append({
      auth,
      spreadsheetId,
      range: "KPI!G67",
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [[count5_2+ "%"]],
      },
    });

    await googleSheets.spreadsheets.values.append({
      auth,
      spreadsheetId,
      range: "KPI!G68",
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [[count5_3+ "%"]],
      },
    });

    await googleSheets.spreadsheets.values.append({
      auth,
      spreadsheetId,
      range: "KPI!H66",
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [[count6]],
      },
    });

    await googleSheets.spreadsheets.values.append({
      auth,
      spreadsheetId,
      range: "KPI!I66",
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [[count7]],
      },
    });

    await googleSheets.spreadsheets.values.append({
      auth,
      spreadsheetId,
      range: "KPI!J66",
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [[count8+ "%"]],
      },
    });

    await googleSheets.spreadsheets.values.append({
      auth,
      spreadsheetId,
      range: "KPI!K66",
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [[count9+ "%"]],
      },
    });

    await googleSheets.spreadsheets.values.append({
      auth,
      spreadsheetId,
      range: "KPI!L66",
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [[count10+ "%"]],
      },
    });

    await googleSheets.spreadsheets.values.append({
      auth,
      spreadsheetId,
      range: "KPI!M66",
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [[count11+ "%"]],
      },
    });

    await googleSheets.spreadsheets.values.append({
      auth,
      spreadsheetId,
      range: "KPI!N66",
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [[count12]],
      },
    });

    await googleSheets.spreadsheets.values.append({
      auth,
      spreadsheetId,
      range: "KPI!O66",
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
