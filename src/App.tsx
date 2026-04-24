import { useState } from "react";
import { Copy, Key, Send, BrainCircuit, Activity, BookOpen, AlertTriangle, Database, Code2, PenTool, Trash2 } from "lucide-react";
import { ImageUploader } from "./components/ImageUploader";
import { generateClinicalJSON } from "./services/ai";
import { getSupabaseClient } from "./lib/supabase";
import { VisualEditor } from "./components/VisualEditor";

type SchemaType = "quiz" | "exam";

export default function App() {
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem("quiz_gemini_key") || "");
  const [supabaseUrl, setSupabaseUrl] = useState(import.meta.env.VITE_SUPABASE_URL || localStorage.getItem("quiz_supa_url") || "");
  const [supabaseKey, setSupabaseKey] = useState(import.meta.env.VITE_SUPABASE_ANON_KEY || localStorage.getItem("quiz_supa_key") || "");

  const [schemaType, setSchemaType] = useState<SchemaType>("quiz");
  const [prompt, setPrompt] = useState("");
  const [images, setImages] = useState<{ file: File; base64: string; mimeType: string }[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [inserting, setInserting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [viewMode, setViewMode] = useState<"visual"| "json">("visual");
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleClear = () => {
    setPrompt("");
    setImages([]);
    setResult(null);
    setError(null);
    setSuccessMsg(null);
  };

  const saveConfig = (key: string, value: string) => {
    localStorage.setItem(key, value);
  };

  const handleGenerate = async () => {
    if (!apiKey) { setError("Insira a chave da API do Gemini."); return; }
    if (!prompt.trim() && images.length === 0) { setError("Forneça um prompt ou imagens."); return; }

    setLoading(true); setError(null); setSuccessMsg(null);
    try {
      const res = await generateClinicalJSON(apiKey, prompt, images.map(img => ({ data: img.base64, mimeType: img.mimeType })), schemaType);
      setResult(res);
      setViewMode("visual"); // Auto-switch to visual mode for ease of use
    } catch (err: any) {
      setError(err.message || "Falha ao gerar o JSON.");
    } finally { setLoading(false); }
  };

  const insertSingleCase = async (caseObj: any, supa: any) => {
    const clinicalCase = {
      title: caseObj.title,
      case_type: schemaType === "quiz" ? "interactive" : "exam",
      specialty: caseObj.specialty,
      difficulty: caseObj.difficulty,
      description: caseObj.description,
      initial_presentation: caseObj.initial_presentation,
      is_active: true,
      whitelist_only: false
    };

    const { data: caseData, error: caseErr } = await supa.from("clinical_cases").insert(clinicalCase).select().single();
    if (caseErr) throw caseErr;

    if (caseObj.steps && caseObj.steps.length > 0) {
      const stepsToInsert = caseObj.steps.map((step: any, index: number) => ({
        case_id: caseData.id,
        step_order: index + 1,
        title: step.title,
        step_type: "standard",
        question_type: step.question_type || "multiple_choice",
        content: step.content,
        question: step.question,
        options: step.options || null,
        correct_option_id: step.correct_option_id || null,
        explanation: step.explanation || null,
        previous_step_comment: step.previous_step_comment || null
      }));

      const { error: stepsErr } = await supa.from("clinical_case_steps").insert(stepsToInsert);
      if (stepsErr) throw stepsErr;
    }
  };

  const handleInsertSupa = async () => {
    if (!result) return;
    if (!supabaseUrl || !supabaseKey) { setError("Insira a URL e a Chave do Supabase."); return; }
    
    setInserting(true); setError(null); setSuccessMsg(null);
    try {
      const supa = getSupabaseClient(supabaseUrl, supabaseKey);
      
      if (Array.isArray(result)) {
        for (const item of result) {
          await insertSingleCase(item, supa);
        }
      } else {
        await insertSingleCase(result, supa);
      }

      setSuccessMsg("Tudo inserido com sucesso no Supabase!");
    } catch (err: any) {
      setError(err.message || "Erro ao inserir no Supabase.");
    } finally {
      setInserting(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-neutral-900 text-neutral-100 font-sans grid grid-cols-1 md:grid-cols-12">
      {/* LEFT PANEL */}
      <div className="md:col-span-3 border-r border-neutral-800 p-6 flex flex-col space-y-6 bg-neutral-950 overflow-y-auto min-h-0">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2 text-white">
            <BrainCircuit className="text-orange-500" /> Lab de Provas
          </h1>
          <p className="text-xs text-neutral-500 mt-1">Geração Assistida com Gemini 3.1</p>
        </div>

        <div className="space-y-4">
          <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
            <Key className="w-3 h-3" /> Chaves de API
          </label>
          <input type="password" value={apiKey} onChange={(e) => { setApiKey(e.target.value); saveConfig("quiz_gemini_key", e.target.value) }} placeholder="Gemini API Key" className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-xs focus:ring-1 focus:ring-orange-500 outline-none" />
          <input type="text" value={supabaseUrl} onChange={(e) => { setSupabaseUrl(e.target.value); saveConfig("quiz_supa_url", e.target.value) }} placeholder="Supabase Project URL" className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-xs focus:ring-1 focus:ring-blue-500 outline-none" />
          <input type="password" value={supabaseKey} onChange={(e) => { setSupabaseKey(e.target.value); saveConfig("quiz_supa_key", e.target.value) }} placeholder="Supabase Anon/Service Key" className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-xs focus:ring-1 focus:ring-blue-500 outline-none" />
        </div>

        <div className="space-y-3">
          <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-3 h-3" /> Esquema Alvo
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setSchemaType("quiz")} className={`p-2 rounded-lg text-xs font-medium transition-colors ${schemaType === "quiz" ? "bg-orange-500 text-white" : "bg-neutral-900 text-neutral-400 border border-neutral-800"}`}>Quiz (Interativo)</button>
            <button onClick={() => setSchemaType("exam")} className={`p-2 rounded-lg text-xs font-medium transition-colors ${schemaType === "exam" ? "bg-blue-600 text-white" : "bg-neutral-900 text-neutral-400 border border-neutral-800"}`}>Prova (Mista)</button>
          </div>
        </div>

        <div className="space-y-3 bg-neutral-900/50 p-4 rounded-xl border border-neutral-800 flex-1 min-h-[250px]">
          <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-2 mb-2">
            <BookOpen className="w-3 h-3" /> Imagens Base
          </label>
          <ImageUploader images={images} onAddImages={(newImgs) => setImages([...images, ...newImgs])} onRemoveImage={(idx) => setImages(images.filter((_, i) => i !== idx))} />
        </div>
      </div>

      {/* CENTER PANEL */}
      <div className="md:col-span-4 border-r border-neutral-800 bg-neutral-900 p-6 flex flex-col h-full overflow-hidden min-h-0">
        <div className="flex-1 flex flex-col pb-4 overflow-y-auto pr-2 custom-scrollbar">
          <h2 className="text-lg font-medium mb-4 flex-shrink-0">Contexto para a IA (Prompt)</h2>
          <textarea
            value={prompt} onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ex: Crie 3 casos curtos focando em Câncer de Cólon..."
            className="flex-1 min-h-[300px] w-full bg-neutral-950 border border-neutral-800 rounded-xl p-4 resize-none outline-none focus:ring-1 focus:ring-orange-500 font-mono text-sm leading-relaxed custom-scrollbar"
          />
          {error && <div className="mt-4 p-3 bg-red-900/30 border border-red-500/50 rounded-lg flex items-start gap-2 text-red-400 text-sm"><AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" /> <p className="flex-1">{error}</p></div>}
          {successMsg && <div className="mt-4 p-3 bg-green-900/30 border border-green-500/50 rounded-lg flex items-start gap-2 text-green-400 text-sm"><p className="flex-1">{successMsg}</p></div>}
        </div>
        
        <div className="flex gap-2 mt-4 flex-shrink-0">
          <button 
            onClick={handleClear} 
            disabled={loading} 
            className="w-1/4 bg-red-950/40 text-red-500 border border-red-900/50 hover:bg-red-900/50 font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" /> Limpar
          </button>
          <button 
            onClick={handleGenerate} 
            disabled={loading} 
            className="w-3/4 bg-white text-black font-bold py-4 rounded-xl shadow-lg hover:bg-neutral-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? "Raciocinando..." : <><Send className="w-4 h-4" /> Gerar Material</>}
          </button>
        </div>
      </div>

      {/* RIGHT PANEL (Editor & Output) */}
      <div className="md:col-span-5 bg-neutral-950 p-6 flex flex-col h-full overflow-hidden min-h-0">
        
        {/* Toggle & Export actions */}
        <div className="flex items-center justify-between mb-4 bg-neutral-900 p-2 rounded-lg border border-neutral-800 flex-shrink-0">
          <div className="flex gap-1">
            <button 
              onClick={() => setViewMode("visual")} 
               className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === "visual" ? "bg-neutral-800 text-orange-500 border border-neutral-700" : "text-neutral-500 hover:text-neutral-300"}`}
            >
               <PenTool className="w-4 h-4" /> Editor Visual
            </button>
            <button 
              onClick={() => setViewMode("json")} 
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === "json" ? "bg-neutral-800 text-green-500 border border-neutral-700" : "text-neutral-500 hover:text-neutral-300"}`}
            >
               <Code2 className="w-4 h-4" /> Código JSON
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => { if(result){ navigator.clipboard.writeText(JSON.stringify(result, null, 2)); setCopied(true); setTimeout(()=>setCopied(false),2000) } }} disabled={!result} className="text-xs bg-neutral-800 hover:bg-neutral-700 px-3 py-2 rounded-md flex items-center gap-2 disabled:opacity-50 transition-colors">
              <Copy className="w-3 h-3" /> {copied ? "Copiado!" : "Copiar"}
            </button>
            <button onClick={handleInsertSupa} disabled={!result || inserting} className="text-xs bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md flex items-center gap-2 disabled:opacity-50 transition-colors text-white font-medium">
              <Database className="w-3 h-3" /> {inserting ? "Enviando..." : "Publicar"}
            </button>
          </div>
        </div>
        
        {/* Render Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-10">
          {!result ? (
             <div className="h-full flex flex-col items-center justify-center text-neutral-600 text-sm gap-2">
                Escreva o prompt e clique em Gerar Material.
             </div>
          ) : viewMode === "visual" ? (
             <VisualEditor data={result} onChange={(newData) => setResult(newData)} />
          ) : (
             <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 min-h-full">
               <pre className="text-xs text-green-400/90 font-mono whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
             </div>
          )}
        </div>

      </div>
    </div>
  );
}
