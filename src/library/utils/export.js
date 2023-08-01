import _ from 'lodash';
import moment from 'moment';

import LANG from '../../language';

export const exportWord = (aData) => {
  if (!aData) {
    return;
  }
  const createdDateTime = new Date();
  let headerContent = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><style>table{border: 5px solid black}</style></head><body>";
  const footerContent = "</body></html>";
  let content = "";
  if (aData.customize) {
    content = aData.customize;
  } else {
    let table = "";
    let title = "";
    _.map(aData, (itemData, indexData) => {
      switch(indexData) {
        case "title":
          title = `<h1>${itemData}`
          title += `<p style='font-size: 12px; text-align: right'>${createdDateTime.getFullYear()}년 ${createdDateTime.getMonth()}월 ${createdDateTime.getDate()}일</p></h1>`;
          break;
        case "table":
          table = "<table style='font-family: 'Godo';'><thead><tr><th style='border: 1px solid black'>번호</th>";
          _.map(itemData.sColumns, (itemColumns, indexColumns) => {
            if (itemColumns.name !== 'no') table += `<th style='border: 1px solid black'>${itemColumns.title}</th>`;
          })
          table += "</tr></thead><tbody>";
          let i = 1;
          _.map(itemData.table, (itemTable, indexTable) => {
            table += `<tr><td style='border: 1px solid black'>${i}</td>`;
            _.map(itemData.sColumns, (itemColumns, indexColumns) => {
              let value = _.get(itemTable, itemColumns.name) || '';
              if (itemColumns.name !== 'no') {
                switch (itemColumns.type) {
                  case 4:
                    table += `<td style='border: 1px solid black'>${moment(value).format('YYYY-MM-DD')}</td>`;
                    break;
                  case 5:
                    table += `<td style='border: 1px solid black'>${moment(value).format('HH:mm:ss')}</td>`;
                    break;
                  case 6:
                    table += `<td style='border: 1px solid black'>${moment(value).format('YYYY-MM-DD HH:mm:ss')}</td>`;
                    break;
                  case 7:
                    table += `<td style='border: 1px solid black'>${window.htmlToText(value)}</td>`;
                    break;
                  case 12:
                    value = _.get(itemTable, `${itemColumns.name}.realName`) || ''
                    table += `<td style='border: 1px solid black'>${value}</td>`;
                    break;
                  default:
                    table += `<td style='border: 1px solid black'>${value}</td>`;
                    break;
                }
              }
            });
            table += "</tr>";
            i ++;
          });
          table += "</tbody></table>";
          break;
        default:
          break;
      }
    })
    content = title + table;
  }
  
  const resultContent = headerContent + content + footerContent;

  let blob = new Blob([resultContent], { type: ['application/msword', 'application/vnd.ms-office', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/zip', 'application/msword', 'application/x-zip', 'application/msword', 'application/octet-stream'] });
  let csvUrl = URL.createObjectURL(blob);
  let link = document.createElement('a');
  link.setAttribute('href', csvUrl);
  link.setAttribute('download', `${aData.title}${createdDateTime.getFullYear()}${createdDateTime.getMonth() + 1}${createdDateTime.getDate()}.doc`);
  link.click();
}

export const exportExcel = (aData) => {
  if (!aData) {
    return;
  }
  let content = "";
  const createdDateTime = new Date();
  const headerContent = '<?xml version="1.0" encoding="UTF-8"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" xmlns:html="http://www.w3.org/TR/REC-html40"><Styles><Style ss:ID="s82"><Alignment ss:Horizontal="Center" ss:Vertical="Center"/><Font ss:FontName="Arial" x:CharSet="136" ss:Size="22" ss:Color="#000000"/></Style></Styles><Worksheet ss:Name="test">';
    const footerContent = "</Worksheet></Workbook>";
  if (aData.customize) {
    content = aData.customize;
  } else {
    let table = "";
    table = "<Table><Column ss:Width='32'/>";
    _.map(aData.table.sColumns, (itemColumns, indexColumns) => {
      if (itemColumns.width) {
        table += `<Column ss:Width="${itemColumns.width}"/>`;
      } else {
        table += `<Column ss:Width="100"/>`;
      }
    })
    _.map(aData, (itemData, indexData) => {
      switch(indexData) {
        case "title":
          table += `<Row><Cell ss:MergeAcross="${aData.table.sColumns.length - 2}" ss:StyleID="s82"><Data ss:Type="String">${itemData}</Data></Cell>`
          table += `<Cell><Data ss:Type="String">${createdDateTime.getFullYear()}년 ${createdDateTime.getMonth() + 1}월 ${createdDateTime.getDate()}일</Data></Cell></Row>`;
          break;
        case "table":
          table += "<Row><Cell><Data ss:Type='String'>번호</Data></Cell>";
          _.map(itemData.sColumns, (itemColumns, indexColumns) => {
            if (itemColumns.name !== 'no') table += `<Cell><Data ss:Type="String">${itemColumns.title}</Data></Cell>`;
          })
          table += "</Row>";
          let i = 1;
          _.map(itemData.table, (itemTable, indexTable) => {
            table += `<Row><Cell><Data ss:Type="String">${i}</Data></Cell>`;
            _.map(itemData.sColumns, (itemColumns, indexColumns) => {
              if (itemColumns.name !== 'no') {
                let value = _.get(itemTable, itemColumns.name) || '';
                switch (itemColumns.type) {
                  case 4:
                    table += `<Cell ><Data ss:Type="String">${moment(value).format('YYYY-MM-DD')}</Data></Cell>`;
                    break;
                  case 5:
                    table += `<Cell ><Data ss:Type="String">${moment(value).format('HH:mm:ss')}</Data></Cell>`;
                    break;
                  case 6:
                    table += `<Cell ><Data ss:Type="String">${moment(value).format('YYYY-MM-DD HH:mm:ss')}</Data></Cell>`;
                    break;
                  case 7:
                    table += `<Cell ><Data ss:Type="String">${window.htmlToText(value)}</Data></Cell>`;
                    break
                  case 12:
                    value = _.get(itemTable, `${itemColumns.name}.realName`) || ''
                    table += `<Cell ><Data ss:Type="String">${value}</Data></Cell>`;
                    break
                  default:
                    table += `<Cell ><Data ss:Type="String">${value}</Data></Cell>`;
                    break;
                }
              }
              
            });
            table += "</Row>";
            i ++;
          });
          break;
        default:
          break;
      }
    })
    table += "</Table>"
    content = table;
  }
  
  const resultContent = headerContent + content + footerContent;

  let blob = new Blob([resultContent], { type: ['application/vnd.ms-excel'] });
  let csvUrl = URL.createObjectURL(blob);
  let link = document.createElement('a');
  link.setAttribute('href', csvUrl);
  link.setAttribute('download', `${aData.title}${createdDateTime.getFullYear()}${createdDateTime.getMonth() + 1}${createdDateTime.getDate()}.xls`);
  link.click();
}

export const exportPdf = (content) => {
  let doc = window.createJsPDF('p', 'mm', 'a4');
  const createdDateTime = new Date();

  const pageWidth = 210;
  const pageHeight = 297;
  const font_color_gray = 160;
  const font_color_normal = 10;

  /* Basic Info */
  const font_color_section = 90;
  const pos_header_x = 8;
  const font_size_content = 8;

  doc.setFontStyle('bold');
  doc.setTextColor(font_color_gray);
  doc.setFontSize(11);
  
  /**
   * Table 
   */
  let pageHeaderPrinted=[];
  const tableContent = (data) => {
    let currentPage = doc.internal.pages.length;
    if(pageHeaderPrinted.indexOf(currentPage) !== -1)
    return;
    pageHeaderPrinted.push(currentPage);
    const report_time = new Date();
    const report_time_string = moment(report_time).format('YYYY-MM-DD');

    // header

    

    // body
      
    // footer
    doc.setFontSize(font_size_content);
    doc.text(pos_header_x, pageHeight - 9, 'Pyongyang University of Information Technology');
    doc.setFontStyle('normal');
    doc.setFontSize(font_size_content);
    doc.setTextColor(font_color_normal);
    doc.text(pageWidth - pos_header_x, pageHeight - 9, report_time_string, null, null, 'right');
  }
  let tableOption = {
    theme: 'grid',
    addPageContent: tableContent,
    margin: {top: 30, bottom: 30},
    tableLineColor: 200,
    tableLineWidth: 0,
    drawHeaderCell: (cell, data) => {
      if(data.column.index === 0){
          cell.textPos.x = cell.x + 4;
          cell.styles.halign = 'left';
      }
    },
    drawRow: (row, data) => {
      row.height = row.height * 1.2;
      if(row.index % 2 === 0){
        _.map(row.cells, (cell)=>{
          cell.styles.fillColor = 240;
        })
      }else{
        _.map(row.cells, (cell)=>{
        cell.styles.fillColor = 255;
        })
      }
    },
    drawCell: (cell, data) => {
      if(data.column.index === 0){
          cell.textPos.x = cell.x + 4
          cell.styles.halign = 'left'
      }
    },
    bodyStyles:{
      halign: 'center',
      valign: 'middle',
      overflow: 'linebreak',
      columnWidth: 'wrap',
      fontSize: 9,
      cellPadding: 1,
    },
    headerStyles:{
    fillColor: [40, 40, 40],
    fontSize: 10,
    halign: 'center',
    }
  }

  const pos_table_title_x = 16;
  const pos_table_title_y = 20;
  // title
  doc.setFontStyle('bold');
  doc.setTextColor(font_color_section);
  doc.setFontSize(14);
  doc.text(pos_table_title_x, pos_table_title_y, content.title);

  const pos_table_created_date_x = 150;
  const pos_table_created_date_y = 20;
  //created date
  doc.setFontStyle('normal');
  doc.setFontSize(font_size_content);
  doc.text(pos_table_created_date_x, pos_table_created_date_y, `${createdDateTime.getFullYear()}${LANG('BASIC_YEAR')} ${createdDateTime.getMonth() + 1}${LANG('BASIC_MONTH')} ${createdDateTime.getDate()}${LANG('BASIC_DATE')}`);

  // body
  tableOption.startY = pos_table_title_y + 7;

  let table_header = [];
  _.map(content.table.sColumns, (columnItem, columnIndex) => {
    table_header.push(columnItem.title);
  });

  let table_data = [];
  
  _.map(content.table.table, (tableItem, tableIndex) => {
    let rowData = [];
    _.map(content.table.sColumns, (columnItem, columnIndex) => {
      if (columnItem.name !== 'no') {
        let value = _.get(tableItem, columnItem.name);
        switch (columnItem.type) {
          case 4:
            rowData.push(moment(value).format('YYYY-MM-DD'));
            break;
          case 5:
            rowData.push(moment(value).format('HH:mm:ss'));
            break;
          case 6:
            rowData.push(moment(value).format('YYYY-MM-DD HH:mm:ss'));
            break;
          case 7:
            rowData.push(window.htmlToText(value))
            break
          case 11:
            value = _.get(tableItem, `${columnItem.name}.realName`)
            rowData.push(value);
            break
          default:
            rowData.push(value);
            break;
        }
      }
    });
    table_data.push(rowData);
  });
  
  doc.autoTable(table_header, table_data, tableOption)

  doc.save(`${content.title}${createdDateTime.getFullYear()}${createdDateTime.getMonth() + 1}${createdDateTime.getDate()}.pdf`);
}