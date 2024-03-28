const pool = require('./database.js');
const { google } = require("googleapis");

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: "/home/yvrlinli/businessKPI/credentials.json",
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
    connection.query('SELECT * FROM kpi ORDER BY `日期` DESC limit 100', (err, results, fields) => {
      connection.release(); // 释放连接

      if (err) {
        console.error('Error executing query: ' + err.stack);
        return;
      }

      console.log('Query executed successfully');

      // 将查询结果转换为二维数组
      const rows = [];
      rows.push(fields.map(field => field.name)); // 添加表头

      // 添加数据，并对指定列进行处理
      results.forEach(row => {
        const newRow = [];
        Object.entries(row).forEach(([key, value], index) => {
          if (index === 0) { // 如果是日期列
            // 将日期字符串转换为日期对象
            const dateObj = new Date(value);
            // 提取年月日部分并格式化为字符串
            const formattedDate = `${dateObj.getFullYear()}-${(dateObj.getMonth() + 1).toString().padStart(2, '0')}-${dateObj.getDate().toString().padStart(2, '0')}`;
            newRow.push(formattedDate); // 将格式化后的日期添加到新行中
          } else if ((index >= 10 && index <= 15) || (index >= 19 && index <= 30)) {
            // 对指定列的数据进行处理
            value = (value * 100).toFixed(2) + '%'; // 乘以 100 并保留两位小数，然后添加百分号
            newRow.push(value);
          } else {
            newRow.push(value); // 其他列直接添加到新行中
          }
        });
        rows.push(newRow);
      });
      // 调用 Google Sheets API 写入数据到 Google Sheets
      googleSheets.spreadsheets.values.update({
        spreadsheetId: spreadsheetId,
        range: 'KPI!A1:AG',// 你要写入的工作表名称或范围
        valueInputOption: 'RAW',
        resource: { values: rows }
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
