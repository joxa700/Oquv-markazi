import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FaqAccordion } from '../../src/components/FaqAccordion.jsx';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
}));

const items = [
  { id: 1, question: 'Birinchi savol?', answer: 'Birinchi javob.' },
  { id: 2, question: 'Ikkinchi savol?', answer: 'Ikkinchi javob.' },
];

describe('FaqAccordion', () => {
  it('opens the first answer by default', () => {
    render(<FaqAccordion items={items} />);
    expect(screen.getByRole('button', { name: /Birinchi savol/ })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Birinchi javob.')).toBeVisible();
    expect(screen.getByText('Ikkinchi javob.')).not.toBeVisible();
  });

  it('switches between answers and closes an open one', async () => {
    const user = userEvent.setup();
    render(<FaqAccordion items={items} />);

    await user.click(screen.getByRole('button', { name: /Ikkinchi savol/ }));
    expect(screen.getByRole('button', { name: /Ikkinchi savol/ })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Ikkinchi javob.')).toBeVisible();
    expect(screen.getByText('Birinchi javob.')).not.toBeVisible();

    await user.click(screen.getByRole('button', { name: /Ikkinchi savol/ }));
    expect(screen.getByRole('button', { name: /Ikkinchi savol/ })).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByText('Ikkinchi javob.')).not.toBeVisible();
  });
});
