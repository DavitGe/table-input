"use client";

import React, { useState } from "react";
import RichTextInput from "./components/RichTextInput";
import EnhancedRichTextInput from "./components/EnhancedRichTextInput";
import RichTextInputWithMentions from "./components/RichTextInputWithMentions";

export default function Home() {
  const [basicContent, setBasicContent] = useState("");
  const [enhancedContent, setEnhancedContent] = useState("");
  const [mentionsContent, setMentionsContent] = useState("");
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(label);
      setTimeout(() => setCopiedText(null), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const employeeData = `Name	Department	Salary	Years
John Doe	Engineering	75000	3
Jane Smith	Marketing	65000	5
Bob Johnson	Sales	55000	2
Alice Brown	HR	60000	7`;

  const salesData = `Month	Revenue	Units	Growth
January	$50,000	1,200	+5%
February	$45,000	1,100	-10%
March	$60,000	1,400	+33%
April	$55,000	1,300	-8%`;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Rich Text Input with Excel Tables & Mentions
          </h1>
          <p className="text-gray-600 mb-8">
            Advanced rich text input with support for Excel table paste and
            @mentions functionality.
          </p>

          <div className="grid grid-cols-1 xl:grid-cols-3 lg:grid-cols-2 gap-6">
            {/* Basic Version */}
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  Basic Version
                </h2>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rich Text Input
                </label>
                <RichTextInput
                  placeholder="Type here or paste Excel tables..."
                  className="w-full"
                  onChange={setBasicContent}
                />
              </div>

              {basicContent && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">
                    Content (HTML):
                  </h3>
                  <div className="bg-gray-100 p-3 rounded-lg text-sm overflow-auto max-h-32">
                    <pre className="whitespace-pre-wrap text-xs text-gray-900">
                      {basicContent}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Version */}
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  Enhanced Version
                  <span className="text-xs font-normal text-blue-600 ml-2">
                    (table selection & deletion)
                  </span>
                </h2>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enhanced Rich Text Input
                </label>
                <EnhancedRichTextInput
                  placeholder="Type here or paste Excel tables..."
                  className="w-full"
                  onChange={setEnhancedContent}
                  maxHeight="250px"
                />
              </div>

              {enhancedContent && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">
                    Content (HTML):
                  </h3>
                  <div className="bg-gray-100 p-3 rounded-lg text-sm overflow-auto max-h-32">
                    <pre className="whitespace-pre-wrap text-xs text-gray-900">
                      {enhancedContent}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            {/* Mentions Version */}
            <div className="space-y-4 xl:col-span-1 lg:col-span-2">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  Mentions Version
                  <span className="text-xs font-normal text-green-600 ml-2">
                    (with @mentions + tables)
                  </span>
                </h2>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rich Text Input with Mentions
                </label>
                <RichTextInputWithMentions
                  placeholder="Type @username for mentions or paste Excel tables..."
                  className="w-full"
                  onChange={setMentionsContent}
                  maxHeight="250px"
                />
              </div>

              {mentionsContent && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">
                    Content (HTML):
                  </h3>
                  <div className="bg-gray-100 p-3 rounded-lg text-sm overflow-auto max-h-32">
                    <pre className="whitespace-pre-wrap text-xs text-gray-900">
                      {mentionsContent}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 space-y-6">
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Features Comparison:
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Basic Version:
                  </h4>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 text-sm">
                    <li>Automatic table detection from clipboard</li>
                    <li>Visual table rendering within input</li>
                    <li>Continue typing around tables</li>
                    <li>Multiple table support</li>
                    <li>Line break support with Enter key</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Enhanced Version:
                  </h4>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 text-sm">
                    <li>All basic features</li>
                    <li>Click to select tables</li>
                    <li>Delete tables with Delete/Backspace keys</li>
                    <li>Visual selection indicators</li>
                    <li>Editable table cells</li>
                    <li>Better spacing around tables</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Mentions Version:
                  </h4>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 text-sm">
                    <li>All enhanced features</li>
                    <li>@ trigger for mentions</li>
                    <li>Searchable user dropdown</li>
                    <li>Keyboard navigation (↑↓ Enter)</li>
                    <li>Styled mention pills</li>
                    <li>Real-time filtering</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                How to use mentions:
              </h3>
              <ol className="list-decimal list-inside text-gray-600 space-y-2">
                <li>
                  Type <code className="bg-gray-200 px-1 rounded">@</code> to
                  trigger the mentions dropdown
                </li>
                <li>Start typing a name to filter the list</li>
                <li>Use ↑↓ arrow keys to navigate the dropdown</li>
                <li>Press Enter or Tab to select a mention</li>
                <li>Press Escape to cancel mention selection</li>
                <li>Click on a mention in the dropdown to select it</li>
              </ol>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Available mentions:
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <span>👨‍💼</span>
                  <span>John Doe</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>👩‍💼</span>
                  <span>Jane Smith</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>👨‍🔧</span>
                  <span>Bob Johnson</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>👩‍🎨</span>
                  <span>Alice Brown</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>👨‍🏫</span>
                  <span>Charlie Wilson</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>👩‍⚕️</span>
                  <span>Diana Prince</span>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Sample Data for tables (copy and paste):
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">
                      Employee Data:
                    </h4>
                    <button
                      onClick={() =>
                        copyToClipboard(employeeData, "Employee Data")
                      }
                      className="px-3 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors flex items-center gap-1"
                    >
                      {copiedText === "Employee Data" ? (
                        <>
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          Copied!
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg font-mono text-sm text-gray-900">
                    <div className="whitespace-pre-line">
                      {employeeData.split("\n").map((line, index) => (
                        <div
                          key={index}
                          className={
                            index === 0
                              ? "font-semibold text-gray-800 border-b border-gray-300 pb-1 mb-1"
                              : ""
                          }
                        >
                          {line}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">Sales Data:</h4>
                    <button
                      onClick={() => copyToClipboard(salesData, "Sales Data")}
                      className="px-3 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors flex items-center gap-1"
                    >
                      {copiedText === "Sales Data" ? (
                        <>
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          Copied!
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg font-mono text-sm text-gray-900">
                    <div className="whitespace-pre-line">
                      {salesData.split("\n").map((line, index) => (
                        <div
                          key={index}
                          className={
                            index === 0
                              ? "font-semibold text-gray-800 border-b border-gray-300 pb-1 mb-1"
                              : ""
                          }
                        >
                          {line}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-3">
                Copy any sample data above and paste it into any input to see
                table functionality. In the mentions version, try typing "@"
                followed by a name!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
