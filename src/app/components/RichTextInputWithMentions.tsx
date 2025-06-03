"use client";

import React, { useRef, useCallback, useState, useEffect } from "react";
import "./table-styles.css";

interface Mention {
  id: string;
  name: string;
  avatar?: string;
  email?: string;
}

interface RichTextInputWithMentionsProps {
  placeholder?: string;
  className?: string;
  onChange?: (content: string) => void;
  maxHeight?: string;
  mentions?: Mention[];
  onMentionSearch?: (query: string) => Mention[];
}

const defaultMentions: Mention[] = [
  { id: "1", name: "John Doe", email: "john@example.com", avatar: "👨‍💼" },
  { id: "2", name: "Jane Smith", email: "jane@example.com", avatar: "👩‍💼" },
  { id: "3", name: "Bob Johnson", email: "bob@example.com", avatar: "👨‍🔧" },
  { id: "4", name: "Alice Brown", email: "alice@example.com", avatar: "👩‍🎨" },
  {
    id: "5",
    name: "Charlie Wilson",
    email: "charlie@example.com",
    avatar: "👨‍🏫",
  },
  { id: "6", name: "Diana Prince", email: "diana@example.com", avatar: "👩‍⚕️" },
];

const RichTextInputWithMentions: React.FC<RichTextInputWithMentionsProps> = ({
  placeholder = "Type here, use @ for mentions, or paste Excel tables...",
  className = "",
  onChange,
  maxHeight = "400px",
  mentions = defaultMentions,
  onMentionSearch,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isEmpty, setIsEmpty] = useState(true);
  const [selectedTable, setSelectedTable] = useState<HTMLTableElement | null>(
    null
  );
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });
  const [filteredMentions, setFilteredMentions] = useState<Mention[]>([]);
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const [mentionRange, setMentionRange] = useState<Range | null>(null);

  const isTableData = (text: string): boolean => {
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

    table.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      setSelectedTable(table);
      table.style.outline = "2px solid #3b82f6";
    });

    return table;
  };

  const createMentionElement = (mention: Mention): HTMLSpanElement => {
    const mentionEl = document.createElement("span");
    mentionEl.className =
      "mention bg-blue-100 text-blue-800 px-2 py-1 rounded-md inline-block mx-1";
    mentionEl.contentEditable = "false";
    mentionEl.setAttribute("data-mention-id", mention.id);
    mentionEl.textContent = `@${mention.name}`;
    return mentionEl;
  };

  const getCaretPosition = (): { top: number; left: number } => {
    const selection = window.getSelection();
    if (!selection?.rangeCount) return { top: 0, left: 0 };

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const editorRect = editorRef.current?.getBoundingClientRect();

    if (!editorRect) return { top: 0, left: 0 };

    return {
      top: rect.bottom - editorRect.top,
      left: rect.left - editorRect.left,
    };
  };

  const detectMentionTrigger = (): string | null => {
    const selection = window.getSelection();
    if (!selection?.rangeCount) return null;

    const range = selection.getRangeAt(0);
    const textNode = range.startContainer;

    if (textNode.nodeType !== Node.TEXT_NODE) return null;

    const textContent = textNode.textContent || "";
    const cursorPos = range.startOffset;

    // Look backwards from cursor to find @
    let atIndex = -1;
    for (let i = cursorPos - 1; i >= 0; i--) {
      if (textContent[i] === "@") {
        atIndex = i;
        break;
      }
      if (textContent[i] === " " || textContent[i] === "\n") {
        break;
      }
    }

    if (atIndex === -1) return null;

    const query = textContent.substring(atIndex + 1, cursorPos);

    // Store the range for mention insertion
    const mentionRange = document.createRange();
    mentionRange.setStart(textNode, atIndex);
    mentionRange.setEnd(textNode, cursorPos);
    setMentionRange(mentionRange);

    return query;
  };

  const filterMentions = (query: string): Mention[] => {
    if (onMentionSearch) {
      return onMentionSearch(query);
    }

    if (!query) return mentions;

    return mentions.filter(
      (mention) =>
        mention.name.toLowerCase().includes(query.toLowerCase()) ||
        mention.email?.toLowerCase().includes(query.toLowerCase())
    );
  };

  const insertMention = (mention: Mention) => {
    if (!mentionRange || !editorRef.current) return;

    const mentionEl = createMentionElement(mention);

    // Delete the @query text and insert mention
    mentionRange.deleteContents();
    mentionRange.insertNode(mentionEl);

    // Add space after mention
    const space = document.createTextNode(" ");
    mentionRange.setStartAfter(mentionEl);
    mentionRange.insertNode(space);
    mentionRange.setStartAfter(space);
    mentionRange.collapse(true);

    // Update selection
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(mentionRange);

    // Hide mentions dropdown
    setShowMentions(false);
    setMentionQuery("");
    setMentionRange(null);

    if (onChange) {
      onChange(editorRef.current.innerHTML);
    }
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
        const table = createTableFromData(pastedText);

        range.deleteContents();
        range.insertNode(table);

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

        selection.removeAllRanges();
        selection.addRange(range);
      } else {
        const textNode = document.createTextNode(pastedText);
        range.deleteContents();
        range.insertNode(textNode);
        range.setStartAfter(textNode);
        range.collapse(true);

        selection.removeAllRanges();
        selection.addRange(range);
      }

      if (onChange) {
        onChange(editorRef.current.innerHTML);
      }

      checkEmpty();
    },
    [onChange]
  );

  const handleInput = useCallback(() => {
    // Check for mention trigger
    const query = detectMentionTrigger();

    if (query !== null) {
      setMentionQuery(query);
      const filtered = filterMentions(query);
      setFilteredMentions(filtered);
      setSelectedMentionIndex(0);

      if (!showMentions) {
        setShowMentions(true);
        setMentionPosition(getCaretPosition());
      }
    } else {
      setShowMentions(false);
      setMentionQuery("");
    }

    if (onChange && editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
    checkEmpty();
  }, [onChange, showMentions]);

  const checkEmpty = () => {
    if (editorRef.current) {
      const content = editorRef.current.textContent || "";
      const hasTable = editorRef.current.querySelector("table") !== null;
      const hasMention = editorRef.current.querySelector(".mention") !== null;
      setIsEmpty(content.trim() === "" && !hasTable && !hasMention);
    }
  };

  const handleFocus = () => {
    setIsEmpty(false);
  };

  const handleBlur = () => {
    setTimeout(() => {
      checkEmpty();
      clearTableSelection();
      setShowMentions(false);
    }, 150);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showMentions) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedMentionIndex((prev) =>
          prev < filteredMentions.length - 1 ? prev + 1 : 0
        );
        return;
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedMentionIndex((prev) =>
          prev > 0 ? prev - 1 : filteredMentions.length - 1
        );
        return;
      }

      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        if (filteredMentions[selectedMentionIndex]) {
          insertMention(filteredMentions[selectedMentionIndex]);
        }
        return;
      }

      if (e.key === "Escape") {
        setShowMentions(false);
        setMentionQuery("");
        return;
      }
    }

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

    if (e.key === "Enter" && !showMentions) {
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
    const target = e.target as HTMLElement;
    if (!target.closest("table")) {
      clearTableSelection();
    }

    // Hide mentions when clicking elsewhere
    if (!target.closest(".mention-dropdown")) {
      setShowMentions(false);
    }
  };

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      if (editorRef.current && !editorRef.current.contains(e.target as Node)) {
        clearTableSelection();
        setShowMentions(false);
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

      {showMentions && filteredMentions.length > 0 && (
        <div
          className="mention-dropdown absolute bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto"
          style={{
            top: mentionPosition.top + 20,
            left: mentionPosition.left,
            minWidth: "200px",
          }}
        >
          {filteredMentions.map((mention, index) => (
            <div
              key={mention.id}
              className={`px-3 py-2 cursor-pointer flex items-center gap-2 ${
                index === selectedMentionIndex
                  ? "bg-blue-100 text-blue-900"
                  : "hover:bg-gray-100"
              }`}
              onClick={() => insertMention(mention)}
            >
              <span className="text-lg">{mention.avatar || "👤"}</span>
              <div className="flex-1">
                <div className="font-medium text-sm">{mention.name}</div>
                {mention.email && (
                  <div className="text-xs text-gray-500">{mention.email}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RichTextInputWithMentions;
