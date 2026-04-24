const fs = require('fs');

const raw = fs.readFileSync('input_novo.json', 'utf8');
const data = JSON.parse(raw);

const finalObject = {
  title: "Simulado 2: Câncer Colorretal e Urgências",
  specialty: "Oncologia Cirúrgica",
  difficulty: "hard",
  description: "Bateria de casos resolvidos englobando estadiamento, genética, urgências obstrutivas e manejo na oncologia.",
  initial_presentation: "Atenção: todas as questões a seguir constituem um simulado contínuo. Leia com cuidado os dados da apresentação ao início de cada questionamento.",
  steps: data.map((item, index) => {
    const step = item.steps[0];
    return {
      title: item.title,
      content: `**${item.title}:** ${item.initial_presentation}\n\n**Evolução:** ${step.content}`,
      previous_step_comment: step.previous_step_comment || "",
      question: step.question,
      options: step.options,
      correct_option_id: step.correct_option_id,
      explanation: step.explanation
    };
  })
};

fs.writeFileSync('simulado_2.json', JSON.stringify([finalObject], null, 2));
console.log('Feito simulado_2.json');
