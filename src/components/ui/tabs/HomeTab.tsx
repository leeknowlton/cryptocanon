"use client";

import { useState, useRef, useEffect } from "react";
import type { ReactNode } from "react";
import { ExternalLink, List } from "lucide-react";
import {
  paperMetadata,
  abstract,
  sections,
  references,
} from "~/lib/bitcoinPaper";
import {
  ThemeSettings,
  type SpacingSettings,
} from "~/components/ui/ThemeSettings";
import { ElevenLabsAudioNative } from "~/components/ui/ElevenLabsAudioNative";

/**
 * HomeTab component displays the Bitcoin whitepaper in a beautiful reading format.
 *
 * Features:
 * - Collapsible table of contents
 * - Smooth scrolling navigation
 * - Clean typography optimized for reading
 * - Responsive design for all screen sizes
 * - Font size adjustment
 *
 * @example
 * ```tsx
 * <HomeTab />
 * ```
 */
export function HomeTab() {
  const [showToc, setShowToc] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("");
  const [fontSize, setFontSize] = useState<"small" | "medium" | "large">(
    "medium"
  );
  const [spacing, setSpacing] = useState<SpacingSettings>({
    lineSpacing: 1.75,
    characterSpacing: 0,
    wordSpacing: 0,
    margins: 0,
  });
  const contentRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const tocButtonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const tocPopoverRef = useRef<HTMLDivElement>(null);
  const [tocAnchor, setTocAnchor] = useState<"top" | "bottom">("top");
  const [showFooterControls, setShowFooterControls] = useState(false);

  // Track reference occurrences to generate unique IDs and track first occurrence
  const refOccurrencesRef = useRef<Record<number, number>>({});
  const firstRefOccurrenceRef = useRef<Record<number, string>>({});

  // Load preferences from localStorage
  useEffect(() => {
    const savedSize = localStorage.getItem("fontSize") as
      | "small"
      | "medium"
      | "large"
      | null;
    const savedSpacing = localStorage.getItem("spacingSettings");

    if (savedSize) {
      setFontSize(savedSize);
    }
    if (savedSpacing) {
      setSpacing(JSON.parse(savedSpacing));
    }
  }, []);

  const handleFontSizeChange = (size: "small" | "medium" | "large") => {
    setFontSize(size);
    localStorage.setItem("fontSize", size);
  };

  const handleSpacingChange = (newSpacing: SpacingSettings) => {
    setSpacing(newSpacing);
    localStorage.setItem("spacingSettings", JSON.stringify(newSpacing));
  };

  // Generate dynamic styles based on spacing settings
  const getTextStyle = () => ({
    lineHeight: spacing.lineSpacing,
    letterSpacing: `${spacing.characterSpacing / 100}em`,
    wordSpacing: `${spacing.wordSpacing / 100}em`,
  });

  const getContainerStyle = () => ({
    paddingLeft: `${spacing.margins}px`,
    paddingRight: `${spacing.margins}px`,
  });

  // Font size classes
  const fontSizeClasses = {
    small: "text-sm",
    medium: "text-base",
    large: "text-lg",
  };

  const headingClasses = {
    small: {
      h1: "text-2xl md:text-3xl",
      h2: "text-xl",
    },
    medium: {
      h1: "text-3xl md:text-4xl",
      h2: "text-2xl",
    },
    large: {
      h1: "text-4xl md:text-5xl",
      h2: "text-3xl",
    },
  };

  // Track which section is currently visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.5, rootMargin: "-20% 0px -70% 0px" }
    );

    const sectionElements = document.querySelectorAll("[data-section]");
    sectionElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  // Track when the top toolbar leaves the viewport so we can mirror controls in the footer
  useEffect(() => {
    const toolbarEl = toolbarRef.current;
    if (!toolbarEl) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowFooterControls(!entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(toolbarEl);

    return () => observer.disconnect();
  }, []);

  // Close the table of contents when clicking outside or pressing escape
  useEffect(() => {
    if (!showToc) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        tocPopoverRef.current?.contains(target) ||
        tocButtonRefs.current.some((button) => button?.contains(target))
      ) {
        return;
      }
      setShowToc(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowToc(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showToc]);

  const setTocButtonRef =
    (index: number) => (node: HTMLButtonElement | null) => {
      tocButtonRefs.current[index] = node;
    };

  const handleToggleToc = (anchor: "top" | "bottom") => {
    setShowToc((prev) => {
      const nextState = anchor === tocAnchor ? !prev : true;
      return nextState;
    });
    setTocAnchor(anchor);
  };

  const renderContentWithReferences = (text: string) => {
    const nodes: ReactNode[] = [];
    const referencePattern = /\[([0-9]+(?:-[0-9]+)?)\]/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    let partIndex = 0;

    while ((match = referencePattern.exec(text)) !== null) {
      if (match.index > lastIndex) {
        nodes.push(
          <span key={`text-${partIndex++}`}>
            {text.slice(lastIndex, match.index)}
          </span>
        );
      }

      const label = match[1];
      const anchorTarget = label.includes("-")
        ? Number(label.split("-")[0])
        : Number(label);

      // Track occurrence count for this reference
      const occurrenceCount = refOccurrencesRef.current[anchorTarget] ?? 0;
      refOccurrencesRef.current[anchorTarget] = occurrenceCount + 1;

      // Generate unique ID for this occurrence
      const uniqueId = `ref-link-${anchorTarget}-${occurrenceCount}`;

      // Store first occurrence ID
      if (!firstRefOccurrenceRef.current[anchorTarget]) {
        firstRefOccurrenceRef.current[anchorTarget] = uniqueId;
      }

      nodes.push(
        <a
          key={`ref-${partIndex++}`}
          id={uniqueId}
          href={`#reference-${anchorTarget}`}
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          [{label}]
        </a>
      );

      lastIndex = referencePattern.lastIndex;
    }

    if (lastIndex < text.length) {
      nodes.push(
        <span key={`text-${partIndex++}`}>{text.slice(lastIndex)}</span>
      );
    }

    return nodes;
  };

  const renderReferenceText = (ref: (typeof references)[number]) => {
    if (!ref.links?.length) {
      return ref.text;
    }

    let fragments: ReactNode[] = [ref.text];
    const unmatched: Array<{ text: string; url: string }> = [];

    ref.links.forEach((link, linkIndex) => {
      let matched = false;
      const nextFragments: ReactNode[] = [];

      fragments.forEach((fragment, fragmentIndex) => {
        if (typeof fragment !== "string") {
          nextFragments.push(fragment);
          return;
        }

        const parts = fragment.split(link.text);
        if (parts.length === 1) {
          nextFragments.push(fragment);
          return;
        }

        matched = true;

        parts.forEach((part, partIndex) => {
          if (part) {
            nextFragments.push(part);
          }
          if (partIndex < parts.length - 1) {
            nextFragments.push(
              <a
                key={`ref-${ref.id}-${linkIndex}-${fragmentIndex}-${partIndex}`}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                {link.text}
              </a>
            );
          }
        });
      });

      fragments = nextFragments;

      if (!matched) {
        unmatched.push(link);
      }
    });

    if (unmatched.length > 0) {
      const trailing: ReactNode[] = [];
      unmatched.forEach((link, idx) => {
        trailing.push(
          <a
            key={`ref-${ref.id}-unmatched-${idx}`}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            {link.text}
          </a>
        );
        if (idx < unmatched.length - 1) {
          trailing.push("; ");
        }
      });

      fragments.push(" (", ...trailing, ")");
    }

    return fragments;
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      // Use native scrollIntoView which respects scroll-margin-top
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      setShowToc(false);
    }
  };

  return (
    <div
      className="w-full max-w-4xl mx-auto px-4 py-6 pb-24 relative"
      ref={contentRef}
    >
      {/* Top Toolbar */}
      <div
        ref={toolbarRef}
        className="flex items-center justify-end gap-3 mb-6"
      >
        <button
          ref={setTocButtonRef(0)}
          onClick={() => handleToggleToc("top")}
          className="btn btn-circle btn-sm bg-base-200 hover:bg-base-300 border border-base-300"
          aria-label="Toggle table of contents"
          aria-expanded={showToc}
        >
          <List className="w-5 h-5" />
        </button>

        <ThemeSettings
          onFontSizeChange={handleFontSizeChange}
          currentSize={fontSize}
          onSpacingChange={handleSpacingChange}
          currentSpacing={spacing}
        />
      </div>

      {/* Table of Contents Popover */}
      {showToc && (
        <div
          ref={tocPopoverRef}
          className={`z-40 w-72 rounded-2xl border border-base-300 bg-base-100 shadow-2xl ${
            tocAnchor === "top"
              ? "absolute right-4 top-16"
              : "fixed left-1/2 bottom-24 -translate-x-1/2"
          }`}
        >
          {tocAnchor === "top" ? (
            <div className="absolute -top-2 right-12 h-4 w-4 rotate-45 border border-base-300 border-b-0 border-r-0 bg-base-100" />
          ) : (
            <div className="absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border border-base-300 border-t-0 border-l-0 bg-base-100" />
          )}

          <div className="px-5 pt-4 pb-3">
            <h3 className="text-sm font-medium text-center uppercase tracking-wide text-base-content/60">
              Contents
            </h3>
          </div>

          <nav className="max-h-96 overflow-y-auto px-3 pb-4">
            <ol className="space-y-1 text-sm">
              <li>
                <button
                  onClick={() => scrollToSection("abstract")}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-colors hover:bg-base-200 ${
                    activeSection === "abstract"
                      ? "bg-primary/10 font-semibold text-primary"
                      : ""
                  }`}
                >
                  <span>Abstract</span>
                </button>
              </li>
              {sections.map((section) => (
                <li key={section.id}>
                  <button
                    onClick={() => scrollToSection(section.id)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-colors hover:bg-base-200 ${
                      activeSection === section.id
                        ? "bg-primary/10 font-semibold text-primary"
                        : ""
                    }`}
                  >
                    <span>{section.title}</span>
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={() => scrollToSection("references")}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-colors hover:bg-base-200 ${
                    activeSection === "references"
                      ? "bg-primary/10 font-semibold text-primary"
                      : ""
                  }`}
                >
                  <span>References</span>
                </button>
              </li>
            </ol>
          </nav>
        </div>
      )}

      {/* Footer Controls */}
      {showFooterControls && (
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-30 flex justify-center">
          <div className="pointer-events-auto inline-flex items-center gap-3 rounded-full border border-base-300 bg-base-100 px-4 py-2 shadow-xl">
            <button
              ref={setTocButtonRef(1)}
              onClick={() => handleToggleToc("bottom")}
              className="btn btn-circle btn-sm bg-base-200 hover:bg-base-300 border border-base-300"
              aria-label="Toggle table of contents"
              aria-expanded={showToc}
            >
              <List className="w-5 h-5" />
            </button>

            <ThemeSettings
              onFontSizeChange={handleFontSizeChange}
              currentSize={fontSize}
              onSpacingChange={handleSpacingChange}
              currentSpacing={spacing}
            />
          </div>
        </div>
      )}

      {/* Header */}
      <header className="mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
        {/* Title */}
        <h1
          className={`${headingClasses[fontSize].h1} font-bold leading-tight mb-3`}
        >
          {paperMetadata.title}
        </h1>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-600 dark:text-gray-400">
          <span className="font-medium">{paperMetadata.author}</span>
          <span className="hidden sm:inline">•</span>
          <span>{paperMetadata.date}</span>
        </div>
        <a
          href={paperMetadata.pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 mt-4 text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          View Original PDF
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
        <div className="mt-4 w-full">
          <ElevenLabsAudioNative publicUserId="c7fa0888ce8d3d7f6f27a113361dcbd6cd738a8b68cef914c0bad17eaadb46a5" />
        </div>
      </header>

      {/* Abstract */}
      <section
        id="abstract"
        data-section
        className="mb-10 scroll-mt-20"
        style={getContainerStyle()}
      >
        <h2 className={`${headingClasses[fontSize].h2} font-bold mb-4`}>
          Abstract
        </h2>
        <p
          className={`${fontSizeClasses[fontSize]} text-gray-800 dark:text-gray-200`}
          style={getTextStyle()}
        >
          {renderContentWithReferences(abstract)}
        </p>
      </section>

      {/* Sections */}
      {sections.map((section) => (
        <section
          key={section.id}
          id={section.id}
          data-section
          className="mb-10 scroll-mt-20"
          style={getContainerStyle()}
        >
          <h2 className={`${headingClasses[fontSize].h2} font-bold mb-4`}>
            {section.title}
          </h2>
          <div className="space-y-4">
            {section.content.map((paragraph, idx) => (
              <p
                key={idx}
                className={`${fontSizeClasses[fontSize]} text-gray-800 dark:text-gray-200 whitespace-pre-line`}
                style={getTextStyle()}
              >
                {renderContentWithReferences(paragraph)}
              </p>
            ))}
          </div>
        </section>
      ))}

      {/* References */}
      <section
        id="references"
        data-section
        className="mb-10 scroll-mt-2"
        style={getContainerStyle()}
      >
        <h2 className={`${headingClasses[fontSize].h2} font-bold mb-4`}>
          References
        </h2>
        <ol className="space-y-4">
          {references.map((ref) => (
            <li
              key={ref.id}
              id={`reference-${ref.id}`}
              className={`${fontSizeClasses[fontSize]} text-gray-800 dark:text-gray-200`}
              style={getTextStyle()}
            >
              <span className="font-medium">[{ref.id}]</span>{" "}
              {renderReferenceText(ref)}{" "}
              <a
                href={`#${
                  firstRefOccurrenceRef.current[ref.id] ||
                  `ref-link-${ref.id}-0`
                }`}
                className="text-blue-600 dark:text-blue-400 hover:underline ml-1"
                title={`Jump back to reference [${ref.id}]`}
              >
                ↩
              </a>
            </li>
          ))}
        </ol>
      </section>

      {/* Footer Attribution */}
      <footer className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>
          Content sourced from{" "}
          <a
            href="https://nakamotoinstitute.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Nakamoto Institute
          </a>
        </p>
      </footer>
    </div>
  );
}
