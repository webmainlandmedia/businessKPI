const pool = require('./database.js');
const { google } = require("googleapis");

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: "credentials.json",
    scopes: "https://www.googleapis.com/auth/spreadsheets",
  });

  const client = await auth.getClient();

  const googleSheets = google.sheets({ version: "v4", auth: client });

  const spreadsheetId = "15secBfkqHiqPD1s5xqbOeQ0u1S0-WKJXcH_wF36XOVg";

  // 从连接池中获取连接
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to MySQL: ' + err.stack);
      return;
    }

    console.log('Connected to MySQL as id ' + connection.threadId);

    // 执行查询
    connection.query('SELECT * FROM kpi ORDER BY `日期` desc', (err, results, fields) => {
      connection.release(); // 释放连接

      if (err) {
        console.error('Error executing query: ' + err.stack);
        return;
      }

      console.log('Query executed successfully');

      // 将查询结果转换为二维数组
      const rows = [];
      rows.push(fields.map(field => field.name)); // 添加表头
      results.forEach(row => rows.push(Object.values(row))); // 添加数据

      // 限制更新的行数为最多 100 行
      const rowsToUpdate = rows.slice(0, 100);

      // 调用 Google Sheets API 写入数据到 Google Sheets
      googleSheets.spreadsheets.values.update({
        spreadsheetId: spreadsheetId,
        range: 'KPI!A1:AG',// 你要写入的工作表名称或范围
        valueInputOption: 'RAW',
        resource: { values: rowsToUpdate }
      }, (err, response) => {
        if (err) {
          console.error('Error writing data to Google Sheets: ' + err);
          return;
        }

        console.log('Data written to Google Sheets successfully');
        console.log(response.data);
      });
    });
  });
}

main().catch(console.error);