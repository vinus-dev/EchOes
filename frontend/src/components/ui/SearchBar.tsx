import { useState, useRef, useEffect } from "react";
import type { KeyboardEvent } from "react";
import "./SearchBar.css";

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  hints?: string[];
}

export default function SearchBar({
  onSearch,
  isLoading = false,
  placeholder = "Enter a number or name...",
  hints = ["42", "vinayak", "23", "rohit", "7", "priya"],
}: SearchBarProps) {
  const [value, setValue] = useState("");
  const [hintIndex, setHintIndex] = useState(0);
  const [displayHint, setDisplayHint] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Typewriter hint animation
  useEffect(() => {
    if (isFocused || value) return;
    const hint = hints[hintIndex];
    let i = 0;
    let timeout: ReturnType<typeof setTimeout>;

    const typeNext = () => {
      if (i <= hint.length) {
        setDisplayHint(hint.slice(0, i));
        i++;
        timeout = setTimeout(typeNext, 100);
      } else {
        timeout = setTimeout(() => {
          let del = hint.length;
          const erase = () => {
            if (del >= 0) {
              setDisplayHint(hint.slice(0, del));
              del--;
              timeout = setTimeout(erase, 60);
            } else {
              setHintIndex((h) => (h + 1) % hints.length);
            }
          };
          erase();
        }, 1800);
      }
    };

    typeNext();
    return () => clearTimeout(timeout);
  }, [hintIndex, hints, isFocused, value]);

  const handleSubmit = () => {
    if (!value.trim() || isLoading) return;
    onSearch(value.trim());
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className={`searchbar-wrapper ${isFocused ? "focused" : ""}`}>
      <div className="searchbar-glow" />
      <div className="searchbar-container glass">
        <span className="searchbar-icon">🔮</span>
        <input
          ref={inputRef}
          className="searchbar-input"
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKey}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={isFocused || value ? placeholder : displayHint || placeholder}
          maxLength={50}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          aria-label="Search for a memory"
          disabled={isLoading}
        />
        {value && !isLoading && (
          <button className="searchbar-clear" onClick={() => setValue("")} aria-label="Clear">
            ✕
          </button>
        )}
        <button
          className={`searchbar-btn ${isLoading ? "loading" : ""}`}
          onClick={handleSubmit}
          disabled={!value.trim() || isLoading}
          aria-label="Search"
        >
          {isLoading ? <span className="searchbar-spinner" /> : <span>→</span>}
        </button>
      </div>
    </div>
  );
}
