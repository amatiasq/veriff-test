import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { describe } from 'node:test';
import { afterEach, expect, it, vi } from 'vitest';
import type { CheckId } from './CheckModel';
import { SingleCheck } from './SingleCheck';
import { simulateTabPress } from './focus';

type Props = React.ComponentProps<typeof SingleCheck>;

vi.mock('./focus');

describe('SingleCheck', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  describe('when status is disabled', () => {
    it('renders disabled radios', () => {
      const { getByLabelText } = render(
        <SingleCheck {...fakeProps({ status: 'disabled' })} />
      );

      expect(getByLabelText('Yes')).toBeDisabled();
      expect(getByLabelText('No')).toBeDisabled();
    });
  });

  describe('when status is active', () => {
    it('renders active radios and auto-focuses', () => {
      const { getByLabelText } = render(
        <SingleCheck {...fakeProps({ status: 'active', value: true })} />
      );

      const yesRadio = getByLabelText('Yes');
      expect(yesRadio).toBeChecked();
      expect(yesRadio).toHaveFocus();
    });
  });

  describe('onChange callback', () => {
    it('calls onChange with true when "Yes" is selected', () => {
      const onChange = vi.fn();
      const { getByLabelText } = render(
        <SingleCheck {...fakeProps({ onChange })} />
      );

      fireEvent.click(getByLabelText('Yes'));
      expect(onChange).toHaveBeenCalledWith('1', true);
    });

    it('calls onChange with false when "No" is selected', () => {
      const onChange = vi.fn();
      const { getByLabelText } = render(
        <SingleCheck {...fakeProps({ onChange })} />
      );

      fireEvent.click(getByLabelText('No'));
      expect(onChange).toHaveBeenCalledWith('1', false);
    });
  });

  describe('keyboard interactions', () => {
    it('simulates tabbing backward on ArrowUp', () => {
      const { getByLabelText } = render(<SingleCheck {...fakeProps()} />);
      const yesRadio = getByLabelText('Yes');

      fireEvent.keyDown(yesRadio, { key: 'ArrowUp' });

      expect(simulateTabPress).toHaveBeenCalledWith('back');
    });

    it('simulates tabbing forward on ArrowDown', () => {
      const { getByLabelText } = render(<SingleCheck {...fakeProps()} />);
      const yesRadio = getByLabelText('Yes');

      fireEvent.keyDown(yesRadio, { key: 'ArrowDown' });

      expect(simulateTabPress).toHaveBeenCalledWith('forward');
    });

    it('selects "Yes" and moves focus when key "1" is pressed', () => {
      const onChange = vi.fn();
      const { getByLabelText } = render(
        <SingleCheck {...fakeProps({ onChange })} />
      );

      const yesRadio = getByLabelText('Yes');
      fireEvent.keyDown(yesRadio, { key: '1' });
      expect(onChange).toHaveBeenCalledWith('1', true);
    });

    it('selects "No" and moves focus when key "2" is pressed', () => {
      const onChange = vi.fn();
      const { getByLabelText } = render(
        <SingleCheck {...fakeProps({ onChange })} />
      );

      const noRadio = getByLabelText('No');
      fireEvent.keyDown(noRadio, { key: '2' });
      expect(onChange).toHaveBeenCalledWith('1', false);
    });
  });
});

function fakeProps(props: Partial<Props> = {}): Props {
  return {
    check: {
      id: '1' as CheckId,
      priority: 1,
      description: 'hello there',
    },
    status: 'active',
    value: undefined,
    onChange: () => {
      throw new Error('Function not implemented.');
    },
    ...props,
  };
}
