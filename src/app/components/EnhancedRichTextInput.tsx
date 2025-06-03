"use client";

import React, { useRef, useCallback, useState, useEffect } from "react";
import "./table-styles.css";

interface EnhancedRichTextInputProps {
  placeholder?: string;
  className?: string;
  onChange?: (content: string) => void;
  maxHeight?: string;
}

const EnhancedRichTextInput: React.FC<EnhancedRichTextInputProps> = ({
  placeholder = "Type here or paste Excel tables...",
  className = "",
  onChange,
  maxHeight = "400px",
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isEmpty, setIsEmpty] = useState(true);
  const [selectedTable, setSelectedTable] = useState<HTMLTableElement | null>(
    null
  );

  const isTableData = (text: string): boolean => {
    // Check if the text contains tab characters and multiple lines (typical Excel copy format)
    const lines = text.split("\n").filter((line) => line.trim());
    return lines.length > 1 && lines.some((line) => line.includes("\t"));
  };

  const createTableFromData = (text: string): HTMLTableElement => {
    const lines = text.split("\n").filter((line) => line.trim());
    const table = document.createElement("table");
    table.setAttribute("contenteditable", "false");
    table.style.cursor = "pointer";

    lines.forEach((line, index) => {
      const row = document.createElement("tr");
      const cells = line.split("\t");

      cells.forEach((cellText) => {
        const cell = document.createElement(index === 0 ? "th" : "td");
        cell.textContent = cellText.trim();
        cell.setAttribute("contenteditable", "true");
        row.appendChild(cell);
      });

      table.appendChild(row);
    });

    // Add click handler for table selection
    table.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      setSelectedTable(table);
      table.style.outline = "2px solid #3b82f6";
    });

    return table;
  };

  const clearTableSelection = () => {
    if (selectedTable) {
      selectedTable.style.outline = "";
      setSelectedTable(null);
    }
  };

  const deleteSelectedTable = () => {
    if (selectedTable && selectedTable.parentNode) {
      selectedTable.parentNode.removeChild(selectedTable);
      setSelectedTable(null);
      if (onChange && editorRef.current) {
        onChange(editorRef.current.innerHTML);
      }
      checkEmpty();
    }
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

        // Add line breaks around the table for better formatting
        const spaceBefore = document.createElement("div");
        spaceBefore.innerHTML = "<br>";
        const spaceAfter = document.createElement("div");
        spaceAfter.innerHTML = "<br>";

        range.setStartBefore(table);
        range.insertNode(spaceBefore);
        range.setStartAfter(table);
        range.insertNode(spaceAfter);
        range.setStartAfter(spaceAfter);
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
    setTimeout(() => {
      checkEmpty();
      clearTableSelection();
    }, 100);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Delete selected table with Delete or Backspace
    if ((e.key === "Delete" || e.key === "Backspace") && selectedTable) {
      e.preventDefault();
      deleteSelectedTable();
      return;
    }

    // Clear table selection when typing
    if (selectedTable && e.key.length === 1) {
      clearTableSelection();
    }

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

  const handleClick = (e: React.MouseEvent) => {
    // Clear table selection when clicking elsewhere
    const target = e.target as HTMLElement;
    if (!target.closest("table")) {
      clearTableSelection();
    }
  };

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      if (editorRef.current && !editorRef.current.contains(e.target as Node)) {
        clearTableSelection();
      }
    };

    document.addEventListener("click", handleGlobalClick);
    return () => document.removeEventListener("click", handleGlobalClick);
  }, []);

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
        onClick={handleClick}
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
          maxHeight,
        }}
        suppressContentEditableWarning={true}
      />
      {isEmpty && (
        <div className="absolute top-3 left-3 text-gray-400 pointer-events-none select-none">
          {placeholder}
        </div>
      )}
      {selectedTable && (
        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded shadow-lg">
          Press Delete to remove table
        </div>
      )}
    </div>
  );
};

export default EnhancedRichTextInput;
