export function focusSingleCheck(element: HTMLElement) {
  const input = element.querySelector<HTMLInputElement>(
    'input[type="radio"]:not(:disabled)'
  );

  if (input) {
    input.focus();
  } else {
    console.error(`SingleCheck doesn't contain a focusable input`, element);
  }
}

/*
 * Handles the navigation between the radio buttons and the form button
 */
export function simulateTabPress(direction: 'back' | 'forward' = 'forward') {
  const target = document.activeElement as HTMLElement;

  if (!target) {
    throw new Error('simulateTabPress() called without an active element');
  }

  const tabbables = findTabbables(target);
  const focusBlock = target.closest<HTMLElement>('.SingleCheck') ?? target;
  const currentIndex = tabbables.indexOf(focusBlock);
  const nextIndex = findNextIndex(currentIndex, direction, tabbables.length);
  const next = tabbables[nextIndex];

  if (!next) return;

  if (next.tagName === 'BUTTON') {
    next.focus();
  } else {
    focusSingleCheck(next);
  }
}

function findTabbables(target: HTMLElement) {
  const form =
    target.closest('form.CheckList') ??
    document.querySelector('form.CheckList');

  if (!form) return [];

  const tabbables = [
    ...form.querySelectorAll<HTMLElement>(
      '.SingleCheck:has(input:not([disabled])), button:not([disabled])'
    ),
  ];

  return tabbables;
}

function findNextIndex(
  currentIndex: number,
  direction: 'back' | 'forward',
  max: number
) {
  if (currentIndex === 0 && direction === 'back') {
    return max - 1;
  }

  const nextIndex =
    direction === 'forward' ? currentIndex + 1 : currentIndex - 1;

  if (nextIndex < 0 || nextIndex >= max) {
    return 0;
  }

  return nextIndex;
}
