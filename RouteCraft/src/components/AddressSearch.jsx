import React, { useState } from "react";
import { Autocomplete, TextField, CircularProgress } from "@mui/material";

const AddressAutocomplete = ({ onSelect }) => {
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAddresses = async (query) => {
    if (query.length < 3) return; // Avoid too many API calls
    setLoading(true);

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
      );
      const data = await res.json();
      setOptions(data.map((place) => place.display_name));  // Only return the display_name (string)
    } catch (error) {
      console.error("Error fetching addresses:", error);
    }

    setLoading(false);
  };

  return (
    <Autocomplete
      freeSolo
      options={options}
      loading={loading}
      onInputChange={(e, value) => {
        setInputValue(value);
        fetchAddresses(value);
      }}
      onChange={(e, value) => onSelect && onSelect(value)} // Directly pass the value (string) to parent
      renderInput={(params) => (
        <TextField
          {...params}
          label="Enter Address"
          variant="outlined"
          fullWidth
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
};

export default AddressAutocomplete;
