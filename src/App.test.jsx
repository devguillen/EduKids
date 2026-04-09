import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App Integration', () => {
  it('renders correctly and changes sensory state', () => {
    render(<App />);
    expect(screen.getByText('Olá. O que vamos aprender hoje?')).toBeInTheDocument();
    
    const contrastBtn = screen.getByText('Alto Contraste');
    fireEvent.click(contrastBtn);
    expect(document.body.classList.contains('sensory-high-contrast')).toBe(true);
  });

  it('can send and receive messages', async () => {
    render(<App />);
    const input = screen.getByPlaceholderText('Digite sua resposta...');
    fireEvent.change(input, { target: { value: 'olá' } });
    fireEvent.click(screen.getByText('Enviar'));
    
    expect(screen.getByText('olá')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('Olá. Sou seu professor. O que gostaria de fazer?')).toBeInTheDocument();
    });
  });
});
