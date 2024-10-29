import { useCallback, useEffect, useState } from 'react';
import { CheckList } from '../features/checks/CheckList';
import { simulateTabPress } from '../features/checks/focus';
import './App.css';

export function App() {
  const [isSubitted, setIsSubmitted] = useState(false);

  const submit = useCallback(() => {
    setIsSubmitted(true);
  }, [setIsSubmitted]);

  useEffect(() => {
    const handler = () => simulateTabPress();
    document.body.addEventListener('click', handler);
    return () => document.body.removeEventListener('click', handler);
  }, []);

  return isSubitted ? (
    <div>Thank you for submitting the form!</div>
  ) : (
    <CheckList afterSubmit={submit} />
  );
}
