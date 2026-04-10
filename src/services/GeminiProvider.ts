import { GoogleGenAI } from '@google/genai';
import { IAIProvider, IChatMessage } from '../core/types';

// ========================================================================
// BANCO DE PERGUNTAS PEDAGÓGICAS — Organizado por TÓPICO específico
// Cada tópico do Wizard tem seu próprio banco de perguntas.
// ========================================================================
type Question = { question: string; options: string[]; correctAnswer: string; hint: string };

const QUESTION_BANK: Record<string, Question[]> = {
  // ===== MATEMÁTICA =====
  'adicao': [
    { question: "Quanto é 12 + 8?", options: ["18", "20", "22", "25"], correctAnswer: "20", hint: "Dica: 12 + 8 = duas dezenas!" },
    { question: "Quanto é 5 + 7?", options: ["10", "11", "12", "13"], correctAnswer: "12", hint: "Dica: 5 + 5 = 10, e sobram 2." },
    { question: "Quanto é 9 + 6?", options: ["13", "14", "15", "16"], correctAnswer: "15", hint: "Dica: 9 + 1 = 10, e sobram 5." },
    { question: "Quanto é 15 + 15?", options: ["25", "28", "30", "35"], correctAnswer: "30", hint: "Dica: É o dobro de 15!" },
    { question: "Quanto é 23 + 7?", options: ["28", "29", "30", "31"], correctAnswer: "30", hint: "Dica: 23 + 7 forma uma dezena exata." },
    { question: "Quanto é 100 + 50?", options: ["120", "140", "150", "200"], correctAnswer: "150", hint: "Dica: 100 mais metade de 100." },
    { question: "Quanto é 11 + 11?", options: ["20", "21", "22", "23"], correctAnswer: "22", hint: "Dica: O dobro de 11." },
    { question: "Quanto é 4 + 8?", options: ["10", "11", "12", "13"], correctAnswer: "12", hint: "Dica: 4 + 6 = 10, e sobram 2." },
    { question: "Quanto é 7 + 5?", options: ["10", "11", "12", "13"], correctAnswer: "12", hint: "Dica: 7 + 3 = 10, sobram 2!" },
    { question: "Quanto é 6 + 9?", options: ["13", "14", "15", "16"], correctAnswer: "15", hint: "Dica: 6 + 4 = 10, e sobram 5!" },
  ],
  'subtracao': [
    { question: "Quanto é 15 - 8?", options: ["5", "6", "7", "8"], correctAnswer: "7", hint: "Dica: Conte de trás pra frente a partir do 15." },
    { question: "Quanto é 20 - 12?", options: ["6", "7", "8", "9"], correctAnswer: "8", hint: "Dica: 20 - 10 = 10, depois -2 = 8." },
    { question: "Quanto é 50 - 25?", options: ["15", "20", "25", "30"], correctAnswer: "25", hint: "Dica: É a metade de 50!" },
    { question: "Quanto é 100 - 1?", options: ["98", "99", "100", "101"], correctAnswer: "99", hint: "Dica: É um a menos que 100." },
    { question: "Quanto é 30 - 15?", options: ["10", "15", "20", "25"], correctAnswer: "15", hint: "Dica: É a metade de 30." },
    { question: "Quanto é 18 - 9?", options: ["7", "8", "9", "10"], correctAnswer: "9", hint: "Dica: É a metade de 18." },
    { question: "Quanto é 44 - 22?", options: ["20", "21", "22", "24"], correctAnswer: "22", hint: "Dica: Metade de 44." },
    { question: "Quanto é 10 - 3?", options: ["5", "6", "7", "8"], correctAnswer: "7", hint: "Dica: 10 menos 3 dedos." },
    { question: "Quanto é 25 - 5?", options: ["15", "18", "20", "22"], correctAnswer: "20", hint: "Dica: Tire 5 de 25." },
    { question: "Quanto é 60 - 30?", options: ["20", "25", "30", "35"], correctAnswer: "30", hint: "Dica: Metade de 60." },
  ],
  'geometria': [
    { question: "Quantos lados tem um triângulo?", options: ["2", "3", "4", "5"], correctAnswer: "3", hint: "Dica: 'Tri' vem de três!" },
    { question: "Qual forma tem 4 lados iguais?", options: ["Triângulo", "Quadrado", "Círculo", "Pentágono"], correctAnswer: "Quadrado", hint: "Dica: 'Quad' vem de quatro!" },
    { question: "Quantos lados tem um hexágono?", options: ["4", "5", "6", "7"], correctAnswer: "6", hint: "Dica: 'Hexa' vem de seis!" },
    { question: "Qual forma é redonda?", options: ["Retângulo", "Triângulo", "Círculo", "Quadrado"], correctAnswer: "Círculo", hint: "Dica: Uma roda tem essa forma!" },
    { question: "Quantos cantos tem um retângulo?", options: ["2", "3", "4", "5"], correctAnswer: "4", hint: "Dica: É parecido com o quadrado, com 4 cantos." },
    { question: "Qual forma tem 5 lados?", options: ["Quadrado", "Hexágono", "Pentágono", "Triângulo"], correctAnswer: "Pentágono", hint: "Dica: 'Penta' vem de cinco!" },
    { question: "A forma de uma bola é um...?", options: ["Cubo", "Esfera", "Cone", "Cilindro"], correctAnswer: "Esfera", hint: "Dica: É a versão 3D do círculo!" },
    { question: "Quantos lados tem um octógono?", options: ["6", "7", "8", "9"], correctAnswer: "8", hint: "Dica: 'Octo' vem de oito, como polvo!" },
  ],
  'logica': [
    { question: "Qual vem depois: 2, 4, 6, __?", options: ["7", "8", "9", "10"], correctAnswer: "8", hint: "Dica: Está pulando de 2 em 2!" },
    { question: "Qual vem depois: 1, 3, 5, __?", options: ["6", "7", "8", "9"], correctAnswer: "7", hint: "Dica: São números ímpares!" },
    { question: "Se eu tenho 3 maçãs e ganho mais 2, quantas tenho?", options: ["3", "4", "5", "6"], correctAnswer: "5", hint: "Dica: 3 + 2 = ?" },
    { question: "Qual número é PAR?", options: ["1", "3", "4", "7"], correctAnswer: "4", hint: "Dica: Pode ser dividido em 2 grupos iguais." },
    { question: "Qual vem depois: 10, 20, 30, __?", options: ["35", "40", "45", "50"], correctAnswer: "40", hint: "Dica: Pulando de 10 em 10!" },
    { question: "Se eu tenho 10 balas e como 4, quantas sobram?", options: ["4", "5", "6", "7"], correctAnswer: "6", hint: "Dica: 10 - 4 = ?" },
    { question: "Qual número é ÍMPAR?", options: ["2", "4", "5", "8"], correctAnswer: "5", hint: "Dica: Não pode dividir em 2 grupos iguais." },
    { question: "Complete: 5, 10, 15, __?", options: ["18", "19", "20", "25"], correctAnswer: "20", hint: "Dica: Pulando de 5 em 5!" },
  ],
  // ===== PORTUGUÊS =====
  'alfabeto': [
    { question: "Qual a primeira letra do alfabeto?", options: ["B", "A", "C", "Z"], correctAnswer: "A", hint: "Dica: A, B, C..." },
    { question: "Qual a última letra do alfabeto?", options: ["X", "Y", "Z", "W"], correctAnswer: "Z", hint: "Dica: ...X, Y, ?" },
    { question: "Quantas letras tem o alfabeto brasileiro?", options: ["23", "24", "26", "28"], correctAnswer: "26", hint: "Dica: Incluindo K, W e Y!" },
    { question: "Qual dessas é uma vogal?", options: ["B", "C", "E", "F"], correctAnswer: "E", hint: "Dica: As vogais são A, E, I, O, U." },
    { question: "Qual dessas é uma consoante?", options: ["A", "E", "I", "M"], correctAnswer: "M", hint: "Dica: Se não é vogal, é consoante!" },
    { question: "Qual letra vem depois do 'D'?", options: ["C", "E", "F", "G"], correctAnswer: "E", hint: "Dica: A, B, C, D, __?" },
    { question: "Quantas vogais existem?", options: ["3", "4", "5", "6"], correctAnswer: "5", hint: "Dica: A, E, I, O, U." },
    { question: "Qual letra vem antes do 'G'?", options: ["E", "F", "H", "I"], correctAnswer: "F", hint: "Dica: ...D, E, __, G." },
  ],
  'formar palavras': [
    { question: "Qual palavra se forma com C + A + S + A?", options: ["Cama", "Casa", "Capa", "Cara"], correctAnswer: "Casa", hint: "Dica: É onde moramos!" },
    { question: "Qual sílaba completa: BO__?", options: ["LA", "LO", "LE", "LI"], correctAnswer: "LA", hint: "Dica: É um brinquedo redondo!" },
    { question: "Quantas sílabas tem 'BANANA'?", options: ["2", "3", "4", "5"], correctAnswer: "3", hint: "Dica: BA-NA-NA." },
    { question: "Qual palavra se forma com G + A + T + O?", options: ["Galo", "Gato", "Gado", "Garfo"], correctAnswer: "Gato", hint: "Dica: Faz miau!" },
    { question: "Quantas sílabas tem 'SOL'?", options: ["1", "2", "3", "4"], correctAnswer: "1", hint: "Dica: São palavras monossílabas!" },
    { question: "Qual sílaba completa: CA__?", options: ["RO", "LO", "MA", "PO"], correctAnswer: "MA", hint: "Dica: Onde dormimos!" },
    { question: "Quantas sílabas tem 'ESCOLA'?", options: ["2", "3", "4", "5"], correctAnswer: "3", hint: "Dica: ES-CO-LA." },
    { question: "Qual palavra tem 4 sílabas?", options: ["Sol", "Casa", "Borboleta", "Gato"], correctAnswer: "Borboleta", hint: "Dica: BOR-BO-LE-TA." },
  ],
  'virgula': [
    { question: "Onde colocar a vírgula? 'João comprou pão leite e ovos'", options: ["Depois de 'pão' e 'leite'", "Depois de 'João'", "Depois de 'e'", "Não precisa"], correctAnswer: "Depois de 'pão' e 'leite'", hint: "Dica: A vírgula separa itens de uma lista!" },
    { question: "Qual frase usa a vírgula corretamente?", options: ["Eu comi, arroz", "Maria, venha aqui!", "O gato, dormiu", "Ele, correu rápido"], correctAnswer: "Maria, venha aqui!", hint: "Dica: Usamos vírgula ao chamar alguém (vocativo)." },
    { question: "Pra que serve a vírgula?", options: ["Para enfeitar", "Para separar partes da frase", "Para terminar frases", "Para gritar"], correctAnswer: "Para separar partes da frase", hint: "Dica: Ela organiza as ideias." },
    { question: "Qual frase precisa de vírgula?", options: ["Eu gosto de bolo", "Ana Pedro e Luís brincaram", "Ele dormiu cedo", "Choveu muito"], correctAnswer: "Ana Pedro e Luís brincaram", hint: "Dica: Separe os nomes com vírgula!" },
    { question: "A vírgula separa qual tipo de palavra numa lista?", options: ["Verbos", "Itens enumerados", "Artigos", "Preposições"], correctAnswer: "Itens enumerados", hint: "Dica: 'Banana, maçã e uva' é uma lista!" },
    { question: "Onde vai a vírgula? 'Bom dia crianças'", options: ["Depois de 'Bom'", "Depois de 'dia'", "Depois de 'crianças'", "Não precisa"], correctAnswer: "Depois de 'dia'", hint: "Dica: Estamos chamando as crianças (vocativo)." },
    { question: "Qual frase NÃO precisa de vírgula?", options: ["Eu comprei pão queijo e leite", "Pedro venha cá", "Eu gosto de estudar", "Ana Maria e João brincaram"], correctAnswer: "Eu gosto de estudar", hint: "Dica: Frases simples sem lista ou vocativo não precisam." },
    { question: "Depois de qual palavra tem vírgula? 'Olá professor tudo bem'", options: ["Olá", "professor", "tudo", "bem"], correctAnswer: "Olá", hint: "Dica: Estamos chamando o professor!" },
  ],
  'acentos': [
    { question: "Qual palavra tem acento agudo?", options: ["Mesa", "Café", "Porta", "Livro"], correctAnswer: "Café", hint: "Dica: O acento agudo é esse: ´" },
    { question: "Qual dessas é uma oxítona acentuada?", options: ["Lápis", "Sofá", "Árvore", "Fácil"], correctAnswer: "Sofá", hint: "Dica: Oxítonas têm a sílaba tônica na última!" },
    { question: "Qual palavra tem acento circunflexo (^)?", options: ["Avó", "Você", "Café", "Jacaré"], correctAnswer: "Você", hint: "Dica: O circunflexo parece um chapeuzinho: ê" },
    { question: "Por que 'médico' tem acento?", options: ["Porque é bonita", "Porque é proparoxítona", "Para enfeitar", "Não sei"], correctAnswer: "Porque é proparoxítona", hint: "Dica: A sílaba forte é a antepenúltima!" },
    { question: "Qual a diferença entre 'avó' e 'avô'?", options: ["Nenhuma", "Avó é feminino e avô é masculino", "São iguais", "Avô é mais velho"], correctAnswer: "Avó é feminino e avô é masculino", hint: "Dica: O acento muda o som e o gênero!" },
    { question: "A palavra 'água' tem acento por quê?", options: ["É paroxítona em ditongo", "É bonita", "É proparoxítona", "Sempre leva acento"], correctAnswer: "É paroxítona em ditongo", hint: "Dica: Paroxítonas em ditongo levam acento." },
    { question: "Qual dessas NÃO tem acento?", options: ["Café", "Sofá", "Mesa", "Vocé"], correctAnswer: "Mesa", hint: "Dica: É uma paroxítona terminada em 'a'." },
    { question: "Onde fica o acento em 'máquina'?", options: ["Na última sílaba", "Na penúltima", "Na antepenúltima", "Não tem"], correctAnswer: "Na antepenúltima", hint: "Dica: MÁ-qui-na → proparoxítona!" },
  ],
  // ===== CIÊNCIAS =====
  'animais': [
    { question: "Qual animal é um mamífero?", options: ["Tubarão", "Cobra", "Golfinho", "Arara"], correctAnswer: "Golfinho", hint: "Dica: Vive na água mas mama quando filhote." },
    { question: "Qual animal é um réptil?", options: ["Gato", "Jacaré", "Cachorro", "Galinha"], correctAnswer: "Jacaré", hint: "Dica: Tem escamas e sangue frio." },
    { question: "Qual animal bota ovos?", options: ["Cachorro", "Gato", "Galinha", "Vaca"], correctAnswer: "Galinha", hint: "Dica: São as aves!" },
    { question: "Qual animal é invertebrado?", options: ["Cachorro", "Gato", "Borboleta", "Peixe"], correctAnswer: "Borboleta", hint: "Dica: Insetos não têm coluna vertebral." },
    { question: "Qual é o maior animal do mundo?", options: ["Elefante", "Girafa", "Baleia-azul", "Tubarão"], correctAnswer: "Baleia-azul", hint: "Dica: Vive no oceano e é gigante!" },
    { question: "Qual animal é um anfíbio?", options: ["Cobra", "Sapo", "Lagarto", "Tartaruga"], correctAnswer: "Sapo", hint: "Dica: Vive na água e na terra!" },
    { question: "O que é um herbívoro?", options: ["Come carne", "Come plantas", "Come tudo", "Não come"], correctAnswer: "Come plantas", hint: "Dica: A vaca é um herbívoro." },
    { question: "Quantas patas tem uma aranha?", options: ["4", "6", "8", "10"], correctAnswer: "8", hint: "Dica: Mais do que insetos!" },
  ],
  'plantas': [
    { question: "O que as plantas precisam para fotossíntese?", options: ["Luz e Água", "Apenas Terra", "Sombra", "Suco de Laranja"], correctAnswer: "Luz e Água", hint: "Dica: Adoram beber água e tomar sol!" },
    { question: "Qual parte da planta absorve água?", options: ["Folha", "Flor", "Raiz", "Fruto"], correctAnswer: "Raiz", hint: "Dica: Fica embaixo da terra." },
    { question: "O que as plantas produzem na fotossíntese?", options: ["Água", "Oxigênio", "CO2", "Terra"], correctAnswer: "Oxigênio", hint: "Dica: É o que respiramos!" },
    { question: "Qual parte da planta faz fotossíntese?", options: ["Raiz", "Caule", "Folha", "Flor"], correctAnswer: "Folha", hint: "Dica: São verdes por causa da clorofila." },
    { question: "De onde vêm as sementes?", options: ["Da raiz", "Do caule", "Do fruto", "Da folha"], correctAnswer: "Do fruto", hint: "Dica: Dentro da maçã tem sementinhas!" },
    { question: "Qual parte da planta atrai polinizadores?", options: ["Raiz", "Caule", "Folha", "Flor"], correctAnswer: "Flor", hint: "Dica: Abelhas adoram visitar..." },
    { question: "O caule da planta serve para quê?", options: ["Fazer flores", "Transportar água e nutrientes", "Captar luz", "Produzir sementes"], correctAnswer: "Transportar água e nutrientes", hint: "Dica: É como um cano da planta." },
    { question: "Qual dessas é uma árvore frutífera?", options: ["Pinheiro", "Bambu", "Mangueira", "Cacto"], correctAnswer: "Mangueira", hint: "Dica: Dá mangas!" },
  ],
  'corpo humano': [
    { question: "Qual o maior órgão do corpo?", options: ["Coração", "Fígado", "Pele", "Pulmão"], correctAnswer: "Pele", hint: "Dica: Cobre todo o seu corpo." },
    { question: "Qual gás respiramos?", options: ["Nitrogênio", "Oxigênio", "Carbono", "Hidrogênio"], correctAnswer: "Oxigênio", hint: "Dica: As árvores produzem para nós." },
    { question: "Quantos ossos tem o corpo adulto?", options: ["106", "206", "306", "406"], correctAnswer: "206", hint: "Dica: Bebês têm mais porque alguns se juntam." },
    { question: "Qual órgão bombeia o sangue?", options: ["Pulmão", "Estômago", "Coração", "Rim"], correctAnswer: "Coração", hint: "Dica: Bate o dia todo: tum-tum!" },
    { question: "Qual órgão digere a comida?", options: ["Pulmão", "Estômago", "Coração", "Cérebro"], correctAnswer: "Estômago", hint: "Dica: Fica na barriga!" },
    { question: "Qual sentido usamos com os olhos?", options: ["Audição", "Olfato", "Visão", "Tato"], correctAnswer: "Visão", hint: "Dica: É o sentido de VER." },
    { question: "Quantos sentidos temos?", options: ["3", "4", "5", "6"], correctAnswer: "5", hint: "Dica: Visão, audição, olfato, paladar e tato." },
    { question: "O que protege o cérebro?", options: ["A pele", "O crânio", "O cabelo", "O nariz"], correctAnswer: "O crânio", hint: "Dica: É um osso na cabeça!" },
  ],
  'universo': [
    { question: "O que é uma galáxia?", options: ["Uma estrela", "Um planeta", "Bilhões de estrelas juntas", "Uma lua"], correctAnswer: "Bilhões de estrelas juntas", hint: "Dica: A Via Láctea é a nossa!" },
    { question: "Qual o maior planeta do Sistema Solar?", options: ["Terra", "Marte", "Júpiter", "Saturno"], correctAnswer: "Júpiter", hint: "Dica: Gigante de gás!" },
    { question: "Qual planeta tem anéis?", options: ["Marte", "Saturno", "Vênus", "Netuno"], correctAnswer: "Saturno", hint: "Dica: Anéis de gelo e rochas." },
    { question: "O que é um buraco negro?", options: ["Um buraco no chão", "Estrela morta com gravidade fortíssima", "Túnel no espaço", "Planeta escuro"], correctAnswer: "Estrela morta com gravidade fortíssima", hint: "Dica: Até a luz é sugada!" },
    { question: "Quantos planetas tem o Sistema Solar?", options: ["7", "8", "9", "10"], correctAnswer: "8", hint: "Dica: Plutão agora é planeta anão." },
    { question: "O que a Lua faz ao redor da Terra?", options: ["Fica parada", "Gira ao redor", "Vai e volta", "Nada"], correctAnswer: "Gira ao redor", hint: "Dica: É um satélite natural!" },
    { question: "Qual a estrela mais próxima da Terra?", options: ["Sirius", "Sol", "Alpha Centauri", "Polaris"], correctAnswer: "Sol", hint: "Dica: Você a vê todos os dias!" },
    { question: "Qual o planeta mais próximo do Sol?", options: ["Terra", "Vênus", "Mercúrio", "Marte"], correctAnswer: "Mercúrio", hint: "Dica: Mensageiro dos deuses." },
  ],
  // ===== GEOGRAFIA =====
  'cidades': [
    { question: "Qual a capital do Brasil?", options: ["São Paulo", "Rio de Janeiro", "Brasília", "Salvador"], correctAnswer: "Brasília", hint: "Dica: Foi construída no centro do país!" },
    { question: "Qual a maior cidade do Brasil?", options: ["Brasília", "São Paulo", "Rio de Janeiro", "Belo Horizonte"], correctAnswer: "São Paulo", hint: "Dica: Tem mais de 12 milhões de pessoas." },
    { question: "Em qual cidade fica o Cristo Redentor?", options: ["São Paulo", "Rio de Janeiro", "Brasília", "Manaus"], correctAnswer: "Rio de Janeiro", hint: "Dica: É a Cidade Maravilhosa!" },
    { question: "Qual cidade é famosa pelo Carnaval?", options: ["Curitiba", "Porto Alegre", "Rio de Janeiro", "Florianópolis"], correctAnswer: "Rio de Janeiro", hint: "Dica: Tem o sambódromo!" },
    { question: "Qual cidade é capital da França?", options: ["Londres", "Madrid", "Roma", "Paris"], correctAnswer: "Paris", hint: "Dica: Tem a Torre Eiffel!" },
    { question: "Qual cidade é famosa pela pizza?", options: ["Paris", "Tóquio", "Nápoles", "Londres"], correctAnswer: "Nápoles", hint: "Dica: Fica na Itália!" },
    { question: "Qual é a capital de Portugal?", options: ["Porto", "Lisboa", "Madrid", "Barcelona"], correctAnswer: "Lisboa", hint: "Dica: Fica na beira do rio Tejo." },
    { question: "Qual a capital do Japão?", options: ["Pequim", "Seul", "Tóquio", "Bangkok"], correctAnswer: "Tóquio", hint: "Dica: Uma das maiores cidades do mundo!" },
  ],
  'mapas': [
    { question: "Para que serve um mapa?", options: ["Para decorar", "Para localizar lugares", "Para desenhar", "Para brincar"], correctAnswer: "Para localizar lugares", hint: "Dica: Mostra onde as coisas ficam!" },
    { question: "O que é uma rosa dos ventos?", options: ["Uma flor", "Mostra as direções N, S, L, O", "Um tipo de mapa", "Um rio"], correctAnswer: "Mostra as direções N, S, L, O", hint: "Dica: Norte, Sul, Leste e Oeste!" },
    { question: "O que representa o azul no mapa?", options: ["Florestas", "Cidades", "Água", "Montanhas"], correctAnswer: "Água", hint: "Dica: Rios e Oceanos!" },
    { question: "O que é a legenda de um mapa?", options: ["Uma história", "Explica os símbolos", "O título", "Uma cidade"], correctAnswer: "Explica os símbolos", hint: "Dica: Diz o que cada cor ou símbolo significa." },
    { question: "Como se chama o mapa do mundo inteiro?", options: ["Atlas", "Planisfério", "Carta", "Globe"], correctAnswer: "Planisfério", hint: "Dica: Mostra todos os continentes abertos." },
    { question: "O verde no mapa geralmente representa...?", options: ["Água", "Vegetação", "Cidades", "Desertos"], correctAnswer: "Vegetação", hint: "Dica: Florestas e matas!" },
    { question: "O que é 'escala' em um mapa?", options: ["Uma escada", "A proporção entre o mapa e a realidade", "O título", "A legenda"], correctAnswer: "A proporção entre o mapa e a realidade", hint: "Dica: 1cm no mapa pode ser 100km na vida real!" },
    { question: "Qual direção fica no topo do mapa?", options: ["Sul", "Leste", "Norte", "Oeste"], correctAnswer: "Norte", hint: "Dica: Sempre apontando para cima!" },
  ],
  'clima': [
    { question: "Qual é o clima das regiões próximas ao Equador?", options: ["Frio", "Tropical/Quente", "Polar", "Temperado"], correctAnswer: "Tropical/Quente", hint: "Dica: O Brasil está perto do Equador!" },
    { question: "O que é chuva?", options: ["Água caindo das nuvens", "Vento forte", "Neve", "Granizo"], correctAnswer: "Água caindo das nuvens", hint: "Dica: As nuvens ficam pesadas de água." },
    { question: "Qual estação é mais fria?", options: ["Verão", "Primavera", "Outono", "Inverno"], correctAnswer: "Inverno", hint: "Dica: Usamos casacos e cobertores!" },
    { question: "O que o termômetro mede?", options: ["Vento", "Chuva", "Temperatura", "Umidade"], correctAnswer: "Temperatura", hint: "Dica: Mostra se está quente ou frio." },
    { question: "O que causa as estações do ano?", options: ["A Lua", "A inclinação da Terra", "O vento", "As nuvens"], correctAnswer: "A inclinação da Terra", hint: "Dica: A Terra é 'tortinha' no eixo!" },
    { question: "Onde neva mais?", options: ["Na praia", "No deserto", "Nas montanhas altas", "Na floresta tropical"], correctAnswer: "Nas montanhas altas", hint: "Dica: Quanto mais alto, mais frio!" },
    { question: "O que é umidade do ar?", options: ["Quantidade de vento", "Quantidade de vapor d'água", "Temperatura", "Pressão"], correctAnswer: "Quantidade de vapor d'água", hint: "Dica: É a 'água invisível' no ar." },
    { question: "Quantas estações do ano existem?", options: ["2", "3", "4", "5"], correctAnswer: "4", hint: "Dica: Primavera, Verão, Outono e Inverno." },
  ],
  'planetas': [
    { question: "Qual é o Planeta Vermelho?", options: ["Terra", "Marte", "Júpiter", "Saturno"], correctAnswer: "Marte", hint: "Dica: Poeira ferrosa dá essa cor." },
    { question: "Qual planeta é o mais quente?", options: ["Mercúrio", "Vênus", "Marte", "Terra"], correctAnswer: "Vênus", hint: "Dica: Sua atmosfera prende o calor!" },
    { question: "Qual planeta tem a Grande Mancha Vermelha?", options: ["Marte", "Saturno", "Júpiter", "Netuno"], correctAnswer: "Júpiter", hint: "Dica: É uma tempestade gigante!" },
    { question: "Qual o menor planeta do Sistema Solar?", options: ["Marte", "Mercúrio", "Vênus", "Terra"], correctAnswer: "Mercúrio", hint: "Dica: É o mais perto do Sol e o menorzinho!" },
    { question: "Qual planeta tem o dia mais longo?", options: ["Terra", "Júpiter", "Vênus", "Marte"], correctAnswer: "Vênus", hint: "Dica: Um dia lá dura mais que um ano!" },
    { question: "Qual é o planeta mais distante do Sol?", options: ["Urano", "Saturno", "Netuno", "Plutão"], correctAnswer: "Netuno", hint: "Dica: É azul e gelado, o último dos 8!" },
    { question: "Qual é o único planeta com vida conhecida?", options: ["Marte", "Vênus", "Terra", "Júpiter"], correctAnswer: "Terra", hint: "Dica: É onde você mora!" },
    { question: "Qual planeta gira 'deitado'?", options: ["Marte", "Vênus", "Urano", "Netuno"], correctAnswer: "Urano", hint: "Dica: Seu eixo é quase horizontal!" },
  ],
  // ===== DEFAULT =====
  'default': [
    { question: "Quantas patas tem um cachorro?", options: ["2", "3", "4", "6"], correctAnswer: "4", hint: "Dica: Tem 4 patinhas!" },
    { question: "Qual cor se forma ao misturar azul e amarelo?", options: ["Vermelho", "Verde", "Roxo", "Laranja"], correctAnswer: "Verde", hint: "Dica: Cor das folhas!" },
    { question: "Quantos dias tem uma semana?", options: ["5", "6", "7", "8"], correctAnswer: "7", hint: "Dica: Domingo a Sábado." },
    { question: "Qual é o animal que mia?", options: ["Cachorro", "Gato", "Passarinho", "Sapo"], correctAnswer: "Gato", hint: "Dica: Bichano peludo!" },
    { question: "Quantos meses tem um ano?", options: ["10", "11", "12", "13"], correctAnswer: "12", hint: "Dica: Janeiro é o primeiro!" },
    { question: "Qual estação vem depois do verão?", options: ["Primavera", "Outono", "Inverno", "Verão"], correctAnswer: "Outono", hint: "Dica: As folhas caem." },
    { question: "Qual a cor do céu em um dia limpo?", options: ["Verde", "Amarelo", "Azul", "Vermelho"], correctAnswer: "Azul", hint: "Dica: Olhe para cima num dia bonito!" },
    { question: "Qual instrumento usamos para medir o tempo?", options: ["Régua", "Termômetro", "Relógio", "Balança"], correctAnswer: "Relógio", hint: "Dica: Tem horas e minutos!" },
  ]
};

// Rastreia quais perguntas já foram usadas (por chave de tópico)
const usedQuestions: Record<string, Set<number>> = {};

/**
 * Retorna uma pergunta aleatória não-repetida do banco.
 * Retorna NULL se TODAS as perguntas do tópico já foram usadas (tópico esgotado).
 */
function pickRandomQuestion(key: string): Question | null {
  const bank = QUESTION_BANK[key] || QUESTION_BANK['default'];
  
  if (!usedQuestions[key]) {
    usedQuestions[key] = new Set();
  }
  
  // Se usou TODAS, retorna null (tópico concluído — SEM RESET)
  if (usedQuestions[key].size >= bank.length) {
    return null;
  }
  
  let idx: number;
  do {
    idx = Math.floor(Math.random() * bank.length);
  } while (usedQuestions[key].has(idx));
  
  usedQuestions[key].add(idx);
  return bank[idx];
}

/** Reseta o rastreamento de perguntas usadas (ao trocar matéria) */
export function resetUsedQuestions() {
  Object.keys(usedQuestions).forEach(key => {
    usedQuestions[key].clear();
  });
}

/**
 * Detecta a chave do banco de perguntas.
 * Usa o NOME DO TÓPICO como chave primária (ex: "Adição" → "adicao").
 */
function detectSubjectKey(prompt: string): string {
  const p = prompt.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // remove acentos

  // Tópicos específicos
  if (/adicao/.test(p)) return 'adicao';
  if (/subtracao/.test(p)) return 'subtracao';
  if (/geometria/.test(p)) return 'geometria';
  if (/logica/.test(p)) return 'logica';
  if (/alfabeto/.test(p)) return 'alfabeto';
  if (/formar palavras/.test(p)) return 'formar palavras';
  if (/virgula/.test(p)) return 'virgula';
  if (/acentos|acento/.test(p)) return 'acentos';
  if (/animais/.test(p)) return 'animais';
  if (/plantas/.test(p)) return 'plantas';
  if (/corpo humano/.test(p)) return 'corpo humano';
  if (/universo|espaco|galaxia/.test(p)) return 'universo';
  if (/cidades|capital/.test(p)) return 'cidades';
  if (/mapas|mapa/.test(p)) return 'mapas';
  if (/clima|estacao/.test(p)) return 'clima';
  if (/planetas|planeta/.test(p)) return 'planetas';
  
  // Matérias genéricas (fallback)
  if (/matematica/.test(p)) return 'adicao';
  if (/portugues|gramatica/.test(p)) return 'virgula';
  if (/ciencias|biologia/.test(p)) return 'animais';
  if (/geografia/.test(p)) return 'mapas';
  
  return 'default';
}

// ========================================================================
// CIRCUIT BREAKER — Evita requisições desperdiçadas após um 429
// ========================================================================
let circuitBreakerUntil = 0;

function isCircuitOpen(): boolean {
  return Date.now() < circuitBreakerUntil;
}

function tripCircuitBreaker(retryAfterSeconds: number = 60) {
  circuitBreakerUntil = Date.now() + retryAfterSeconds * 1000;
}

// ========================================================================
// PROVIDER PRINCIPAL
// ========================================================================
export class GeminiProvider implements IAIProvider {
  private readonly client: any;
  private readonly modelName: string;

  constructor(apiKey: string, modelName: string = 'gemini-2.0-flash') {
    if (!apiKey) {
      throw new Error('[GeminiProvider] API Key is required. Verifique o seu .env');
    }
    this.client = new GoogleGenAI({ 
      apiKey,
      httpOptions: { apiVersion: 'v1beta' } 
    });
    this.modelName = modelName;
  }

  private buildMockResponse(prompt: string, history: IChatMessage[]) {
    const subjectKey = detectSubjectKey(prompt);
    const mockResponse = pickRandomQuestion(subjectKey);
    
    // Se o banco esgotou, sinaliza isso
    if (!mockResponse) {
      return {
        responseText: JSON.stringify({ _topicCompleted: true }),
        updatedHistory: history
      };
    }

    return {
      responseText: JSON.stringify(mockResponse),
      updatedHistory: [...history, 
        { role: 'user', parts: [{ text: prompt }] },
        { role: 'model', parts: [{ text: JSON.stringify(mockResponse) }] }
      ] as IChatMessage[]
    };
  }

  public async sendMessage(
    prompt: string, 
    systemInstruction: string, 
    history: IChatMessage[]
  ): Promise<{ responseText: string; updatedHistory: IChatMessage[] }> {
    
    // ⚡ CIRCUIT BREAKER: Se a cota estourou recentemente, vai direto pro banco local
    if (isCircuitOpen()) {
      return this.buildMockResponse(prompt, history);
    }

    try {
      const chat = this.client.chats.create({
        model: this.modelName,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
        history,
      });

      const result = await chat.sendMessage({ message: prompt });
      const response = result.response;
      const responseText = response.text();
      
      if (!responseText) {
        throw new Error('A IA não retornou conteúdo (Filtro de segurança).');
      }

      return {
        responseText,
        updatedHistory: chat.history as IChatMessage[],
      };
      
    } catch (error: any) {
      const status = error?.status || error?.response?.status;

      if (status === 429) {
        const retryMatch = error?.message?.match(/retry in (\d+)/i);
        const retrySeconds = retryMatch ? parseInt(retryMatch[1]) : 60;
        tripCircuitBreaker(retrySeconds);
        console.debug(`[GeminiProvider] Circuit breaker ativo por ${retrySeconds}s.`);
        return this.buildMockResponse(prompt, history);
      }

      if (status === 403 || status === 401) throw new Error('Chave de API inválida ou sem permissão.');

      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido no SDK Moderno';
      throw new Error(`[Modern AI Failure]: ${errorMessage}`);
    }
  }
}
