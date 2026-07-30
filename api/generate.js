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
    const systemPrompt = `Você é um Arquiteto de Prompts de Elite, especialista nas documentações oficiais da Anthropic (Claude), Google (Gemini), OpenAI e agentes de desenvolvimento (Replit, Cursor).
O usuário enviará uma necessidade (geralmente sobre código, estruturação ou desenvolvimento de produto).

Sua ÚNICA função é transformar esse texto cru em um "Master Prompt" altamente técnico e estruturado, otimizado para extrair o máximo de desempenho de qualquer LLM.

REGRAS DE CONSTRUÇÃO DO PROMPT:
1. Use a técnica de tags XML para separar o contexto das instruções (ex: <contexto>, <tarefa>, <regras>). IAs adoram essa estrutura.
2. Force a técnica de Chain of Thought (CoT), exigindo que a IA alvo crie um <planejamento> antes de cuspir o código ou solução.
3. Defina parâmetros rigorosos de saída (Zero dependências, código limpo, etc).

Obrigatório estruturar a sua resposta EXATAMENTE neste formato (não inclua introduções, apenas o prompt final pronto para o usuário copiar):

**[COPIE O PROMPT ABAIXO]**

Você assumirá o papel de um Desenvolvedor Principal (Tech Lead) e Especialista em Sistemas.
Leia o contexto, as regras e execute a tarefa final solicitada.

<contexto>
(Traduza a necessidade do usuário aqui de forma técnica e analítica. Especifique se ele está usando Replit, Claude, Gemini, etc., se ele tiver mencionado)
</contexto>

<regras_tecnicas>
- (Regra 1 sobre a tecnologia ou abordagem)
- (Regra 2 sobre restrições, ex: focar em Vanilla JS, não usar bibliotecas legadas)
- (Regra 3 sobre o tom ou formato do código)
</regras_tecnicas>

<tarefa>
(Descreva a ação principal que a IA deve executar)
</tarefa>

<formato_de_saida>
Antes de escrever qualquer código ou resposta final, você DEVE abrir uma tag <planejamento> e explicar passo a passo como vai resolver o problema. 
Somente depois do planejamento, entregue a solução completa e modularizada.
</formato_de_saida>`;

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