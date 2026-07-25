export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

    const { context } = req.body;
    const API_KEY = process.env.GROQ_API_KEY;

    if (!API_KEY) {
        return res.status(500).json({ error: 'Chave da API do Groq não configurada no servidor.' });
    }

    if (!context) {
        return res.status(400).json({ error: 'O contexto é obrigatório.' });
    }

    // O System Prompt é o segredo aqui. Ele força a IA a entregar a resposta estruturada.
    const systemPrompt = `Você é um Engenheiro de Prompts Sênior. O usuário enviará um texto solto, uma necessidade ou uma ideia.
  Sua ÚNICA função é transformar esse desejo em um prompt de alta performance, estruturado e pronto para uso em qualquer LLM.
  
  Obrigatório estruturar a sua resposta EXATAMENTE neste formato (e não inclua NADA além do prompt, sem saudações ou explicações):
  
  [PERSONA]: (Defina o papel ideal que a IA deve assumir, ex: Copywriter Especialista, Desenvolvedor Sênior)
  [CONTEXTO]: (Reescreva a necessidade do usuário de forma analítica e clara)
  [DIRETRIZES TÉCNICAS]: (Liste em bullet points as regras inegociáveis, tom de voz e restrições)
  [FORMATO DE SAÍDA]: (Especifique exatamente como a IA final deve entregar o resultado)`;

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
                temperature: 0.3 // Temperatura baixa para garantir que a IA siga o formato à risca
            })
        });

        const data = await response.json();
        return res.status(200).json({ prompt: data.choices[0].message.content });
    } catch (error) {
        return res.status(500).json({ error: 'Erro ao conectar com a API do Groq.' });
    }
}