import { useCallback } from 'react';
import type { CheckId, CheckModel } from './CheckModel';
import { focusSingleCheck, simulateTabPress } from './focus';
import './SingleCheck.css';

export type SingleCheckStatus = 'active' | 'completed' | 'disabled';

export function SingleCheck({
  check,
  status,
  value,
  onChange,
}: {
  check: CheckModel;
  status: SingleCheckStatus;
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

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      const keys: Record<string, () => unknown> = {
        ArrowUp: () => simulateTabPress('back'),
        ArrowDown: () => simulateTabPress('forward'),
        1: () => {
          setTrue();
          setTimeout(simulateTabPress, 0);
        },
        2: () => {
          setFalse();
          setTimeout(simulateTabPress, 0);
        },
      };

      const action = keys[event.key];

      if (action) {
        event.preventDefault();
        action();
      }
    },
    [setTrue, setFalse]
  );

  const focus = useCallback((event: React.MouseEvent<HTMLElement>) => {
    focusSingleCheck(event.currentTarget);
  }, []);

  return (
    <li className="SingleCheck" onClick={focus}>
      <p>{check.description}</p>
      <div className="SingleCheck__status">
        <label>
          <input
            type="radio"
            name={check.id}
            disabled={status === 'disabled'}
            autoFocus={status === 'active'}
            checked={value === true}
            onChange={setTrue}
            onKeyDown={onKeyDown}
          />
          Yes
        </label>
        <label>
          <input
            type="radio"
            name={check.id}
            disabled={status === 'disabled'}
            checked={value === false}
            onChange={setFalse}
            onKeyDown={onKeyDown}
          />
          No
        </label>
      </div>
    </li>
  );
}
