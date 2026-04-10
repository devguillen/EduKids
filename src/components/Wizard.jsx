import { useState } from 'react';

const MATERIAS_DISPONIVEIS = ['Matemática', 'Português', 'Ciências', 'Geografia'];

const TOPICOS_POR_MATERIA = {
  'Matemática': ['Adição', 'Subtração', 'Geometria', 'Lógica'],
  'Português': ['Alfabeto', 'Formar Palavras', 'Vírgula', 'Acentos'],
  'Ciências': ['Animais', 'Plantas', 'Corpo Humano', 'Universo'],
  'Geografia': ['Cidades', 'Mapas', 'Clima', 'Planetas'],
};

export const Wizard = ({ onComplete, initialProfile }) => {
  // Se já temos um perfil (veio do 'Trocar Matéria'), pula direto pra matéria
  const hasProfile = initialProfile && initialProfile.childName;

  // Passos: 0 (Nome) -> 1 (Perfil) -> 2 (Idade) -> 3 (Matérias) -> 4 (Tópicos Loop)
  const [step, setStep] = useState(hasProfile ? 3 : 0);

  const [childName, setChildName] = useState(hasProfile ? initialProfile.childName : '');
  const [isNeurodivergent, setIsNeurodivergent] = useState(hasProfile ? initialProfile.isNeurodivergent : null);
  const [age, setAge] = useState(hasProfile ? initialProfile.age : null);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  
  const [selectedTopics, setSelectedTopics] = useState({});
  const [currentSubjectIndexForTopicSelection, setCurrentSubjectIndexForTopicSelection] = useState(0);

  const toggleSubject = (subject) => {
    if (selectedSubjects.includes(subject)) {
      setSelectedSubjects(selectedSubjects.filter(s => s !== subject));
    } else {
      setSelectedSubjects([...selectedSubjects, subject]);
    }
  };

  const toggleTopic = (subject, topic) => {
    const currentList = selectedTopics[subject] || [];
    let newList;
    if (currentList.includes(topic)) {
      newList = currentList.filter(t => t !== topic);
    } else {
      newList = [...currentList, topic];
    }
    setSelectedTopics({ ...selectedTopics, [subject]: newList });
  };

  const advanceTopicsStep = () => {
    const currentSubject = selectedSubjects[currentSubjectIndexForTopicSelection];
    const chosenTopics = selectedTopics[currentSubject] || [];
    if (chosenTopics.length === 0) return; 

    if (currentSubjectIndexForTopicSelection + 1 < selectedSubjects.length) {
      setCurrentSubjectIndexForTopicSelection(currentSubjectIndexForTopicSelection + 1);
    } else {
      onComplete({
        childName,
        isNeurodivergent,
        age,
        subjectsAndTopics: selectedTopics 
      });
    }
  };

  // Passo 0: Nome
  if (step === 0) {
    return (
      <div className="wizard-container">
        <h2 className="wizard-title">Olá! Qual é o seu nome?</h2>
        <div style={{display:'flex', justifyContent:'center', margin:'20px 0'}}>
           <input 
             type="text" 
             className="input-text-large"
             placeholder="Digite seu nome aqui..." 
             value={childName}
             onChange={(e) => setChildName(e.target.value)}
             autoFocus
           />
        </div>
        <div className="action-line">
          <button className="btn-primary" disabled={!childName.trim()} onClick={() => setStep(1)}>
            AVANÇAR
          </button>
        </div>
      </div>
    );
  }

  // Passo 1: Perfil Neurodivergente
  if (step === 1) {
    return (
      <div className="wizard-container">
        <h2 className="wizard-title">Como você prefere aprender, {childName}?</h2>
        <p style={{color: 'var(--text-muted)'}}>Isso nos ajuda a criar desafios perfeitos para você.</p>
        <div className="options-grid">
           <button 
             className="option-card" 
             data-selected={isNeurodivergent === false}
             onClick={() => setIsNeurodivergent(false)}
           >
             <span style={{fontSize: '1.2rem', fontWeight: 'bold'}}>Padrão / Desafios Variados</span>
             <p style={{fontSize: '0.9rem', marginTop: '5px'}}>Gosto de surpresas e histórias lúdicas.</p>
           </button>
           <button 
             className="option-card" 
             data-selected={isNeurodivergent === true}
             onClick={() => setIsNeurodivergent(true)}
           >
             <span style={{fontSize: '1.2rem', fontWeight: 'bold'}}>Focado / Literal (Neurodivergente)</span>
             <p style={{fontSize: '0.9rem', marginTop: '5px'}}>Prefiro clareza, rotina e instruções diretas.</p>
           </button>
        </div>
        <div className="action-line">
          <button className="btn-primary" disabled={isNeurodivergent === null} onClick={() => setStep(2)}>
            AVANÇAR
          </button>
        </div>
      </div>
    );
  }

  // Passo 2: Idade
  if (step === 2) {
    return (
      <div className="wizard-container">
        <h2 className="wizard-title">Quantos anos você tem?</h2>
        <div className="options-grid">
          {[4,5,6,7,8,9,10,11,12].map(num => (
            <button 
              key={num} 
              className="option-card"
              data-selected={age === num}
              onClick={() => setAge(num)}
            >
              <span style={{fontSize: '2em'}}>{num}</span>
            </button>
          ))}
        </div>
        <div className="action-line">
          <button className="btn-primary" disabled={!age} onClick={() => setStep(3)}>
            AVANÇAR
          </button>
        </div>
      </div>
    );
  }

  // Passo 3: Matérias
  if (step === 3) {
    return (
      <div className="wizard-container">
        <h2 className="wizard-title">O que vamos estudar hoje, {childName}?</h2>
        <p style={{color: 'var(--text-muted)'}}>Pode escolher mais de um!</p>
        <div className="options-grid">
          {MATERIAS_DISPONIVEIS.map(mat => {
            const isSelected = selectedSubjects.includes(mat);
            return (
              <button 
                key={mat} 
                className="option-card" 
                data-selected={isSelected}
                onClick={() => toggleSubject(mat)}
              >
                {mat}
              </button>
            );
          })}
        </div>
        <div className="action-line">
          <button className="btn-primary" disabled={selectedSubjects.length === 0} onClick={() => setStep(4)}>
            AVANÇAR
          </button>
        </div>
      </div>
    );
  }

  // Passo 4: Tópicos
  if (step === 4) {
    const subject = selectedSubjects[currentSubjectIndexForTopicSelection];
    const availableTopics = TOPICOS_POR_MATERIA[subject] || [];
    const chosenTopics = selectedTopics[subject] || [];

    return (
      <div className="wizard-container">
        <h2 className="wizard-title">O que de {subject} você quer ver?</h2>
        <p style={{color: 'var(--text-muted)'}}>Selecione os temas desejados e avance.</p>
        <div className="options-grid">
           {availableTopics.map(t => (
             <button 
                key={t}
                className="option-card"
                data-selected={chosenTopics.includes(t)}
                onClick={() => toggleTopic(subject, t)}
             >
               {t}
             </button>
           ))}
        </div>
        <div className="action-line">
           <button 
             className="btn-primary" 
             disabled={chosenTopics.length === 0} 
             onClick={advanceTopicsStep}
           >
             {currentSubjectIndexForTopicSelection + 1 === selectedSubjects.length ? "COMEÇAR JOGO!" : "PRÓXIMA MATÉRIA"}
           </button>
        </div>
      </div>
    );
  }

  return null;
};
