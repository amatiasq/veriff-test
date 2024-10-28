import { useCallback, useMemo, useState } from 'react';
import useFetch from 'react-fetch-hook';
import './CheckList.css';
import { CheckModel, type CheckId } from './CheckModel';
import { SingleCheck } from './SingleCheck';

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
            isActive={arePreviousSelected(index)}
            value={responses[check.id]}
            onChange={onChange}
          />
        ))}
      </ul>

      <button type="submit">Submit</button>
    </form>
  );

  function arePreviousSelected(index: number) {
    for (let i = 0; i < index; i++) {
      if (!(sorted[i].id in responses)) {
        return false;
      }
    }

    return true;
  }
}
