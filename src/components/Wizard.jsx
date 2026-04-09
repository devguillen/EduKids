import { useState } from 'react';

export const Wizard = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [age, setAge] = useState(7);
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');

  const subjects = ['Matemática', 'Português', 'Ciências'];
  // Subtopics based on subject
  const getTopics = () => {
    if (subject === 'Matemática') return ['Adição Visual', 'Subtração', 'Formas Geométricas'];
    if (subject === 'Português') return ['Vírgulas', 'Montar Frases', 'Sons das Letras'];
    if (subject === 'Ciências') return ['Animais', 'Corpo Humano', 'Plantas'];
    return [];
  };

  const nextStep = () => setStep(step + 1);

  if (step === 1) {
    return (
      <div className="wizard-card">
        <h2>Olá! Quantos anos você tem?</h2>
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '30px' }}>
          {[4,5,6,7,8,9,10,11,12].map(num => (
            <button 
              key={num} 
              className={`choice-button ${age === num ? 'selected' : ''}`}
              onClick={() => setAge(num)}
            >
              {num}
            </button>
          ))}
        </div>
        <button className="primary-btn" style={{marginTop: '40px'}} onClick={nextStep}>Pronto! 🚀</button>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="wizard-card">
        <h2>O que vamos aprender hoje?</h2>
        <div className="grid-options">
          {subjects.map(s => (
            <button 
              key={s} 
              className={`big-choice-button ${subject === s ? 'selected' : ''}`}
              onClick={() => { setSubject(s); nextStep(); }}
            >
              {s}
            </button>
          ))}
        </div>
        <button className="secondary-btn" style={{marginTop: '20px'}} onClick={() => setStep(1)}>Voltar</button>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="wizard-card">
        <h2>Legal! Escolha um desafio de {subject}:</h2>
        <div className="grid-options">
          {getTopics().map(t => (
            <button 
              key={t} 
              className={`big-choice-button`}
              onClick={() => {
                setTopic(t);
                onComplete({ age, subject, topic: t });
              }}
            >
              {t}
            </button>
          ))}
        </div>
        <button className="secondary-btn" style={{marginTop: '20px'}} onClick={() => setStep(2)}>Voltar</button>
      </div>
    );
  }

  return null;
};
