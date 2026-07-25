document.addEventListener('DOMContentLoaded', () => {
    const contextInput = document.getElementById('context-input');
    const generateBtn = document.getElementById('generate-btn');
    const promptOutput = document.getElementById('prompt-output');
    const copyBtn = document.getElementById('copy-btn');

    generateBtn.addEventListener('click', async () => {
        const context = contextInput.value.trim();

        if (!context) {
            alert('Por favor, descreva o contexto e o objetivo do seu prompt.');
            return;
        }

        // Estado de carregamento elegante
        generateBtn.disabled = true;
        generateBtn.innerText = 'Processando...';
        promptOutput.innerText = 'Analisando requisitos e arquitetando a estrutura do prompt...';

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ context })
            });

            if (!response.ok) {
                throw new Error('Falha na comunicação com o servidor.');
            }

            const data = await response.json();
            promptOutput.innerText = data.prompt;
        } catch (error) {
            console.error(error);
            promptOutput.innerText = 'Ocorreu um erro de comunicação com o servidor. Verifique a API do Groq.';
        } finally {
            generateBtn.disabled = false;
            generateBtn.innerText = 'Estruturar Prompt';
        }
    });

    copyBtn.addEventListener('click', () => {
        const textToCopy = promptOutput.innerText;

        // Evita copiar mensagens de erro ou carregamento
        if (!textToCopy || textToCopy.startsWith('Analisando') || textToCopy.startsWith('O prompt')) return;

        navigator.clipboard.writeText(textToCopy).then(() => {
            const originalText = copyBtn.innerText;
            copyBtn.innerText = '✓ Copiado';
            setTimeout(() => {
                copyBtn.innerText = originalText;
            }, 2000);
        });
    });
});