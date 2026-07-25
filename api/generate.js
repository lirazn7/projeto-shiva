export default async function handler(req, res) {
    // Configuração de CORS para permitir requisições do seu próprio site
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

    const { promptBruto } = req.body;
    const API_KEY = process.env.GROQ_API_KEY;

    if (!API_KEY) {
        return res.status(500).json({ error: 'Chave da API do Groq não configurada no servidor.' });
    }

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
                    {
                        role: 'system',
                        content: 'Você é um Engenheiro de Prompts Sênior. Reinscreva e otimize o prompt fornecido pelo usuário para que ele extraia o máximo desempenho de qualquer modelo de IA. Retorne APENAS o prompt otimizado final, sem saudações ou conversas.'
                    },
                    { role: 'user', content: promptBruto }
                ],
                temperature: 0.5
            })
        });

        const data = await response.json();
        return res.status(200).json({ resultado: data.choices[0].message.content });
    } catch (error) {
        return res.status(500).json({ error: 'Erro ao conectar com a API do Groq.' });
    }
}