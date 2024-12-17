// Select2MultiSelect.js
import React, { useEffect, useRef } from "react";
import $ from "jquery";
import "select2";
import "select2/dist/css/select2.min.css"; // Import the select2 CSS

function Select2MultiSelect({ options, value, onChange }) {
  const selectRef = useRef();

  useEffect(() => {
    $(selectRef.current)
      .select2({
        placeholder: "Pilih opsi...",
        allowClear: true,
        multiple: true,
        width: "100%", // Optional, adjust as needed
      })
      .on("change", (e) => {
        const selectedValues = $(e.target).val();
        onChange(selectedValues);
      });

    return () => {
      $(selectRef.current).select2("destroy");
    };
  }, [onChange]);

  return (
    <select ref={selectRef} value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export default Select2MultiSelect;
