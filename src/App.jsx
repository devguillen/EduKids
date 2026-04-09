import { useState, useEffect } from 'react';
import { Wizard } from './components/Wizard';
import { GameUI } from './components/GameUI';
import { SensoryControls } from './components/SensoryControls';
import { NeuroAITutor } from './core/NeuroAITutor';
import { GeminiProvider } from './services/GeminiProvider';
import './App.css';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
const aiProvider = new GeminiProvider(apiKey);
const neuroTutor = new NeuroAITutor(aiProvider);

export default function App() {
  const [highContrast, setHighContrast] = useState(false);
  const [largeText, setLargeText] = useState(false);
  
  // Game State
  const [showWizard, setShowWizard] = useState(true);
  const [profile, setProfile] = useState(null);
  const [levelData, setLevelData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    document.body.className = '';
    if (highContrast) document.body.classList.add('sensory-high-contrast');
    if (largeText) document.body.classList.add('sensory-large-text');
  }, [highContrast, largeText]);

  // Dispara quando a criança acaba as escolhas 1, 2 e 3
  const handleWizardComplete = async (wizardData) => {
    setProfile(wizardData);
    setShowWizard(false);
    await loadNewGameLevel(wizardData);
  };

  const loadNewGameLevel = async (currentProfile) => {
    setIsLoading(true);
    setErrorMsg('');
    setLevelData(null);

    const result = await neuroTutor.generateMiniGame(currentProfile);

    if (result.success && result.gameLevel) {
      // Misturando (shuffle) as opções devolvidas pela IA para a resposta certa não ficar óbvia
      const shuffledOptions = [...result.gameLevel.options].sort(() => Math.random() - 0.5);
      setLevelData({
        ...result.gameLevel,
        options: shuffledOptions
      });
    } else {
      setErrorMsg(result.error || 'Erro desconhecido');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="app-container">
      <header>
        <h1 style={{cursor: 'pointer'}} onClick={() => setShowWizard(true)}>🎮 EduKids IA</h1>
        <SensoryControls 
          onToggleContrast={() => setHighContrast(!highContrast)}
          onToggleTextSize={() => setLargeText(!largeText)}
          highContrast={highContrast}
          largeText={largeText}
        />
      </header>
      
      <main className="game-main-area">
        {showWizard ? (
          <Wizard onComplete={handleWizardComplete} />
        ) : (
          <div className="game-play-area">
            {isLoading && (
              <div className="screen-center">
                <div className="loading-spinner">✨ Preparando o seu jogo... ✨</div>
              </div>
            )}
            
            {errorMsg && !isLoading && (
              <div className="error-box">
                <p>Oops! {errorMsg}</p>
                <button className="primary-btn" onClick={() => loadNewGameLevel(profile)}>Tentar de novo!</button>
              </div>
            )}

            {!isLoading && !errorMsg && levelData && (
               <GameUI 
                 levelData={levelData} 
                 onNextLevel={() => loadNewGameLevel(profile)} 
               />
            )}
          </div>
        )}
      </main>
    </div>
  );
}
