export const QUIZ_SCHEMA = {
  _instrucoes_para_LLM: "Gere APENAS UM ÚNICO OBJETO JSON (um único quiz/prova). Você deve colocar TODAS as questões como itens separados no array 'steps'. O fluxo é sequencial e bloqueante — o aluno só avança ao acertar. Dê um título geral ao Quiz. Para incluir pacientes diferentes, insira a história clínica do paciente no campo 'content' de cada step. Opcionalmente, inclua 'suggested_lesson_id' (UUID) e/ou 'suggested_course_id' (UUID) na raiz para oferecer continuidade.",
  title: "string",
  specialty: "string",
  difficulty: "medium | hard | easy",
  description: "string",
  initial_presentation: "string",
  suggested_lesson_id: "null | string",
  suggested_course_id: "null | string",
  steps: [
    {
      title: "string",
      content: "string",
      previous_step_comment: "string",
      question: "string",
      options: [
        { id: "A", text: "string" },
        { id: "B", text: "string" },
        { id: "C", text: "string" },
        { id: "D", text: "string" }
      ],
      correct_option_id: "A | B | C | D",
      explanation: "string"
    }
  ]
};

export const EXAM_SCHEMA = {
  _instrucoes_para_LLM: "Gere APENAS UM ÚNICO OBJETO JSON (uma única prova). Você deve colocar TODAS as questões dentro do array 'steps'. Dê um título geral à prova. Para apresentar casos diferentes na mesma prova, escreva a história clínica completa do novo paciente diretamente no campo 'content' de cada step.",
  title: "string",
  specialty: "string",
  difficulty: "hard | medium | easy",
  description: "string",
  initial_presentation: "string",
  steps: [
    {
      _tipo: "MÚLTIPLA ESCOLHA — campos obrigatórios: question_type, title, question, options (array com id e text), correct_option_id, explanation",
      title: "string",
      question_type: "multiple_choice",
      content: "string",
      previous_step_comment: "string",
      question: "string",
      options: [
        { id: "A", text: "string" },
        { id: "B", text: "string" }
      ],
      correct_option_id: "A",
      explanation: "string"
    },
    {
      _tipo: "DISSERTATIVA — campos obrigatórios: question_type='essay', title, question, explanation (gabarito usado pela IA para corrigir e atribuir nota 0-100). NÃO incluir options nem correct_option_id.",
      title: "string",
      question_type: "essay",
      content: "string",
      question: "string",
      explanation: "string"
    }
  ]
};
