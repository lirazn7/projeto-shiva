export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

    const { context, language = 'pt' } = req.body;
    const API_KEY = process.env.GROQ_API_KEY;

    if (!API_KEY) return res.status(500).json({ error: 'Chave da API do Groq não configurada.' });
    if (!context) return res.status(400).json({ error: 'O contexto é obrigatório.' });

    // Mapeamento para garantir que a IA entenda perfeitamente o idioma alvo
    const langMap = {
        'pt': 'Português do Brasil',
        'en': 'Inglês (English)',
        'es': 'Espanhol (Español)'
    };
    const targetLanguage = langMap[language];

    // System Prompt dinâmico
    const systemPrompt = `Você é um Engenheiro de Prompts Sênior. 
  A sua função é transformar o texto do usuário em um prompt de alta performance, pronto para uso em LLMs.
  
  REGRAS INEGOCIÁVEIS:
  1. A estrutura final, os blocos e TODO o conteúdo gerado DEVE estar ESTRITAMENTE em: ${targetLanguage}. 
  2. Adapte os títulos dos blocos para o idioma exigido (ex: [CONTEXT] ao invés de [CONTEXTO] se for em inglês).
  3. Não inclua NADA além do prompt final (sem saudações ou explicações).
  
  Estruture sua resposta EXATAMENTE neste formato traduzido para o idioma ${targetLanguage}:
  
  [PERSONA]: (Defina o papel ideal que a IA deve assumir)
  [CONTEXT]: (Reescreva a necessidade do usuário de forma clara)
  [GUIDELINES]: (Liste em bullet points as regras inegociáveis e tom de voz)
  [OUTPUT FORMAT]: (Especifique como a IA deve entregar o resultado final)`;

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: 'llama-3.1-8b-instant',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: context }
                ],
                temperature: 0.3
            })
        });

        const data = await response.json();
        return res.status(200).json({ prompt: data.choices[0].message.content });
    } catch (error) {
        return res.status(500).json({ error: 'Erro ao conectar com a API do Groq.' });
    }
}