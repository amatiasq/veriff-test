import { useCallback } from 'react';
import type { CheckId, CheckModel } from './CheckModel';

import './SingleCheck.css';

export function SingleCheck({
  check,
  isActive,
  value,
  onChange,
}: {
  check: CheckModel;
  isActive: boolean;
  value: boolean | undefined;
  onChange: (id: CheckId, status: boolean) => unknown;
}) {
  const setTrue = useCallback(
    () => onChange(check.id, true),
    [check.id, onChange]
  );
  const setFalse = useCallback(
    () => onChange(check.id, false),
    [check.id, onChange]
  );

  return (
    <li className="SingleCheck">
      <p>{check.description}</p>
      <div className="SingleCheck__status">
        <label>
          <input
            type="radio"
            name={check.id}
            disabled={!isActive}
            checked={value === true}
            onChange={setTrue}
          />
          Yes
        </label>
        <label>
          <input
            type="radio"
            name={check.id}
            disabled={!isActive}
            checked={value === false}
            onChange={setFalse}
          />
          No
        </label>
      </div>
    </li>
  );
}
