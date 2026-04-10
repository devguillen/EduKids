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
  
  // Stats do Duolingo
  const [stats, setStats] = useState({ correct: 0, wrong: 0, total: 0 });
  const [showResults, setShowResults] = useState(false);

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
      setStats(userData.stats || { correct: 0, wrong: 0, total: 0 });

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
      currentQueueIndex: 0,
      stats: { correct: 0, wrong: 0, total: 0 }
    }));

    setChildName(wizardData.childName);
    setIsNeurodivergent(wizardData.isNeurodivergent);
    setAge(wizardData.age);
    setStudyQueue(queue);
    setCurrentQueueIndex(0);
    setStats({ correct: 0, wrong: 0, total: 0 });
    setShowResults(false);

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
    // Gera nova questão no mesmo tópico -- loop infinito de aprendizado
    await composeNextLevel({
      childName,
      isNeurodivergent,
      age,
      subject: studyQueue[currentQueueIndex].subject,
      topic: studyQueue[currentQueueIndex].topic
    });
  };

  const handleSwitchSubject = async () => {
    if (studyQueue.length <= 1) return; // Só tem 1 matéria
    
    const nextIndex = (currentQueueIndex + 1) % studyQueue.length;
    setCurrentQueueIndex(nextIndex);
    
    // Atualiza a persistência
    const savedUser = JSON.parse(localStorage.getItem(STORAGE_KEY_USER) || '{}');
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify({
      ...savedUser,
      currentQueueIndex: nextIndex,
      stats: stats
    }));

    await composeNextLevel({
      childName,
      isNeurodivergent,
      age,
      subject: studyQueue[nextIndex].subject,
      topic: studyQueue[nextIndex].topic
    });
  };

  const updateStats = (isCorrect) => {
    const newStats = {
      ...stats,
      total: stats.total + 1,
      correct: isCorrect ? stats.correct + 1 : stats.correct,
      wrong: isCorrect ? stats.wrong : stats.wrong + 1
    };
    setStats(newStats);
    
    // Persiste em tempo real
    const savedUser = JSON.parse(localStorage.getItem(STORAGE_KEY_USER) || '{}');
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify({
      ...savedUser,
      stats: newStats
    }));
  };

  const handleStopSession = () => {
    setShowResults(true);
  };

  return (
    <div className="app-wrapper">
      <header className="top-navbar">
        <h1 className="logo-title" onClick={() => !showWizard && setShowResults(true)} style={{cursor:'pointer'}}>
          EduKids AI
        </h1>
        <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
          <div className="stats-indicator">
            ⭐ {stats.correct} Acertos
          </div>
          {!showWizard && studyQueue.length > 1 && (
            <button 
              className="btn-primary" 
              style={{padding: '6px 12px', fontSize: '0.8em', backgroundColor: '#6c63ff'}}
              onClick={handleSwitchSubject}
            >
              🔄 Trocar Matéria
            </button>
          )}
          {!showWizard && studyQueue.length > 0 && (
            <span style={{fontSize: '0.8em', color: '#aaa'}}>
              📚 {studyQueue[currentQueueIndex]?.subject} — {studyQueue[currentQueueIndex]?.topic}
            </span>
          )}
          <SensoryControls 
            onToggleContrast={() => setHighContrast(!highContrast)}
            onToggleTextSize={() => setLargeText(!largeText)}
            highContrast={highContrast}
            largeText={largeText}
          />
        </div>
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

            {!isLoading && !errorMsg && levelData && !showResults && (
               <GameUI 
                 levelData={levelData} 
                 onNextLevel={handleLevelCompleted} 
                 onAnswer={updateStats}
                 onStop={handleStopSession}
               />
            )}

            {showResults && (
              <div className="victory-banner">
                 <h2>Resumo da sua Jornada! 🌟</h2>
                 <div style={{display: 'flex', gap: '20px', justifyContent: 'center', margin: '20px 0'}}>
                    <div className="stat-card"><b>{stats.total}</b> Questões</div>
                    <div className="stat-card" style={{color: 'green'}}><b>{stats.correct}</b> Acertos</div>
                    <div className="stat-card" style={{color: 'red'}}><b>{stats.wrong}</b> Erros</div>
                 </div>
                 <p>Parabéns por se dedicar aos estudos, {childName}!</p>
                 <div style={{display: 'flex', gap: '10px', justifyContent: 'center'}}>
                   <button className="btn-primary" onClick={() => setShowResults(false)}>Continuar Estudos</button>
                   <button className="btn-primary" style={{backgroundColor: '#ff5c5c'}} onClick={() => {
                     localStorage.removeItem(STORAGE_KEY_USER);
                     window.location.reload();
                   }}>Novo Perfil</button>
                 </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
