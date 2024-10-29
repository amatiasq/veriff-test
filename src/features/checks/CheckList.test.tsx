import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { Mock, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CheckList } from './CheckList';
import { CheckId } from './CheckModel';
import { simulateTabPress } from './focus';
import { useCheckList } from './useCheckList';

vi.mock('./useCheckList');
vi.mock('./focus');
const mockedUseCheckList = useCheckList as Mock;

const mockSortedChecks = [
  { id: '1' as CheckId, priority: 1, description: 'Check 1' },
  { id: '2' as CheckId, priority: 2, description: 'Check 2' },
  { id: '3' as CheckId, priority: 3, description: 'Check 3' },
];

global.fetch = vi.fn().mockResolvedValue({ ok: true });

describe('CheckList', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  beforeEach(() => {
    mockedUseCheckList.mockReturnValue({
      isLoading: false,
      error: null,
      sorted: mockSortedChecks,
    });
  });

  it('renders loading message when isLoading is true', () => {
    mockedUseCheckList.mockReturnValue({
      isLoading: true,
      error: undefined,
      sorted: [],
    });

    const { getByText } = render(<CheckList afterSubmit={vi.fn()} />);
    expect(getByText('Loading...')).toBeInTheDocument();
  });

  it('renders error message when error is present', () => {
    mockedUseCheckList.mockReturnValue({
      isLoading: false,
      error: new Error('Failed to fetch checks'),
      sorted: [],
    });

    const { getByText } = render(<CheckList afterSubmit={vi.fn()} />);
    expect(getByText('Error: Failed to fetch checks')).toBeInTheDocument();
  });

  it('renders a list of SingleCheck components', () => {
    const { getByText } = render(<CheckList afterSubmit={vi.fn()} />);

    mockSortedChecks.forEach((check) => {
      expect(getByText(check.description)).toBeInTheDocument();
    });
  });

  it('enables the submit button when conditions are met', () => {
    const { getByLabelText, getByText } = render(
      <CheckList afterSubmit={vi.fn()} />
    );

    const submitButton = getByText('Submit');
    expect(submitButton).toBeDisabled();

    fireEvent.click(getByLabelText('Yes', { selector: 'input[name="1"]' }));
    fireEvent.click(getByLabelText('Yes', { selector: 'input[name="2"]' }));

    expect(submitButton).toBeDisabled();

    fireEvent.click(getByLabelText('No', { selector: 'input[name="3"]' }));

    expect(submitButton).toBeEnabled();
  });

  it('calls afterSubmit after successful submission', async () => {
    const afterSubmit = vi.fn();
    const { getByLabelText, getByText } = render(
      <CheckList afterSubmit={afterSubmit} />
    );

    mockSortedChecks.forEach((check) => {
      fireEvent.click(
        getByLabelText('Yes', { selector: `input[name="${check.id}"]` })
      );
    });

    const submitButton = getByText('Submit');
    fireEvent.click(submitButton);

    await waitFor(() => expect(afterSubmit).toHaveBeenCalled());
    expect(fetch).toHaveBeenCalledWith(
      '/api/checks',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          results: [
            { checkId: '1', result: 'yes' },
            { checkId: '2', result: 'yes' },
            { checkId: '3', result: 'yes' },
          ],
        }),
      })
    );
  });

  it('handles keyboard navigation with ArrowUp on submit button', () => {
    const { getByText } = render(<CheckList afterSubmit={vi.fn()} />);
    const submitButton = getByText('Submit');

    fireEvent.keyDown(submitButton, { key: 'ArrowUp' });

    expect(simulateTabPress).toHaveBeenCalledWith('back');
  });

  it('updates responses when SingleCheck onChange is triggered', () => {
    const { getByLabelText } = render(<CheckList afterSubmit={vi.fn()} />);

    fireEvent.click(getByLabelText('Yes', { selector: 'input[name="1"]' }));
    fireEvent.click(getByLabelText('No', { selector: 'input[name="2"]' }));

    expect(
      getByLabelText('Yes', { selector: 'input[name="1"]' })
    ).toBeChecked();
    expect(getByLabelText('No', { selector: 'input[name="2"]' })).toBeChecked();
  });
});
