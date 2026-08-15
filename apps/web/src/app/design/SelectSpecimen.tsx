'use client';

import { useState } from 'react';
import { Select } from '../../ui';

/**
 * The dropdown on the specimen sheet needs to actually open, and the sheet itself is a server
 * component — so the one piece of state lives here rather than turning the whole page into a
 * client bundle.
 */
export function SelectSpecimen() {
  const [country, setCountry] = useState('de');

  return (
    <Select
      id="specimen-select"
      block
      value={country}
      onChange={setCountry}
      options={[
        { value: 'de', label: 'Germany' },
        { value: 'pl', label: 'Poland' },
        { value: 'fr', label: 'France' },
        { value: 'nl', label: 'Netherlands' },
        { value: 'ua', label: 'Ukraine' },
      ]}
    />
  );
}
