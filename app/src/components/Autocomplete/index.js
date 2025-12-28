import React, { useState, useRef } from 'react';
import './Autocomplete.css';

const Autocomplete = ({
  items = [],
  value = '',
  onChange,
  onSelect,
  inputProps = {},
  shouldItemRender = (item, value) => item.toLowerCase().includes(value.toLowerCase())
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef(null);

  const filteredItems = items.filter(item => shouldItemRender(item, value));

  const handleInputChange = (event) => {
    const newValue = event.target.value;
    if (onChange) {
      onChange(event);
    }
    setIsOpen(newValue.length > 0 && filteredItems.length > 0);
    setHighlightedIndex(-1);
  };

  const handleItemClick = (item) => {
    if (onSelect) {
      onSelect(item);
    }
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (event) => {
    if (!isOpen) {
      if (event.key === 'ArrowDown' && filteredItems.length > 0) {
        setIsOpen(true);
        setHighlightedIndex(0);
        event.preventDefault();
      }
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredItems.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        event.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : 0);
        break;
      case 'Enter':
        event.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredItems.length) {
          handleItemClick(filteredItems[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
      default:
        break;
    }
  };

  const handleBlur = () => {
    setTimeout(() => {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }, 200);
  };

  const handleFocus = () => {
    if (value.length > 0 && filteredItems.length > 0) {
      setIsOpen(true);
    }
  };

  return (
    <div className="autocomplete-wrapper">
      <input
        {...inputProps}
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        onFocus={handleFocus}
        autoComplete="off"
      />
      {isOpen && filteredItems.length > 0 && (
        <div className="autocomplete-items">
          {filteredItems.map((item, index) => (
            <div
              key={item}
              className={`autocomplete-item ${index === highlightedIndex ? 'active' : ''}`}
              onClick={() => handleItemClick(item)}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              {item}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Autocomplete;

