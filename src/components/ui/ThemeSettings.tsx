"use client";

import { useEffect, useState } from "react";
import { Sun, Moon, X, Type, BookOpen, Scroll, ChevronDown, ChevronUp } from "lucide-react";

export interface SpacingSettings {
  lineSpacing: number;
  characterSpacing: number;
  wordSpacing: number;
  margins: number;
}

interface ThemeSettingsProps {
  onFontSizeChange: (size: "small" | "medium" | "large") => void;
  currentSize: "small" | "medium" | "large";
  onSpacingChange: (settings: SpacingSettings) => void;
  currentSpacing: SpacingSettings;
}

/**
 * ThemeSettings component provides a comprehensive settings panel for theme and reading preferences.
 *
 * Features:
 * - Light/Dark theme toggle
 * - Sans-serif/Serif font toggle
 * - Font size controls
 * - Advanced spacing controls
 * - Persists all preferences to localStorage
 *
 * @example
 * ```tsx
 * <ThemeSettings />
 * ```
 */
export function ThemeSettings({
  onFontSizeChange,
  currentSize,
  onSpacingChange,
  currentSpacing,
}: ThemeSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [fontFamily, setFontFamily] = useState<"sans" | "serif">("sans");
  const [readingMode, setReadingMode] = useState<"scroll" | "page">("scroll");
  const [mounted, setMounted] = useState(false);

  // Load preferences from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const savedFont = localStorage.getItem("fontFamily") as "sans" | "serif" | null;
    const savedMode = localStorage.getItem("readingMode") as "scroll" | "page" | null;

    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = savedTheme || (prefersDark ? "dark" : "light");
    const initialFont = savedFont || "sans";
    const initialMode = savedMode || "scroll";

    setTheme(initialTheme);
    setFontFamily(initialFont);
    setReadingMode(initialMode);

    applyTheme(initialTheme);
    applyFont(initialFont);
    applyReadingMode(initialMode);
  }, []);

  const applyTheme = (newTheme: "light" | "dark") => {
    document.documentElement.setAttribute("data-theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const applyFont = (newFont: "sans" | "serif") => {
    if (newFont === "serif") {
      document.documentElement.classList.add("font-serif");
      document.documentElement.classList.remove("font-sans");
    } else {
      document.documentElement.classList.add("font-sans");
      document.documentElement.classList.remove("font-serif");
    }
  };

  const applyReadingMode = (newMode: "scroll" | "page") => {
    if (newMode === "page") {
      document.documentElement.classList.add("reading-page");
      document.documentElement.classList.remove("reading-scroll");
    } else {
      document.documentElement.classList.add("reading-scroll");
      document.documentElement.classList.remove("reading-page");
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    applyTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const toggleFont = () => {
    const newFont = fontFamily === "sans" ? "serif" : "sans";
    setFontFamily(newFont);
    applyFont(newFont);
    localStorage.setItem("fontFamily", newFont);
  };

  const toggleReadingMode = () => {
    const newMode = readingMode === "scroll" ? "page" : "scroll";
    setReadingMode(newMode);
    applyReadingMode(newMode);
    localStorage.setItem("readingMode", newMode);
  };

  const handleSpacingChange = (key: keyof SpacingSettings, value: number) => {
    const newSpacing = { ...currentSpacing, [key]: value };
    onSpacingChange(newSpacing);
  };

  // Avoid hydration mismatch
  if (!mounted) {
    return (
      <button className="btn btn-circle btn-sm bg-base-200 hover:bg-base-300 border border-base-300">
        <Sun className="w-5 h-5" />
      </button>
    );
  }

  return (
    <>
      {/* Settings Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="btn btn-circle btn-sm bg-base-200 hover:bg-base-300 border border-base-300"
        aria-label="Open theme settings"
      >
        <Type className="w-5 h-5" />
      </button>

      {/* Settings Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal Content */}
          <div className="relative bg-base-100 rounded-2xl shadow-2xl w-full max-w-md p-6 border border-base-300 max-h-[80vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Reading Settings</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="btn btn-circle btn-ghost btn-sm"
                aria-label="Close settings"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Font Size */}
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-3 opacity-70">Font Size</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => onFontSizeChange("small")}
                  className={`flex-1 px-3 py-2 rounded text-sm transition-colors ${
                    currentSize === "small"
                      ? "bg-primary text-primary-content"
                      : "bg-base-200 hover:bg-base-300"
                  }`}
                >
                  A
                </button>
                <button
                  onClick={() => onFontSizeChange("medium")}
                  className={`flex-1 px-3 py-2 rounded text-base transition-colors ${
                    currentSize === "medium"
                      ? "bg-primary text-primary-content"
                      : "bg-base-200 hover:bg-base-300"
                  }`}
                >
                  A
                </button>
                <button
                  onClick={() => onFontSizeChange("large")}
                  className={`flex-1 px-3 py-2 rounded text-lg transition-colors ${
                    currentSize === "large"
                      ? "bg-primary text-primary-content"
                      : "bg-base-200 hover:bg-base-300"
                  }`}
                >
                  A
                </button>
              </div>
            </div>

            {/* Theme Toggle */}
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-3 opacity-70">Appearance</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setTheme("light");
                    applyTheme("light");
                    localStorage.setItem("theme", "light");
                  }}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    theme === "light"
                      ? "border-primary bg-primary/10"
                      : "border-base-300 hover:border-base-400"
                  }`}
                >
                  <Sun className="w-6 h-6 mx-auto mb-2" />
                  <div className="text-sm font-medium">Light</div>
                </button>
                <button
                  onClick={() => {
                    setTheme("dark");
                    applyTheme("dark");
                    localStorage.setItem("theme", "dark");
                  }}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    theme === "dark"
                      ? "border-primary bg-primary/10"
                      : "border-base-300 hover:border-base-400"
                  }`}
                >
                  <Moon className="w-6 h-6 mx-auto mb-2" />
                  <div className="text-sm font-medium">Dark</div>
                </button>
              </div>
            </div>

            {/* Font Family Toggle */}
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-3 opacity-70">Font</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setFontFamily("sans");
                    applyFont("sans");
                    localStorage.setItem("fontFamily", "sans");
                  }}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    fontFamily === "sans"
                      ? "border-primary bg-primary/10"
                      : "border-base-300 hover:border-base-400"
                  }`}
                >
                  <div className="font-sans text-2xl font-bold mb-1">Aa</div>
                  <div className="text-sm font-medium">Sans-Serif</div>
                </button>
                <button
                  onClick={() => {
                    setFontFamily("serif");
                    applyFont("serif");
                    localStorage.setItem("fontFamily", "serif");
                  }}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    fontFamily === "serif"
                      ? "border-primary bg-primary/10"
                      : "border-base-300 hover:border-base-400"
                  }`}
                >
                  <div className="font-serif text-2xl font-bold mb-1">Aa</div>
                  <div className="text-sm font-medium">Serif</div>
                </button>
              </div>
            </div>

            {/* Advanced Toggle */}
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full flex items-center justify-between py-3 text-sm font-medium hover:opacity-70 transition-opacity border-t border-base-300 mb-4"
            >
              <span>Advanced Spacing</span>
              {showAdvanced ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {/* Advanced Controls */}
            {showAdvanced && (
              <div className="mb-6 space-y-6">
                {/* Line Spacing */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-medium opacity-60 uppercase">
                      Line Spacing
                    </label>
                    <span className="text-sm font-medium">
                      {currentSpacing.lineSpacing.toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="2"
                    step="0.05"
                    value={currentSpacing.lineSpacing}
                    onChange={(e) =>
                      handleSpacingChange("lineSpacing", parseFloat(e.target.value))
                    }
                    className="range range-xs range-primary w-full"
                  />
                </div>

                {/* Character Spacing */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-medium opacity-60 uppercase">
                      Character Spacing
                    </label>
                    <span className="text-sm font-medium">
                      {currentSpacing.characterSpacing}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-5"
                    max="20"
                    step="1"
                    value={currentSpacing.characterSpacing}
                    onChange={(e) =>
                      handleSpacingChange("characterSpacing", parseInt(e.target.value))
                    }
                    className="range range-xs range-primary w-full"
                  />
                </div>

                {/* Word Spacing */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-medium opacity-60 uppercase">
                      Word Spacing
                    </label>
                    <span className="text-sm font-medium">
                      {currentSpacing.wordSpacing}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-10"
                    max="50"
                    step="5"
                    value={currentSpacing.wordSpacing}
                    onChange={(e) =>
                      handleSpacingChange("wordSpacing", parseInt(e.target.value))
                    }
                    className="range range-xs range-primary w-full"
                  />
                </div>

                {/* Margins */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-medium opacity-60 uppercase">
                      Margins
                    </label>
                    <span className="text-sm font-medium">
                      {currentSpacing.margins}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    step="5"
                    value={currentSpacing.margins}
                    onChange={(e) =>
                      handleSpacingChange("margins", parseInt(e.target.value))
                    }
                    className="range range-xs range-primary w-full"
                  />
                </div>

                {/* Reset Button */}
                <button
                  onClick={() => {
                    onSpacingChange({
                      lineSpacing: 1.75,
                      characterSpacing: 0,
                      wordSpacing: 0,
                      margins: 0,
                    });
                  }}
                  className="w-full btn btn-sm btn-outline"
                >
                  Reset Spacing
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
