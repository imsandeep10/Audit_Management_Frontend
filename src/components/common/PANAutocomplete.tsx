import React, { useState, useRef, useEffect } from "react";
import { Input } from "../ui/input";
import { type CustomerSuggestion } from "../../api/BillsService";

interface PANAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onCustomerSelect: (customer: CustomerSuggestion) => void;
  suggestions: CustomerSuggestion[];
  placeholder?: string;
  className?: string;
  maxLength?: number;
  onInput?: (e: React.FormEvent<HTMLInputElement>) => void;
  required?: boolean;
  name?: string;
  isLoading?: boolean;
}

export const PANAutocomplete: React.FC<PANAutocompleteProps> = ({
  value,
  onChange,
  onCustomerSelect,
  suggestions,
  placeholder = "Enter 9-digit PAN number",
  className = "w-full",
  maxLength = 9,
  onInput,
  required = false,
  name,
  isLoading = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<CustomerSuggestion[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value && value.length > 0) {
      const filtered = suggestions.filter((suggestion) =>
        suggestion.customerPan.toLowerCase().includes(value.toLowerCase()) ||
        suggestion.customerName.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setIsOpen(filtered.length > 0);
    } else {
      setFilteredSuggestions(suggestions);
      setIsOpen(false);
    }
    setHighlightedIndex(-1);
  }, [value, suggestions]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
  };

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setFilteredSuggestions(suggestions);
      setIsOpen(true);
    }
  };

  const handleSuggestionClick = (suggestion: CustomerSuggestion) => {
    onChange(suggestion.customerPan);
    onCustomerSelect(suggestion);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) => 
          prev < filteredSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredSuggestions[highlightedIndex]) {
          handleSuggestionClick(filteredSuggestions[highlightedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        name={name}
        value={value}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onKeyDown={handleKeyDown}
        onInput={onInput}
        placeholder={placeholder}
        className={className}
        maxLength={maxLength}
        required={required}
        autoComplete="off"
      />
      
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {isLoading ? (
            <div className="px-4 py-3 text-center text-gray-500">
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span>Loading customer data...</span>
              </div>
            </div>
          ) : filteredSuggestions.length > 0 ? (
            <>
              {filteredSuggestions.map((suggestion, index) => (
                <div
                  key={`${suggestion.customerPan}-${index}`}
                  className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                    index === highlightedIndex ? "bg-gray-100" : ""
                  }`}
                  onClick={() => handleSuggestionClick(suggestion)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  <div className="flex flex-col">
                    <div className="font-medium text-sm">{suggestion.customerName}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-2">
                      <span>PAN: {suggestion.customerPan}</span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {suggestion.billType}
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {suggestion.documentType.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              
              {value && value.length >= 9 && !filteredSuggestions.some(s => s.customerPan === value) && (
                <div className="px-4 py-2 text-sm text-gray-500 border-t">
                  <div className="flex items-center gap-2">
                    <span>Use new PAN: {value}</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      New
                    </span>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="px-4 py-2 text-sm text-gray-500">
              No customers found. Enter a PAN number to create new customer.
            </div>
          )}
        </div>
      )}
    </div>
  );
};