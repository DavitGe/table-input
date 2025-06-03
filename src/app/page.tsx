"use client";

import { useState, useRef } from "react";

interface TableData {
  headers: string[];
  rows: string[][];
}

export default function Home() {
  const [tableData, setTableData] = useState<TableData | null>(null);
  const [rawText, setRawText] = useState("");
  const [showAsTable, setShowAsTable] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const parseExcelData = (text: string): TableData | null => {
    if (!text.trim()) return null;

    // Split by new lines to get rows
    const lines = text.trim().split("\n");
    if (lines.length === 0) return null;

    // Split each line by tabs (Excel typically pastes as tab-separated)
    const rows = lines.map((line) => line.split("\t"));

    // Find the maximum number of columns
    const maxCols = Math.max(...rows.map((row) => row.length));

    // Normalize all rows to have the same number of columns
    const normalizedRows = rows.map((row) => {
      const normalized = [...row];
      while (normalized.length < maxCols) {
        normalized.push("");
      }
      return normalized;
    });

    // Use first row as headers if it looks like headers, otherwise generate them
    const firstRow = normalizedRows[0];
    const hasHeaders = firstRow.some(
      (cell) => cell && isNaN(Number(cell)) && cell.length > 0
    );

    if (hasHeaders && normalizedRows.length > 1) {
      return {
        headers: firstRow,
        rows: normalizedRows.slice(1),
      };
    } else {
      // Generate column headers
      const headers = Array.from(
        { length: maxCols },
        (_, i) => String.fromCharCode(65 + i) // A, B, C, etc.
      );
      return {
        headers,
        rows: normalizedRows,
      };
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();

    const pastedText = e.clipboardData.getData("text");
    setRawText(pastedText);

    // Check if the pasted text looks like tabular data
    const hasTabsOrMultipleLines =
      pastedText.includes("\t") || pastedText.includes("\n");

    if (hasTabsOrMultipleLines) {
      const parsed = parseExcelData(pastedText);
      if (parsed) {
        setTableData(parsed);
        setShowAsTable(true);
      }
    } else {
      // If it's just plain text, clear the table
      setTableData(null);
      setShowAsTable(false);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setRawText(text);

    // Try to parse as table data when typing
    const hasTabsOrMultipleLines = text.includes("\t") || text.includes("\n");
    if (hasTabsOrMultipleLines) {
      const parsed = parseExcelData(text);
      if (parsed) {
        setTableData(parsed);
        setShowAsTable(true);
      } else {
        setShowAsTable(false);
      }
    } else {
      setTableData(null);
      setShowAsTable(false);
    }
  };

  const handleCellChange = (
    rowIndex: number,
    cellIndex: number,
    value: string
  ) => {
    if (!tableData) return;

    const newRows = [...tableData.rows];
    newRows[rowIndex] = [...newRows[rowIndex]];
    newRows[rowIndex][cellIndex] = value;

    setTableData({
      ...tableData,
      rows: newRows,
    });

    // Update raw text to keep it in sync
    const updatedText = [
      tableData.headers.join("\t"),
      ...newRows.map((row) => row.join("\t")),
    ].join("\n");
    setRawText(updatedText);
  };

  const handleHeaderChange = (index: number, value: string) => {
    if (!tableData) return;

    const newHeaders = [...tableData.headers];
    newHeaders[index] = value;

    setTableData({
      ...tableData,
      headers: newHeaders,
    });

    // Update raw text to keep it in sync
    const updatedText = [
      newHeaders.join("\t"),
      ...tableData.rows.map((row) => row.join("\t")),
    ].join("\n");
    setRawText(updatedText);
  };

  const switchToTextMode = () => {
    setShowAsTable(false);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 0);
  };

  const clearData = () => {
    setRawText("");
    setTableData(null);
    setShowAsTable(false);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 0);
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Excel Paste to Table Converter
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Paste Excel data below and see it automatically converted to an
            editable table
          </p>
        </div>

        <div className="space-y-6">
          {/* Input/Table Area */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <label
                htmlFor="excel-input"
                className="text-lg font-medium text-gray-900 dark:text-white"
              >
                {showAsTable
                  ? "Excel Data (Table View)"
                  : "Paste Excel Data Here"}
              </label>
              <div className="flex gap-2">
                {showAsTable && (
                  <button
                    onClick={switchToTextMode}
                    className="px-4 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
                  >
                    Edit as Text
                  </button>
                )}
                {(rawText || tableData) && (
                  <button
                    onClick={clearData}
                    className="px-4 py-2 text-sm bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {!showAsTable ? (
              <>
                <textarea
                  ref={textareaRef}
                  id="excel-input"
                  value={rawText}
                  onChange={handleTextChange}
                  onPaste={handlePaste}
                  placeholder="Copy cells from Excel and paste them here..."
                  className="w-full h-32 p-4 border border-gray-300 dark:border-gray-600 rounded-md 
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                             focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
                />

                <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Tip: Copy data from Excel (Ctrl+C) and paste it here (Ctrl+V
                  or Cmd+V) to see it as a table
                </div>
              </>
            ) : (
              <div className="border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
                {tableData && (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          {tableData.headers.map((header, index) => (
                            <th key={index} className="p-0">
                              <input
                                type="text"
                                value={header}
                                onChange={(e) =>
                                  handleHeaderChange(index, e.target.value)
                                }
                                className="w-full px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider
                                         bg-gray-50 dark:bg-gray-700 border-0 focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-600
                                         border-r border-gray-200 dark:border-gray-600 last:border-r-0"
                                placeholder={`Column ${index + 1}`}
                              />
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {tableData.rows.map((row, rowIndex) => (
                          <tr key={rowIndex}>
                            {row.map((cell, cellIndex) => (
                              <td key={cellIndex} className="p-0">
                                <input
                                  type="text"
                                  value={cell}
                                  onChange={(e) =>
                                    handleCellChange(
                                      rowIndex,
                                      cellIndex,
                                      e.target.value
                                    )
                                  }
                                  className="w-full px-4 py-3 text-sm text-gray-900 dark:text-gray-100
                                           bg-white dark:bg-gray-800 border-0 focus:ring-2 focus:ring-blue-500 focus:bg-blue-50 dark:focus:bg-gray-700
                                           border-r border-gray-200 dark:border-gray-600 last:border-r-0"
                                  placeholder="-"
                                />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="p-3 bg-gray-50 dark:bg-gray-700 text-sm text-gray-600 dark:text-gray-400">
                  Table Mode: Click any cell to edit • {tableData?.rows.length}{" "}
                  rows × {tableData?.headers.length} columns
                </div>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
            <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-3">
              How to use:
            </h3>
            <ul className="space-y-2 text-blue-800 dark:text-blue-200">
              <li className="flex items-start">
                <span className="mr-2">1.</span>
                <span>
                  Select and copy cells from Excel (or any spreadsheet
                  application)
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">2.</span>
                <span>
                  Click in the text area above and paste (Ctrl+V or Cmd+V)
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">3.</span>
                <span>
                  The data will automatically be converted to an editable table
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">4.</span>
                <span>
                  Click any cell in table mode to edit the content directly
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">5.</span>
                <span>
                  Use "Edit as Text" button to switch back to text mode for bulk
                  editing
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
