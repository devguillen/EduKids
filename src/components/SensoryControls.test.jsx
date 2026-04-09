import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SensoryControls } from './SensoryControls';

describe('SensoryControls', () => {
  it('renders and dispatches actions', () => {
    const onContrast = vi.fn();
    const onText = vi.fn();
    render(
      <SensoryControls 
        onToggleContrast={onContrast} 
        onToggleTextSize={onText} 
        highContrast={false} 
        largeText={false} 
      />
    );
    fireEvent.click(screen.getByText('Alto Contraste'));
    expect(onContrast).toHaveBeenCalled();
    fireEvent.click(screen.getByText('Texto Grande'));
    expect(onText).toHaveBeenCalled();
  });
});
