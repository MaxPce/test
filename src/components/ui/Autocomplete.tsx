import { useState, useRef, useEffect } from "react";
import { Search, X, Loader2 } from "lucide-react";

export interface AutocompleteOption {
  value: number;
  label: string;
  sublabel?: string;
  imageUrl?: string;
}

interface AutocompleteProps {
  label?: string;
  placeholder?: string;
  options: AutocompleteOption[];
  value?: number;
  onChange: (value: number, option: AutocompleteOption) => void;
  onInputChange: (value: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
  required?: boolean;
  helperText?: string;
  error?: string;
  minSearchLength?: number;
}

export function Autocomplete({
  label,
  placeholder = "Buscar...",
  options = [],
  value,
  onChange,
  onInputChange,
  isLoading = false,
  disabled = false,
  required = false,
  helperText,
  error,
  minSearchLength = 2,
}: AutocompleteProps) {
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Encontrar opción seleccionada
  const selectedOption = options.find((opt) => opt.value === value);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Resetear índice resaltado cuando cambian las opciones
  useEffect(() => {
    setHighlightedIndex(0);
  }, [options]);

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue);
    onInputChange(newValue);
    setIsOpen(true);
  };

  const handleSelectOption = (option: AutocompleteOption) => {
    onChange(option.value, option);
    setInputValue("");
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleClear = () => {
    onChange(0, { value: 0, label: "" });
    setInputValue("");
    onInputChange("");
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter") {
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < options.length - 1 ? prev + 1 : prev,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case "Enter":
        e.preventDefault();
        if (options[highlightedIndex]) {
          handleSelectOption(options[highlightedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  const showResults =
    isOpen && inputValue.length >= minSearchLength && !selectedOption;
  const showMinLengthMessage =
    isOpen && inputValue.length > 0 && inputValue.length < minSearchLength;

  return (
    <div ref={wrapperRef} className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {/* Input o valor seleccionado */}
        {selectedOption ? (
          <div
            className={`flex items-center gap-3 w-full px-4 py-2.5 border rounded-lg bg-white ${
              error
                ? "border-red-300 focus-within:ring-red-500 focus-within:border-red-500"
                : "border-gray-300 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500"
            } ${disabled ? "bg-gray-50 cursor-not-allowed" : ""}`}
          >
            {selectedOption.imageUrl && (
              <img
                src={selectedOption.imageUrl}
                alt=""
                className="h-8 w-8 rounded-full object-cover flex-shrink-0"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">
                {selectedOption.label}
              </p>
              {selectedOption.sublabel && (
                <p className="text-sm text-gray-500 truncate">
                  {selectedOption.sublabel}
                </p>
              )}
            </div>
            {!disabled && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            )}
          </div>
        ) : (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              onFocus={() => setIsOpen(true)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              className={`w-full pl-10 pr-10 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                error
                  ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              } ${disabled ? "bg-gray-50 cursor-not-allowed" : "bg-white"}`}
            />
            {isLoading && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
            )}
          </div>
        )}

        {/* Dropdown con resultados */}
        {(showResults || showMinLengthMessage) && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-72 overflow-y-auto">
            {showMinLengthMessage ? (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                Escribe al menos {minSearchLength} caracteres para buscar
              </div>
            ) : isLoading ? (
              <div className="px-4 py-8 flex flex-col items-center gap-2">
                <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
                <p className="text-sm text-gray-500">Buscando...</p>
              </div>
            ) : options.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                No se encontraron resultados
              </div>
            ) : (
              options.map((option, index) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelectOption(option)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                    highlightedIndex === index
                      ? "bg-blue-50"
                      : "hover:bg-gray-50"
                  }`}
                >
                  {option.imageUrl && (
                    <img
                      src={option.imageUrl}
                      alt=""
                      className="h-10 w-10 rounded-full object-cover flex-shrink-0"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {option.label}
                    </p>
                    {option.sublabel && (
                      <p className="text-sm text-gray-600 truncate">
                        {option.sublabel}
                      </p>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Helper text o error */}
      {(helperText || error) && (
        <p
          className={`mt-1.5 text-sm ${
            error ? "text-red-600" : "text-gray-500"
          }`}
        >
          {error || helperText}
        </p>
      )}
    </div>
  );
}
