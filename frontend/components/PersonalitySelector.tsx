import React from "react";

interface PersonalitySelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const PersonalitySelector: React.FC<PersonalitySelectorProps> = ({ value, onChange }) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700">
        Select Assistant Personality
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
      >
        <option value="factual">Factual</option>
        <option value="friendly">Friendly</option>
        <option value="humorous">Humorous</option>
      </select>
    </div>
  );
};

export default PersonalitySelector;
