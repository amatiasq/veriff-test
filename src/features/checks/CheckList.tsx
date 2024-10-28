import { useCallback, useMemo, useState } from 'react';
import useFetch from 'react-fetch-hook';
import './CheckList.css';
import { CheckModel, type CheckId } from './CheckModel';
import { SingleCheck, type SingleCheckStatus } from './SingleCheck';
import { simulateTabPress } from './focus';

function useCheckList() {
  const { isLoading, error, data } = useFetch<CheckModel[]>('/api/checks');

  const sorted = useMemo(() => {
    if (!data) {
      return [];
    }

    return [...data].sort((a, b) => a.priority - b.priority);
  }, [data]);

  return { isLoading, error, sorted };
}

export function CheckList() {
  const [responses, setResponses] = useState<Record<CheckId, boolean>>({});
  const { isLoading, error, sorted } = useCheckList();

  const onChange = useCallback(
    (id: CheckId, status: boolean) => {
      const newResponses = { [id]: status } as typeof responses;
      const index = sorted.findIndex((check) => check.id === id);

      setResponses((prev) => {
        // we copy the previous responses one by one
        // until we reach the current check
        // so we reset the responses for the following checks
        for (let i = 0; i < index; i++) {
          newResponses[sorted[i].id] = prev[sorted[i].id];
        }

        return newResponses;
      });
    },
    [sorted, setResponses]
  );

  const onButtonKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      simulateTabPress('back');
    }
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <form className="CheckList">
      <ul>
        {sorted.map((check, index) => (
          <SingleCheck
            key={check.id}
            check={check}
            status={getStepStatus(index)}
            value={responses[check.id]}
            onChange={onChange}
          />
        ))}
      </ul>

      <button
        type="submit"
        disabled={!isButtonEnabled()}
        onKeyDown={onButtonKeyDown}
      >
        Submit
      </button>
    </form>
  );

  function getStepStatus(index: number): SingleCheckStatus {
    for (let i = 0; i < index; i++) {
      if (responses[sorted[i].id] !== true) {
        return 'disabled';
      }
    }

    if (sorted[index].id in responses) {
      return 'completed';
    }

    return 'active';
  }

  function isButtonEnabled() {
    const isNoSelected = sorted.some((check) => responses[check.id] === false);
    if (isNoSelected) return true;

    const areAllTrue = sorted.every((check) => responses[check.id] === true);
    if (areAllTrue) return true;

    return false;
  }
}
