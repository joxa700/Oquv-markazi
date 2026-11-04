import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from '../../src/components/Modal.jsx';
import { StatusBadge } from '../../src/components/StatusBadge.jsx';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
}));

describe('StatusBadge', () => {
  it('renders the localized status key and variant class', () => {
    const { container } = render(<StatusBadge status="accepted" type="application" />);
    expect(screen.getByText('applicationStatus.accepted')).toBeInTheDocument();
    expect(container.firstChild).toHaveClass('status-badge', 'status-badge--accepted');
  });
});

describe('Modal', () => {
  it('renders nothing when closed', () => {
    render(<Modal open={false} onClose={() => {}} title="Closed" />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders content and closes with Escape', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} title="Sinov" subtitle="Modal subtitle">
        <button type="button">Inside</button>
      </Modal>,
    );

    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByText('Modal subtitle')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes when the backdrop is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Modal open onClose={onClose} title="Sinov">Content</Modal>);
    await user.click(screen.getByRole('presentation'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
