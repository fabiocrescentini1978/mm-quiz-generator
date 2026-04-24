import { List, CheckCircle2, PenTool } from "lucide-react";

interface VisualEditorProps {
  data: any;
  onChange: (newData: any) => void;
}

export function VisualEditor({ data, onChange }: VisualEditorProps) {
  // Normalize to array for easier mapping
  const isArray = Array.isArray(data);
  const items = isArray ? data : [data];

  const updateCaseField = (caseIndex: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[caseIndex] = { ...newItems[caseIndex], [field]: value };
    onChange(isArray ? newItems : newItems[0]);
  };

  const updateStepField = (caseIndex: number, stepIndex: number, field: string, value: any) => {
    const newItems = [...items];
    const newSteps = [...(newItems[caseIndex].steps || [])];
    newSteps[stepIndex] = { ...newSteps[stepIndex], [field]: value };
    newItems[caseIndex] = { ...newItems[caseIndex], steps: newSteps };
    onChange(isArray ? newItems : newItems[0]);
  };

  const updateOptionText = (caseIndex: number, stepIndex: number, optIndex: number, text: string) => {
    const newItems = [...items];
    const newSteps = [...(newItems[caseIndex].steps || [])];
    const newOpts = [...(newSteps[stepIndex].options || [])];
    newOpts[optIndex] = { ...newOpts[optIndex], text };
    newSteps[stepIndex] = { ...newSteps[stepIndex], options: newOpts };
    newItems[caseIndex] = { ...newItems[caseIndex], steps: newSteps };
    onChange(isArray ? newItems : newItems[0]);
  };

  if (!items || items.length === 0 || !items[0]?.title) {
    return <div className="text-center text-neutral-500 mt-10">Formato não visualizável ou em branco.</div>;
  }

  return (
    <div className="space-y-8 pb-10">
      {items.map((clinicalCase, cIdx) => (
        <div key={cIdx} className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-lg">
          
          {/* HEADER DO CASO */}
          <div className="bg-neutral-800/50 p-4 border-b border-neutral-800">
            <h3 className="text-sm font-bold text-orange-500 mb-4 flex items-center gap-2">
              <PenTool className="w-4 h-4" /> Editando Caso Clínico {cIdx + 1}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs text-neutral-400 block mb-1">Título do Caso</label>
                <input 
                  type="text" 
                  value={clinicalCase.title || ""} 
                  onChange={(e) => updateCaseField(cIdx, "title", e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-md p-2 text-sm text-white"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-neutral-400 block mb-1">Especialidade</label>
                  <input 
                    type="text" 
                    value={clinicalCase.specialty || ""} 
                    onChange={(e) => updateCaseField(cIdx, "specialty", e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-md p-2 text-sm text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-neutral-400 block mb-1">Dificuldade</label>
                  <select 
                    value={clinicalCase.difficulty || "medium"} 
                    onChange={(e) => updateCaseField(cIdx, "difficulty", e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-md p-2 text-sm text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="easy">Fácil (Easy)</option>
                    <option value="medium">Média (Medium)</option>
                    <option value="hard">Difícil (Hard)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-amber-500 block mb-1">UUID da Aula Sugerida (Opcional)</label>
                  <input 
                    type="text" 
                    placeholder="Ex: 550e8400-e29b-41d4-a716-446655440000"
                    value={clinicalCase.suggested_lesson_id || ""} 
                    onChange={(e) => updateCaseField(cIdx, "suggested_lesson_id", e.target.value || null)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-md p-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-amber-500 block mb-1">UUID do Curso Sugerido (Opcional)</label>
                  <input 
                    type="text" 
                    placeholder="Ex: 123e4567-e89b-12d3-a456-426614174000"
                    value={clinicalCase.suggested_course_id || ""} 
                    onChange={(e) => updateCaseField(cIdx, "suggested_course_id", e.target.value || null)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-md p-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-neutral-400 block mb-1">Apresentação Inicial (Vinheta)</label>
                <textarea 
                  value={clinicalCase.initial_presentation || ""} 
                  onChange={(e) => updateCaseField(cIdx, "initial_presentation", e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-md p-2 text-sm text-white min-h-[80px]"
                />
              </div>
            </div>
          </div>

          {/* PASSOS / QUESTÕES */}
          <div className="p-4 space-y-6">
            <h4 className="text-sm font-semibold text-neutral-300 flex items-center gap-2 border-b border-neutral-800 pb-2">
              <List className="w-4 h-4" /> Questões / Passos ({clinicalCase.steps?.length || 0})
            </h4>

            {clinicalCase.steps?.map((step: any, sIdx: number) => (
              <div key={sIdx} className="bg-neutral-950 border border-neutral-800 rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-center bg-neutral-900 -mx-4 -mt-4 p-3 border-b border-neutral-800 rounded-t-lg">
                  <span className="font-bold text-xs text-neutral-400">PASSO {sIdx + 1}</span>
                  <select 
                    value={step.question_type || "multiple_choice"}
                    onChange={(e) => updateStepField(cIdx, sIdx, "question_type", e.target.value)}
                    className="bg-neutral-800 text-xs text-white border-none rounded p-1"
                  >
                    <option value="multiple_choice">Múltipla Escolha</option>
                    <option value="essay">Dissertativa</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-neutral-500 block mb-1">Título da Questão</label>
                  <input 
                    type="text" 
                    value={step.title || ""} 
                    onChange={(e) => updateStepField(cIdx, sIdx, "title", e.target.value)}
                    className="w-full bg-transparent border-b border-neutral-700 p-1 text-sm text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-neutral-300 font-bold block mb-1">Descrição / História Clínica</label>
                  <textarea 
                    value={step.content || ""} 
                    onChange={(e) => updateStepField(cIdx, sIdx, "content", e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-md p-3 text-sm text-white min-h-[120px] focus:outline-none focus:border-orange-500 leading-relaxed"
                  />
                </div>

                <div>
                  <label className="text-xs text-neutral-500 block mb-1">Enunciado (Pergunta Mãe)</label>
                  <textarea 
                    value={step.question || ""} 
                    onChange={(e) => updateStepField(cIdx, sIdx, "question", e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-md p-2 text-sm text-white min-h-[60px]"
                  />
                </div>

                {/* Alternativas (Só renderiza se for múltipla escolha ou se tiver matriz options) */}
                {(step.question_type !== "essay" && step.options) && (
                  <div className="bg-neutral-900 p-3 rounded-lg border border-neutral-800">
                    <label className="text-xs font-bold text-neutral-400 block mb-3 uppercase tracking-wide">Alternativas</label>
                    <div className="space-y-2">
                      {step.options.map((opt: any, oIdx: number) => (
                        <div key={oIdx} className={`flex items-start gap-2 p-2 rounded-md border ${step.correct_option_id === opt.id ? 'border-green-600 bg-green-900/10' : 'border-neutral-800 bg-neutral-950'}`}>
                          <input 
                            type="radio" 
                            name={`correct-${cIdx}-${sIdx}`}
                            checked={step.correct_option_id === opt.id}
                            onChange={() => updateStepField(cIdx, sIdx, "correct_option_id", opt.id)}
                            className="mt-1"
                          />
                          <span className="font-bold text-sm text-neutral-500">{opt.id})</span>
                          <textarea 
                            value={opt.text}
                            onChange={(e) => updateOptionText(cIdx, sIdx, oIdx, e.target.value)}
                            className="flex-1 bg-transparent border-none outline-none text-sm text-white resize-none min-h-[40px]"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Gabarito Comentado */}
                <div className="bg-blue-900/10 p-3 rounded-lg border border-blue-900/30">
                  <label className="text-xs font-bold text-blue-400 flex items-center gap-1 mb-2">
                    <CheckCircle2 className="w-3 h-3" /> Gabarito Comentado / Explicação da IA
                  </label>
                  <textarea 
                    value={step.explanation || ""} 
                    onChange={(e) => updateStepField(cIdx, sIdx, "explanation", e.target.value)}
                    className="w-full bg-neutral-950 border border-blue-900/50 rounded-md p-2 text-sm text-white min-h-[80px]"
                  />
                </div>

              </div>
            ))}
          </div>

        </div>
      ))}
    </div>
  );
}
