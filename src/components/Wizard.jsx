import { useState } from 'react';

const MATERIAS_DISPONIVEIS = ['Matemática', 'Português', 'Ciências', 'Geografia'];

const TOPICOS_POR_MATERIA = {
  'Matemática': ['Adição', 'Subtração', 'Geometria', 'Lógica'],
  'Português': ['Alfabeto', 'Formar Palavras', 'Vírgula', 'Acentos'],
  'Ciências': ['Animais', 'Plantas', 'Corpo Humano', 'Universo'],
  'Geografia': ['Cidades', 'Mapas', 'Clima', 'Planetas'],
};

export const Wizard = ({ onComplete }) => {
  // Passos: 0 (Idade) -> 1 (Matérias) -> 2 (Tópicos Loop)
  const [step, setStep] = useState(0);

  const [age, setAge] = useState(null);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  
  // Ex: { 'Matemática': ['Adição', 'Subtração'], 'Ciências': ['Animais'] }
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
    // Se não marcou nada nesta matéria específica, ignora o warning por enquanto e avança
    // Mas o ideal é bloquear.
    const chosenTopics = selectedTopics[currentSubject] || [];
    if (chosenTopics.length === 0) return; // Disables the button 

    if (currentSubjectIndexForTopicSelection + 1 < selectedSubjects.length) {
      setCurrentSubjectIndexForTopicSelection(currentSubjectIndexForTopicSelection + 1);
    } else {
      // Finished all! 
      onComplete({
        age,
        subjectsAndTopics: selectedTopics // Dict of selected content
      });
    }
  };

  if (step === 0) {
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
          <button className="btn-primary" disabled={!age} onClick={() => setStep(1)}>
            AVANÇAR
          </button>
        </div>
      </div>
    );
  }

  if (step === 1) {
    return (
      <div className="wizard-container">
        <h2 className="wizard-title">O que vamos estudar hoje?</h2>
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
          <button className="btn-primary" disabled={selectedSubjects.length === 0} onClick={() => setStep(2)}>
            AVANÇAR
          </button>
        </div>
      </div>
    );
  }

  if (step === 2) {
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
