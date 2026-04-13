import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ExportService {
  /**
   * Export data to CSV format
   */
  exportToCSV(data: any[], filename: string, columns?: string[]): void {
    if (!data || data.length === 0) {
      console.warn('No data to export');
      return;
    }

    // Get column headers
    const headers = columns || Object.keys(data[0]);
    
    // Create CSV content
    let csvContent = headers.join(',') + '\n';
    
    data.forEach(row => {
      const values = headers.map(header => {
        const value = row[header];
        // Handle values with commas or quotes
        if (value === null || value === undefined) {
          return '';
        }
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      });
      csvContent += values.join(',') + '\n';
    });

    this.downloadFile(csvContent, `${filename}.csv`, 'text/csv;charset=utf-8;');
  }

  /**
   * Export data to JSON format
   */
  exportToJSON(data: any[], filename: string): void {
    if (!data || data.length === 0) {
      console.warn('No data to export');
      return;
    }

    const jsonContent = JSON.stringify(data, null, 2);
    this.downloadFile(jsonContent, `${filename}.json`, 'application/json;charset=utf-8;');
  }

  /**
   * Export table to Excel-compatible format
   */
  exportToExcel(data: any[], filename: string, sheetName: string = 'Sheet1'): void {
    if (!data || data.length === 0) {
      console.warn('No data to export');
      return;
    }

    // Create HTML table
    const headers = Object.keys(data[0]);
    let htmlContent = '<table>';
    
    // Add headers
    htmlContent += '<thead><tr>';
    headers.forEach(header => {
      htmlContent += `<th>${header}</th>`;
    });
    htmlContent += '</tr></thead>';
    
    // Add data rows
    htmlContent += '<tbody>';
    data.forEach(row => {
      htmlContent += '<tr>';
      headers.forEach(header => {
        htmlContent += `<td>${row[header] || ''}</td>`;
      });
      htmlContent += '</tr>';
    });
    htmlContent += '</tbody></table>';

    this.downloadFile(htmlContent, `${filename}.xls`, 'application/vnd.ms-excel;charset=utf-8;');
  }

  /**
   * Print data as formatted table
   */
  printData(data: any[], title: string): void {
    if (!data || data.length === 0) {
      console.warn('No data to print');
      return;
    }

    const headers = Object.keys(data[0]);
    
    let printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
          }
          h1 {
            color: #333;
            border-bottom: 2px solid #667eea;
            padding-bottom: 10px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
          }
          th {
            background-color: #667eea;
            color: white;
            font-weight: bold;
          }
          tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          .print-date {
            color: #666;
            font-size: 12px;
            margin-top: 10px;
          }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <div class="print-date">Generated on: ${new Date().toLocaleString()}</div>
        <table>
          <thead>
            <tr>
              ${headers.map(h => `<th>${h}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${data.map(row => `
              <tr>
                ${headers.map(h => `<td>${row[h] || ''}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  }

  /**
   * Helper method to download file
   */
  private downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  /**
   * Format data for export (remove unwanted fields, format dates, etc.)
   */
  formatDataForExport(data: any[], fieldsToRemove: string[] = []): any[] {
    return data.map(item => {
      const formatted = { ...item };
      
      // Remove unwanted fields
      fieldsToRemove.forEach(field => {
        delete formatted[field];
      });
      
      // Format dates
      Object.keys(formatted).forEach(key => {
        if (formatted[key] instanceof Date) {
          formatted[key] = formatted[key].toLocaleDateString();
        } else if (typeof formatted[key] === 'string' && this.isISODate(formatted[key])) {
          formatted[key] = new Date(formatted[key]).toLocaleDateString();
        }
      });
      
      return formatted;
    });
  }

  /**
   * Check if string is ISO date format
   */
  private isISODate(str: string): boolean {
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
    return isoDateRegex.test(str);
  }
}
