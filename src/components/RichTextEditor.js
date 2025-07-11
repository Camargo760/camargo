"use client"

import { useState, useRef, useEffect } from "react"
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Palette,
  Type,
} from "lucide-react"

export default function RichTextEditor({ value, onChange, siteTheme }) {
  const editorRef = useRef(null)
  const [showTextColorPicker, setShowTextColorPicker] = useState(false)
  const [showBgColorPicker, setShowBgColorPicker] = useState(false)

  const colors = [
    "#000000",
    "#333333",
    "#666666",
    "#999999",
    "#CCCCCC",
    "#FFFFFF",
    "#FF0000",
    "#FF6600",
    "#FFCC00",
    "#00FF00",
    "#0066FF",
    "#6600FF",
    "#FF0066",
    "#FF3366",
    "#FF6699",
    "#66FF00",
    "#0099FF",
    "#9900FF",
  ]

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || ""
    }
  }, [value])

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  const applyFormat = (command, value = null) => {
    const selection = window.getSelection()
    if (!selection.rangeCount) return

    const range = selection.getRangeAt(0)

    if (command === "bold") {
      const span = document.createElement("span")
      span.style.fontWeight = "bold"
      try {
        range.surroundContents(span)
      } catch (e) {
        span.innerHTML = range.toString()
        range.deleteContents()
        range.insertNode(span)
      }
    } else if (command === "italic") {
      const span = document.createElement("span")
      span.style.fontStyle = "italic"
      try {
        range.surroundContents(span)
      } catch (e) {
        span.innerHTML = range.toString()
        range.deleteContents()
        range.insertNode(span)
      }
    } else if (command === "underline") {
      const span = document.createElement("span")
      span.style.textDecoration = "underline"
      try {
        range.surroundContents(span)
      } catch (e) {
        span.innerHTML = range.toString()
        range.deleteContents()
        range.insertNode(span)
      }
    } else if (command === "foreColor") {
      const span = document.createElement("span")
      span.style.color = value
      try {
        range.surroundContents(span)
      } catch (e) {
        span.innerHTML = range.toString()
        range.deleteContents()
        range.insertNode(span)
      }
    } else if (command === "backColor") {
      const span = document.createElement("span")
      span.style.backgroundColor = value
      try {
        range.surroundContents(span)
      } catch (e) {
        span.innerHTML = range.toString()
        range.deleteContents()
        range.insertNode(span)
      }
    }

    handleInput()
  }

  const insertList = (ordered = false) => {
    const selection = window.getSelection()
    if (!selection.rangeCount) return

    const range = selection.getRangeAt(0)
    const listElement = document.createElement(ordered ? "ol" : "ul")
    const listItem = document.createElement("li")

    // Add bullet point styling
    listElement.style.listStyleType = ordered ? "decimal" : "disc"
    listElement.style.paddingLeft = "20px"
    listElement.style.marginLeft = "10px"
    listItem.style.display = "list-item"
    listItem.style.listStyleType = ordered ? "decimal" : "disc"
    listItem.style.marginBottom = "4px"
    listItem.style.paddingLeft = "5px"

    if (range.toString()) {
      listItem.innerHTML = range.toString()
      range.deleteContents()
    } else {
      listItem.innerHTML = "List item"
    }

    listElement.appendChild(listItem)
    range.insertNode(listElement)

    // Position cursor at end of list item
    const newRange = document.createRange()
    newRange.selectNodeContents(listItem)
    newRange.collapse(false)
    selection.removeAllRanges()
    selection.addRange(newRange)

    handleInput()
  }

  const setAlignment = (align) => {
    const selection = window.getSelection()
    if (!selection.rangeCount) return

    const range = selection.getRangeAt(0)
    const div = document.createElement("div")
    div.style.textAlign = align

    try {
      range.surroundContents(div)
    } catch (e) {
      div.innerHTML = range.toString()
      range.deleteContents()
      range.insertNode(div)
    }

    handleInput()
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      const selection = window.getSelection()
      if (selection.rangeCount) {
        const range = selection.getRangeAt(0)
        const container = range.commonAncestorContainer

        // Check if we're in a list item
        let listItem = container.nodeType === Node.TEXT_NODE ? container.parentElement : container
        while (listItem && listItem.tagName !== "LI" && listItem !== editorRef.current) {
          listItem = listItem.parentElement
        }

        if (listItem && listItem.tagName === "LI" && listItem.textContent.trim() === "") {
          e.preventDefault()
          // Exit the list
          const list = listItem.parentElement
          const br = document.createElement("br")
          list.parentElement.insertBefore(br, list.nextSibling)
          listItem.remove()

          // Position cursor after the list
          const newRange = document.createRange()
          newRange.setStartAfter(br)
          newRange.collapse(true)
          selection.removeAllRanges()
          selection.addRange(newRange)

          handleInput()
        }
      }
    }
  }

  return (
    <div
      className="border rounded-lg"
      style={{
        backgroundColor: siteTheme.secondaryBgColor,
        borderColor: siteTheme.borderColor,
      }}
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 p-3 border-b" style={{ borderColor: siteTheme.borderColor }}>
        <button
          type="button"
          onClick={() => applyFormat("bold")}
          className="p-2 rounded hover:opacity-80"
          style={{ backgroundColor: siteTheme.cardBgColor }}
          title="Bold"
        >
          <Bold size={16} />
        </button>

        <button
          type="button"
          onClick={() => applyFormat("italic")}
          className="p-2 rounded hover:opacity-80"
          style={{ backgroundColor: siteTheme.cardBgColor }}
          title="Italic"
        >
          <Italic size={16} />
        </button>

        <button
          type="button"
          onClick={() => applyFormat("underline")}
          className="p-2 rounded hover:opacity-80"
          style={{ backgroundColor: siteTheme.cardBgColor }}
          title="Underline"
        >
          <Underline size={16} />
        </button>

        <div className="w-px h-6" style={{ backgroundColor: siteTheme.borderColor }} />

        {/* Text Color */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowTextColorPicker(!showTextColorPicker)}
            className="p-2 rounded hover:opacity-80"
            style={{ backgroundColor: siteTheme.cardBgColor }}
            title="Text Color"
          >
            <Type size={16} />
          </button>

          {showTextColorPicker && (
            <div
            className="absolute -translate-x-1/2 mt-1 justify-center flex flex-wrap gap-4 rounded max-w-[150px] min-w-[150px]"
              style={{
                backgroundColor: siteTheme.cardBgColor,
                borderColor: siteTheme.borderColor,
              }}
            >
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => {
                    applyFormat("foreColor", color)
                    setShowTextColorPicker(false)
                  }}
                  className="w-6 h-6 mt-1 mb-1 rounded border"
                  style={{ backgroundColor: color, borderColor: siteTheme.borderColor }}
                  title={color}
                />
              ))}
            </div>
          )}
        </div>

        {/* Background Color */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowBgColorPicker(!showBgColorPicker)}
            className="p-2 rounded hover:opacity-80"
            style={{ backgroundColor: siteTheme.cardBgColor }}
            title="Background Color"
          >
            <Palette size={16} />
          </button>

          {showBgColorPicker && (
            <div
              className="absolute -translate-x-1/2 mt-1 justify-center flex flex-wrap gap-4 rounded max-w-[150px] min-w-[150px]"
              style={{
                backgroundColor: siteTheme.cardBgColor,
                borderColor: siteTheme.borderColor,
              }}
            >
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => {
                    applyFormat("backColor", color)
                    setShowBgColorPicker(false)
                  }}
                  className="w-6 h-6 mt-1 mb-1 rounded border"
                  style={{ backgroundColor: color, borderColor: siteTheme.borderColor }}
                  title={color}
                />
              ))}
            </div>
          )}
        </div>

        <div className="w-px h-6" style={{ backgroundColor: siteTheme.borderColor }} />

        <button
          type="button"
          onClick={() => insertList(false)}
          className="p-2 rounded hover:opacity-80"
          style={{ backgroundColor: siteTheme.cardBgColor }}
          title="Bullet List"
        >
          <List size={16} />
        </button>

        <button
          type="button"
          onClick={() => insertList(true)}
          className="p-2 rounded hover:opacity-80"
          style={{ backgroundColor: siteTheme.cardBgColor }}
          title="Numbered List"
        >
          <ListOrdered size={16} />
        </button>

        <div className="w-px h-6" style={{ backgroundColor: siteTheme.borderColor }} />

        <button
          type="button"
          onClick={() => setAlignment("left")}
          className="p-2 rounded hover:opacity-80"
          style={{ backgroundColor: siteTheme.cardBgColor }}
          title="Align Left"
        >
          <AlignLeft size={16} />
        </button>

        <button
          type="button"
          onClick={() => setAlignment("center")}
          className="p-2 rounded hover:opacity-80"
          style={{ backgroundColor: siteTheme.cardBgColor }}
          title="Align Center"
        >
          <AlignCenter size={16} />
        </button>

        <button
          type="button"
          onClick={() => setAlignment("right")}
          className="p-2 rounded hover:opacity-80"
          style={{ backgroundColor: siteTheme.cardBgColor }}
          title="Align Right"
        >
          <AlignRight size={16} />
        </button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        className="min-h-[200px] p-4 focus:outline-none rich-text-editor"
        style={{
          color: siteTheme.textColor,
          backgroundColor: siteTheme.secondaryBgColor,
          direction: "ltr",
          textAlign: "left",
          writingMode: "horizontal-tb",
        }}
        placeholder="Write your comprehensive product description here..."
      />

      {/* Click outside to close color pickers */}
      {(showTextColorPicker || showBgColorPicker) && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => {
            setShowTextColorPicker(false)
            setShowBgColorPicker(false)
          }}
        />
      )}

      {/* Custom styles for the editor content */}
      <style jsx global>{`
        .rich-text-editor {
          direction: ltr !important;
          text-align: left !important;
          writing-mode: horizontal-tb !important;
          unicode-bidi: normal !important;
        }
        
        .rich-text-editor * {
          direction: ltr !important;
          unicode-bidi: normal !important;
        }
        
        .rich-text-editor ul {
          list-style-type: disc !important;
          padding-left: 20px !important;
          margin-left: 10px !important;
          margin-bottom: 16px !important;
          direction: ltr !important;
        }
        
        .rich-text-editor ol {
          list-style-type: decimal !important;
          padding-left: 20px !important;
          margin-left: 10px !important;
          margin-bottom: 16px !important;
          direction: ltr !important;
        }
        
        .rich-text-editor li {
          margin-bottom: 8px !important;
          padding-left: 8px !important;
          line-height: 1.6 !important;
          display: list-item !important;
          direction: ltr !important;
          text-align: left !important;
        }
        
        .rich-text-editor ul li {
          list-style-type: disc !important;
        }
        
        .rich-text-editor ol li {
          list-style-type: decimal !important;
        }
        
        .rich-text-editor li::marker {
          color: #fff !important;
          font-weight: bold !important;
        }
        
        .rich-text-editor p {
          margin-bottom: 12px !important;
          line-height: 1.6 !important;
          direction: ltr !important;
          text-align: left !important;
        }
        
        .rich-text-editor a {
          color: #3b82f6 !important;
          text-decoration: underline !important;
        }
        
        .rich-text-editor a:hover {
          color: #1d4ed8 !important;
        }
      `}</style>
    </div>
  )
}
