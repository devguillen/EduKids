export const SensoryControls = ({ onToggleContrast, onToggleTextSize, highContrast, largeText }) => {
  return (
    <div className="sensory-controls">
      <button 
        onClick={onToggleContrast} 
        aria-pressed={highContrast}
      >
        {highContrast ? 'Cores Suaves' : 'Alto Contraste'}
      </button>
      <button 
        onClick={onToggleTextSize} 
        aria-pressed={largeText}
      >
        {largeText ? 'Texto Normal' : 'Texto Grande'}
      </button>
    </div>
  );
};
