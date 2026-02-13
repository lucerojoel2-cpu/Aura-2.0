
import React, { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, Sparkles, Loader2, Scale } from 'lucide-react';
import { createAI, MODELS, generateImage } from '../services/geminiService';
import { Message } from '../types';
import ReactMarkdown from 'https://esm.sh/react-markdown';

const IURYNEX_CONTEXT = `
Eres Aura, la asistente jurídica inteligente de IURYNEX en Ecuador. 
Sobre IURYNEX: 
- Es un emprendimiento jurídico digital (tu aliado legal online).
- Ofrece servicios legales de alta calidad a través de plataformas online.
- Cuenta con abogados altamente calificados para asesoramiento y representación.
- Áreas: Derecho digital, civil, etc., adaptándose a la era digital.

Servicios especializados que brindas/orientas:
1. Asesoría legal virtual.
2. Orientación legal inicial.
3. Acompañamiento básico.
4. Atención ciudadana.
5. Consultas en línea.

Tu rol:
- Brindar orientación legal inmediata, clara y accesible en Ecuador.
- Disponible 24/7.
- Responder consultas básicas y guiar en primeros pasos legales.
- Facilitar el acceso a soluciones jurídicas modernas.
- Eslogan: "El Derecho que piensa contigo".

Instrucciones de comportamiento:
- Tono: Profesional, confiable, humano e innovador.
- Contexto Geográfico: SIEMPRE asume que el marco legal es de ECUADOR.
- Limitación importante: Eres una IA de orientación. Si el caso es complejo, recomienda siempre agendar una consulta con uno de los abogados humanos de IURYNEX.
- Idioma: Español.
`;

const ChatWindow: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Bienvenido a **IURYNEX**. Soy Aura, tu asistente jurídica inteligente. \n\n¿En qué puedo orientarte hoy? Puedo ayudarte con consultas legales iniciales, explicarte nuestros servicios virtuales o guiarte en tus primeros pasos legales en Ecuador.',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const ai = createAI();
      const chat = ai.chats.create({
        model: MODELS.TEXT_FLASH,
        config: {
          systemInstruction: IURYNEX_CONTEXT
        }
      });

      const responseStream = await chat.sendMessageStream({ message: input });
      
      const assistantMsgId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, {
        id: assistantMsgId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        isStreaming: true
      }]);

      let fullText = '';
      for await (const chunk of responseStream) {
        fullText += chunk.text;
        setMessages(prev => prev.map(m => 
          m.id === assistantMsgId ? { ...m, content: fullText } : m
        ));
      }

      setMessages(prev => prev.map(m => 
        m.id === assistantMsgId ? { ...m, isStreaming: false } : m
      ));

    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Mis disculpas, ha ocurrido un inconveniente técnico. Por favor, intenta reformular tu consulta jurídica.',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateImage = async () => {
      const promptText = window.prompt("Describe la situación legal o concepto que deseas visualizar (ej. 'Contrato digital moderno'):");
      if (!promptText) return;

      setIsLoading(true);
      const userMsg: Message = {
          id: Date.now().toString(),
          role: 'user',
          content: `Visualización solicitada: ${promptText}`,
          timestamp: new Date()
      };
      setMessages(prev => [...prev, userMsg]);

      const imgUrl = await generateImage(`Professional legal conceptual image of ${promptText}, high tech, trust, legal concept, abstract, clean background`);
      if (imgUrl) {
          setMessages(prev => [...prev, {
              id: Date.now().toString(),
              role: 'assistant',
              content: `He generado una representación visual para: "${promptText}"`,
              timestamp: new Date(),
              images: [imgUrl]
          }]);
      } else {
          setMessages(prev => [...prev, {
              id: Date.now().toString(),
              role: 'assistant',
              content: 'No se pudo generar la visualización técnica en este momento.',
              timestamp: new Date()
          }]);
      }
      setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto px-4">
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto pt-6 pb-32 space-y-6 scrollbar-hide"
      >
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] rounded-2xl p-4 px-5 shadow-sm ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-br-none' 
                : 'glass text-slate-200 rounded-bl-none border border-white/5'
            }`}>
              {msg.images && msg.images.map((url, i) => (
                <img key={i} src={url} alt="Concepto Jurídico IURYNEX" className="rounded-lg mb-3 w-full object-cover aspect-video shadow-xl" />
              ))}
              <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
              <p className="text-[10px] opacity-40 mt-2 text-right">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        {isLoading && (
            <div className="flex justify-start">
                <div className="glass rounded-2xl p-4 px-5 flex items-center gap-3 border border-white/5">
                    <Loader2 className="animate-spin text-blue-400" size={16} />
                    <span className="text-sm text-slate-400 font-medium">Aura está analizando...</span>
                </div>
            </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 pb-8 px-4 pointer-events-none">
        <div className="max-w-4xl mx-auto w-full pointer-events-auto">
          <div className="glass rounded-3xl p-2 flex items-center gap-2 border border-white/10 shadow-2xl">
            <button 
                onClick={handleGenerateImage}
                className="p-3 text-slate-400 hover:text-blue-400 transition-colors"
                title="Visualizar Concepto"
            >
              <ImageIcon size={22} />
            </button>
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Escribe tu consulta jurídica inicial..."
              className="flex-1 bg-transparent border-none outline-none text-slate-100 px-2 py-3 placeholder:text-slate-500 text-sm"
            />
            <button 
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className={`p-3 rounded-2xl transition-all ${
                input.trim() 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                  : 'text-slate-500'
              }`}
            >
              <Send size={22} />
            </button>
          </div>
          <p className="text-center text-[9px] text-slate-500 mt-2">Aura proporciona orientación legal inicial en Ecuador. Para casos críticos, consulte a un profesional.</p>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
