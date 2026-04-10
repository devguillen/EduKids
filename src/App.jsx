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

const STORAGE_KEY_USER = 'edukids_user_profile';

export default function App() {
  const [highContrast, setHighContrast] = useState(false);
  const [largeText, setLargeText] = useState(false);
  
  const [showWizard, setShowWizard] = useState(true);
  const [childName, setChildName] = useState('');
  const [isNeurodivergent, setIsNeurodivergent] = useState(false);
  const [age, setAge] = useState(null);
  const [studyQueue, setStudyQueue] = useState([]);
  const [currentQueueIndex, setCurrentQueueIndex] = useState(0);

  const [levelData, setLevelData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Persistência de preferências visuais
  useEffect(() => {
    const root = document.documentElement;
    if (highContrast) {
      root.setAttribute('data-theme', 'high-contrast');
    } else {
      root.removeAttribute('data-theme');
    }

    if (largeText) {
      root.setAttribute('data-text', 'large');
    } else {
      root.removeAttribute('data-text');
    }
  }, [highContrast, largeText]);

  // Restauração de Sessão do Usuário (F5)
  useEffect(() => {
    const savedUser = localStorage.getItem(STORAGE_KEY_USER);
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setChildName(userData.childName);
      setIsNeurodivergent(userData.isNeurodivergent);
      setAge(userData.age);
      setStudyQueue(userData.studyQueue);
      setCurrentQueueIndex(userData.currentQueueIndex || 0);

      // Se temos fila, carregamos o estado atual
      if (userData.studyQueue?.length > 0) {
        setShowWizard(false);
        const index = userData.currentQueueIndex || 0;
        composeNextLevel({
          childName: userData.childName,
          isNeurodivergent: userData.isNeurodivergent,
          age: userData.age,
          subject: userData.studyQueue[index].subject,
          topic: userData.studyQueue[index].topic
        });
      }
    }
  }, []);

  const handleWizardComplete = async (wizardData) => {
    // Transforma o dicionário aninhado em uma fila plana sequencial
    const queue = [];
    Object.keys(wizardData.subjectsAndTopics).forEach(subject => {
       wizardData.subjectsAndTopics[subject].forEach(topic => {
          queue.push({ subject, topic });
       });
    });

    // Persiste o perfil no LocalStorage
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify({
      childName: wizardData.childName,
      isNeurodivergent: wizardData.isNeurodivergent,
      age: wizardData.age,
      studyQueue: queue,
      currentQueueIndex: 0
    }));

    setChildName(wizardData.childName);
    setIsNeurodivergent(wizardData.isNeurodivergent);
    setAge(wizardData.age);
    setStudyQueue(queue);
    setCurrentQueueIndex(0);

    // Carrega o primeiro level
    if (queue.length > 0) {
      const firstProfile = {
        childName: wizardData.childName,
        isNeurodivergent: wizardData.isNeurodivergent,
        age: wizardData.age,
        subject: queue[0].subject,
        topic: queue[0].topic
      };

      try {
        setIsLoading(true);
        setErrorMsg('');
        
        // Inicializa a memória da IA com o perfil da criança
        await neuroTutor.initializeSession(firstProfile);

        // Sucesso! Esconde o Wizard e começa o jogo
        setShowWizard(false);
        await composeNextLevel(firstProfile);
      } catch (err) {
        console.error('[App] Initialization Error:', err);
        setErrorMsg(`Não conseguimos conectar com o Professor IA: ${err.message}`);
        setIsLoading(false);
        // Não chamamos setShowWizard(false), mantendo o usuário no Wizard para ver o erro
      }
    }
  };

  const composeNextLevel = async (profile) => {
    setIsLoading(true);
    setErrorMsg('');
    setLevelData(null);

    const result = await neuroTutor.generateMiniGame(profile);

    if (result.success && result.gameLevel) {
      // Embaralha as respostas para n viciar
      const shuffledOptions = [...result.gameLevel.options].sort(() => Math.random() - 0.5);
      setLevelData({
        ...result.gameLevel,
        options: shuffledOptions,
        subjectContext: profile.subject
      });
    } else {
      setErrorMsg(result.error || 'Erro ao comunicar com a IA');
    }
    
    setIsLoading(false);
  };

  const handleLevelCompleted = async () => {
    // Move na fila
    const nextIndex = currentQueueIndex + 1;
    if (nextIndex < studyQueue.length) {
       setCurrentQueueIndex(nextIndex);
       
       // Atualiza a persistência com o novo índice
       const savedUser = JSON.parse(localStorage.getItem(STORAGE_KEY_USER) || '{}');
       localStorage.setItem(STORAGE_KEY_USER, JSON.stringify({
         ...savedUser,
         currentQueueIndex: nextIndex
       }));

       await composeNextLevel({
         childName,
         isNeurodivergent,
         age,
         subject: studyQueue[nextIndex].subject,
         topic: studyQueue[nextIndex].topic
       });
    } else {
       // Loop do jogo acabou, se ele selecionou só 1 tópico de 1 matéria (ou vários e acabou).
       // Volta The Wizard ou mostra tela final
       alert('Você completou todos os tópicos que selecionou! 🎉');
       setShowWizard(true);
    }
  };

  return (
    <div className="app-wrapper">
      <header className="top-navbar">
        <h1 className="logo-title" onClick={() => setShowWizard(true)} style={{cursor:'pointer'}}>
          EduKids AI
        </h1>
        <SensoryControls 
          onToggleContrast={() => setHighContrast(!highContrast)}
          onToggleTextSize={() => setLargeText(!largeText)}
          highContrast={highContrast}
          largeText={largeText}
        />
      </header>
      
      <main className="main-content">
        {errorMsg && (
          <div className="error-banner">
            ⚠️ {errorMsg}
          </div>
        )}

        {showWizard ? (
          <Wizard onComplete={handleWizardComplete} />
        ) : (
          <div className="game-play-area">
            {isLoading && (
              <div className="loading-box">
                <div>Carregando a próxima etapa...</div>
                <div>✨ ✨ ✨</div>
              </div>
            )}
            
            {errorMsg && !isLoading && (
              <div style={{textAlign: 'center', marginTop: '50px'}}>
                <h2 style={{color: 'red', marginBottom: '20px'}}>Puxa! {errorMsg}</h2>
                <button className="btn-primary" onClick={() => composeNextLevel({
                  childName, 
                  isNeurodivergent, 
                  age, 
                  subject: studyQueue[currentQueueIndex].subject, 
                  topic: studyQueue[currentQueueIndex].topic
                })}>
                  Tentar novamente
                </button>
              </div>
            )}

            {!isLoading && !errorMsg && levelData && (
               <GameUI 
                 levelData={levelData} 
                 onNextLevel={handleLevelCompleted} 
               />
            )}
          </div>
        )}
      </main>
    </div>
  );
}
