document.addEventListener('DOMContentLoaded', () => {
    // 1. DICIONÁRIO DE TRADUÇÕES
    const translations = {
        pt: {
            desc: "Descreva o que você precisa. Nossa infraestrutura constrói o prompt perfeito.",
            contextLabel: "Contexto e Objetivo",
            contextPlaceholder: "Ex: Preciso de um post para LinkedIn sobre a importância da liderança humanizada... Quero o resultado em tópicos.",
            generateBtn: "Estruturar Prompt",
            processing: "Processando...",
            outputLabel: "Prompt Otimizado",
            copyBtn: "Copiar Área de Transferência",
            copied: "✓ Copiado",
            outputBox: "O prompt estruturado e otimizado aparecerá aqui.",
            alertEmpty: "Por favor, descreva o contexto e o objetivo do seu prompt.",
            loadingPrompt: "Analisando requisitos e arquitetando a estrutura do prompt...",
            errorPrompt: "Ocorreu um erro de comunicação com o servidor. Verifique a API do Groq."
        },
        en: {
            desc: "Describe what you need. Our infrastructure builds the perfect prompt.",
            contextLabel: "Context and Objective",
            contextPlaceholder: "Ex: I need a LinkedIn post about humanized leadership... I want the results in bullet points.",
            generateBtn: "Structure Prompt",
            processing: "Processing...",
            outputLabel: "Optimized Prompt",
            copyBtn: "Copy to Clipboard",
            copied: "✓ Copied",
            outputBox: "The structured and optimized prompt will appear here.",
            alertEmpty: "Please describe the context and objective of your prompt.",
            loadingPrompt: "Analyzing requirements and architecting prompt structure...",
            errorPrompt: "A communication error occurred with the server. Check the Groq API."
        },
        es: {
            desc: "Describe lo que necesitas. Nuestra infraestructura construye el prompt perfecto.",
            contextLabel: "Contexto y Objetivo",
            contextPlaceholder: "Ej: Necesito un post para LinkedIn sobre el liderazgo humanizado... Quiero el resultado en viñetas.",
            generateBtn: "Estructurar Prompt",
            processing: "Procesando...",
            outputLabel: "Prompt Optimizado",
            copyBtn: "Copiar Portapapeles",
            copied: "✓ Copiado",
            outputBox: "El prompt estructurado y optimizado aparecerá aquí.",
            alertEmpty: "Por favor, describe el contexto y el objetivo de tu prompt.",
            loadingPrompt: "Analizando requisitos y diseñando la estructura del prompt...",
            errorPrompt: "Ocurrió un error de comunicación con el servidor. Verifica la API de Groq."
        }
    };

    const contextInput = document.getElementById('context-input');
    const generateBtn = document.getElementById('generate-btn');
    const promptOutput = document.getElementById('prompt-output');
    const copyBtn = document.getElementById('copy-btn');
    const langSelector = document.getElementById('lang-selector');

    // 2. GERENCIAMENTO DE IDIOMA
    let currentLang = localStorage.getItem('prompt_lang') || 'pt';
    langSelector.value = currentLang;

    function applyLanguage(lang) {
        document.documentElement.lang = lang;
        currentLang = lang;
        localStorage.setItem('prompt_lang', lang);

        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
                el.placeholder = translations[lang][key];
            } else {
                // Só substitui se não tiver um prompt gerado na tela
                if (el.id !== 'prompt-output' || el.innerText === translations['pt']['outputBox'] || el.innerText === translations['en']['outputBox'] || el.innerText === translations['es']['outputBox']) {
                    el.innerText = translations[lang][key];
                }
            }
        });
    }

    langSelector.addEventListener('change', (e) => {
        applyLanguage(e.target.value);
    });

    applyLanguage(currentLang);

    // 3. LÓGICA DE GERAÇÃO (COM ENVIO DE IDIOMA)
    generateBtn.addEventListener('click', async () => {
        const context = contextInput.value.trim();

        if (!context) {
            alert(translations[currentLang].alertEmpty);
            return;
        }

        generateBtn.disabled = true;
        generateBtn.innerText = translations[currentLang].processing;
        promptOutput.innerText = translations[currentLang].loadingPrompt;

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // Envia o idioma atual para o backend saber como traduzir a saída
                body: JSON.stringify({ context, language: currentLang })
            });

            if (!response.ok) throw new Error('Falha no servidor.');

            const data = await response.json();
            promptOutput.innerText = data.prompt;
        } catch (error) {
            console.error(error);
            promptOutput.innerText = translations[currentLang].errorPrompt;
        } finally {
            generateBtn.disabled = false;
            generateBtn.innerText = translations[currentLang].generateBtn;
        }
    });

    // 4. LÓGICA DE CÓPIA
    copyBtn.addEventListener('click', () => {
        const textToCopy = promptOutput.innerText;
        const isPlaceholder = textToCopy === translations[currentLang].outputBox || textToCopy === translations[currentLang].loadingPrompt;

        if (!textToCopy || isPlaceholder) return;

        navigator.clipboard.writeText(textToCopy).then(() => {
            const originalText = translations[currentLang].copyBtn;
            copyBtn.innerText = translations[currentLang].copied;
            setTimeout(() => {
                copyBtn.innerText = originalText;
            }, 2000);
        });
    });
});