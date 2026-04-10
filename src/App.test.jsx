import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App Integration', () => {
  it('renders correctly and shows first wizard step', () => {
    render(<App />);
    expect(screen.getByText(/Qual é o seu nome\?/i)).toBeInTheDocument();
  });

  it('can type name and advance', async () => {
    render(<App />);
    const input = screen.getByPlaceholderText(/Digite seu nome aqui/i);
    fireEvent.change(input, { target: { value: 'Guillen' } });
    
    const btn = screen.getByText(/AVANÇAR/i);
    fireEvent.click(btn);
    
    expect(screen.getByText(/Como você prefere aprender, Guillen\?/i)).toBeInTheDocument();
  });
});
