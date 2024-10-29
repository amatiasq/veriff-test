import { useCallback, useState } from 'react';
import './CheckList.css';
import { type CheckId } from './CheckModel';
import { SingleCheck, type SingleCheckStatus } from './SingleCheck';
import { simulateTabPress } from './focus';
import { useCheckList } from './useCheckList';

type Responses = Record<CheckId, boolean>;

export function CheckList({ afterSubmit }: { afterSubmit: () => unknown }) {
  const [responses, setResponses] = useState<Responses>({});
  const { isLoading, error, sorted } = useCheckList();

  const onChange = useCallback(
    (id: CheckId, status: boolean) => {
      const newResponses = { [id]: status } as Responses;
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

  const submit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      await submitResponses(responses);
      afterSubmit();
    },
    [responses, afterSubmit]
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <form className="CheckList" onSubmit={submit}>
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

function submitResponses(responses: Responses) {
  const responseArray = Object.entries(responses).map(([id, value]) => ({
    checkId: id,
    result: value ? 'yes' : 'no',
  }));

  return fetch('/api/checks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ results: responseArray }),
  });
}
