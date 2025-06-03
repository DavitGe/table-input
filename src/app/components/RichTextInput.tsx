"use client";

import React, { useRef, useCallback, useState } from "react";
import "./table-styles.css";

interface RichTextInputProps {
  placeholder?: string;
  className?: string;
  onChange?: (content: string) => void;
}

const RichTextInput: React.FC<RichTextInputProps> = ({
  placeholder = "Type here or paste Excel tables...",
  className = "",
  onChange,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isEmpty, setIsEmpty] = useState(true);

  const isTableData = (text: string): boolean => {
    // Check if the text contains tab characters and multiple lines (typical Excel copy format)
    const lines = text.split("\n").filter((line) => line.trim());
    return lines.length > 1 && lines.some((line) => line.includes("\t"));
  };

  const createTableFromData = (text: string): HTMLTableElement => {
    const lines = text.split("\n").filter((line) => line.trim());
    const table = document.createElement("table");
    table.className =
      "inline-table border-collapse border border-gray-300 my-2 mx-1";

    lines.forEach((line, index) => {
      const row = document.createElement("tr");
      const cells = line.split("\t");

      cells.forEach((cellText) => {
        const cell = document.createElement(index === 0 ? "th" : "td");
        cell.textContent = cellText.trim();
        cell.className =
          index === 0
            ? "border border-gray-300 px-2 py-1 bg-gray-100 font-semibold text-left"
            : "border border-gray-300 px-2 py-1";
        row.appendChild(cell);
      });

      table.appendChild(row);
    });

    return table;
  };

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault();

      const clipboardData = e.clipboardData;
      const pastedText = clipboardData.getData("text/plain");

      if (!editorRef.current) return;

      const selection = window.getSelection();
      if (!selection?.rangeCount) return;

      const range = selection.getRangeAt(0);

      if (isTableData(pastedText)) {
        // Create table from pasted data
        const table = createTableFromData(pastedText);

        // Insert the table at cursor position
        range.deleteContents();
        range.insertNode(table);

        // Add a space after the table for continued typing
        const space = document.createTextNode(" ");
        range.setStartAfter(table);
        range.insertNode(space);
        range.setStartAfter(space);
        range.collapse(true);

        // Update selection
        selection.removeAllRanges();
        selection.addRange(range);
      } else {
        // Handle regular text paste
        const textNode = document.createTextNode(pastedText);
        range.deleteContents();
        range.insertNode(textNode);
        range.setStartAfter(textNode);
        range.collapse(true);

        selection.removeAllRanges();
        selection.addRange(range);
      }

      // Trigger change event
      if (onChange) {
        onChange(editorRef.current.innerHTML);
      }

      checkEmpty();
    },
    [onChange]
  );

  const handleInput = useCallback(() => {
    if (onChange && editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
    checkEmpty();
  }, [onChange]);

  const checkEmpty = () => {
    if (editorRef.current) {
      const content = editorRef.current.textContent || "";
      const hasTable = editorRef.current.querySelector("table") !== null;
      setIsEmpty(content.trim() === "" && !hasTable);
    }
  };

  const handleFocus = () => {
    setIsEmpty(false);
  };

  const handleBlur = () => {
    checkEmpty();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Allow basic formatting and navigation
    if (e.key === "Enter") {
      // Ensure we can add line breaks
      e.preventDefault();
      const selection = window.getSelection();
      if (selection?.rangeCount) {
        const range = selection.getRangeAt(0);
        const br = document.createElement("br");
        range.deleteContents();
        range.insertNode(br);
        range.setStartAfter(br);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  };

  return (
    <div className="relative">
      <div
        ref={editorRef}
        contentEditable
        onPaste={handlePaste}
        onInput={handleInput}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`
          rich-text-editor
          min-h-[120px] p-3 border border-gray-300 rounded-lg 
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          bg-white resize-none overflow-auto text-gray-900
          ${className}
        `}
        style={{
          whiteSpace: "pre-wrap",
          wordWrap: "break-word",
        }}
        suppressContentEditableWarning={true}
      />
      {isEmpty && (
        <div className="absolute top-3 left-3 text-gray-400 pointer-events-none select-none">
          {placeholder}
        </div>
      )}
    </div>
  );
};

export default RichTextInput;
