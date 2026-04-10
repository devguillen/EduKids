import { useState } from 'react';

export const GameUI = ({ levelData, onNextLevel }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [victory, setVictory] = useState(false);

  if (!levelData) return null;

  const handleChoice = (option) => {
    setSelectedOption(option);
    
    if (option === levelData.correctAnswer) {
      setVictory(true);
      setShowHint(false);
    } else {
      setShowHint(true);
    }
  };

  if (victory) {
    return (
      <div className="victory-banner">
        <h1 style={{fontSize: '3em'}}>🎉</h1>
        <h2>Parabéns! Você acertou!</h2>
        <p>A resposta era: <b>{levelData.correctAnswer}</b></p>
        <button className="btn-primary" onClick={() => {
          setVictory(false);
          setSelectedOption(null);
          setShowHint(false);
          onNextLevel();
        }}>Próximo Desafio ➡️</button>
      </div>
    );
  }

  return (
    <div className="game-play-area">
      <h2 className="game-question-text">{levelData.question}</h2>
      
      <div className="game-answers-grid">
        {levelData.options.map((option, index) => {
          const isSelected = selectedOption === option;
          const isWrong = isSelected && option !== levelData.correctAnswer;
          
          return (
            <button 
              key={index} 
              className={`answer-btn ${isWrong ? 'wrong-shake' : ''}`}
              onClick={() => handleChoice(option)}
              disabled={isWrong}
            >
              {option}
            </button>
          );
        })}
      </div>

      {showHint && (
        <div className="hint-banner">
          💡 <b>Dica:</b> {levelData.hint}
        </div>
      )}
    </div>
  );
};
