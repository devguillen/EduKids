export const SensoryControls = ({ onToggleContrast, onToggleTextSize, highContrast, largeText }) => {
  return (
    <div className="sensory-panel">
      <button 
        className="sensory-btn"
        onClick={onToggleContrast} 
        data-active={highContrast}
        aria-pressed={highContrast}
      >
        {highContrast ? '☀️ Cores Suaves' : '🌒 Alto Contraste'}
      </button>
      <button 
        className="sensory-btn"
        onClick={onToggleTextSize} 
        data-active={largeText}
        aria-pressed={largeText}
      >
        {largeText ? 'Aa Texto Normal' : 'AA Texto Grande'}
      </button>
    </div>
  );
};
