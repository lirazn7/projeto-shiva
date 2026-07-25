document.addEventListener('DOMContentLoaded', () => {
    // 1. MAPEAMENTO DOS ELEMENTOS DA TELA
    const personaInput = document.getElementById('persona');
    const contextoInput = document.getElementById('contexto');
    const formatoInput = document.getElementById('formato');
    const categoriaSelect = document.getElementById('categoria');
    const outputBox = document.getElementById('output-prompt');

    const btnGerar = document.getElementById('btn-gerar');
    const btnCopiar = document.getElementById('btn-copiar');
    const btnSalvar = document.getElementById('btn-salvar');
    const favoritesList = document.getElementById('favorites-list');

    // 2. DISPARO DO BOTÃO GERAR PROMPT
    btnGerar.addEventListener('click', async () => {
        const persona = personaInput.value.trim() || 'Especialista no assunto';
        const contexto = contextoInput.value.trim() || 'Nenhum contexto específico informado.';
        const formato = formatoInput.value.trim() || 'Texto claro e estruturado.';
        const categoria = categoriaSelect.value;

        // Estrutura o prompt bruto no cliente antes de mandar para a otimização
        let promptBase = `[PERSONA]: Atue como um(a) ${persona}.\n\n`;
        promptBase += `[CONTEXTO & TAREFA]:\n${contexto}\n\n`;
        promptBase += `[REGRAS E DIRETRIZES]:\n`;
        promptBase += `- Categoria de aplicação: ${categoria.toUpperCase()}\n`;
        promptBase += `- Pense passo a passo antes de responder.\n`;
        promptBase += `- Seja direto ao ponto, evitando introduções desnecessárias.\n\n`;
        promptBase += `[FORMATO DE SAÍDA ESPERADO]:\nEntregue o resultado estritamente no seguinte formato: ${formato}`;

        // Estado de carregamento na tela
        outputBox.innerText = "⚡ Processando otimização com Groq Llama-3 (Serverless)...";

        try {
            // Chama a Serverless Function que lê o .env
            const promptOtimizado = await turbinarComGroq(promptBase);
            outputBox.innerText = promptOtimizado;
        } catch (err) {
            console.error('Erro na requisição:', err);
            // Fallback: se a API falhar ou estiver offline, exibe ao menos o modelo estruturado base
            outputBox.innerText = promptBase + "\n\n(Nota: Não foi possível conectar ao Groq no momento. Exibindo estrutura base gerada nativamente).";
        }
    });

    // 3. CHAMADA PARA A NOSSA API INTERNA (QUE LE O .ENV)
    async function turbinarComGroq(promptBruto) {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ promptBruto })
        });

        if (!response.ok) {
            throw new Error(`Erro na rota da API: ${response.status}`);
        }

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error);
        }

        return data.resultado;
    }

    // 4. COPIAR PARA A ÁREA DE TRANSFERÊNCIA (API NATIVA DA WEB)
    btnCopiar.addEventListener('click', () => {
        const texto = outputBox.innerText;

        if (!texto || texto.startsWith('Preencha os campos') || texto.startsWith('⚡ Processando')) {
            return;
        }

        navigator.clipboard.writeText(texto).then(() => {
            const textOriginal = btnCopiar.innerText;
            btnCopiar.innerText = '✅ Copiado!';
            setTimeout(() => {
                btnCopiar.innerText = textOriginal;
            }, 2000);
        });
    });

    // 5. SISTEMA DE FAVORITOS (LOCALSTORAGE - DADOS NO COMPONENTES DO USUÁRIO)
    btnSalvar.addEventListener('click', () => {
        const texto = outputBox.innerText;

        if (!texto || texto.startsWith('Preencha os campos') || texto.startsWith('⚡ Processando')) {
            return;
        }

        let salvos = JSON.parse(localStorage.getItem('fav_prompts') || '[]');

        // Evita duplicatas
        if (!salvos.includes(texto)) {
            salvos.push(texto);
            localStorage.setItem('fav_prompts', JSON.stringify(salvos));
            renderFavorites();
        }
    });

    function renderFavorites() {
        let salvos = JSON.parse(localStorage.getItem('fav_prompts') || '[]');

        if (salvos.length === 0) {
            favoritesList.innerHTML = '<p class="empty-msg">Nenhum prompt salvo ainda.</p>';
            return;
        }

        favoritesList.innerHTML = '';

        salvos.forEach((prompt, index) => {
            const card = document.createElement('div');
            card.className = 'fav-card';

            // Exibe uma prévia do texto
            const preview = document.createElement('p');
            preview.innerText = prompt.length > 120 ? prompt.substring(0, 120) + '...' : prompt;
            card.appendChild(preview);

            // Botão de deletar do LocalStorage
            const btnDel = document.createElement('button');
            btnDel.innerText = '❌';
            btnDel.title = 'Remover dos favoritos';
            btnDel.onclick = () => {
                salvos.splice(index, 1);
                localStorage.setItem('fav_prompts', JSON.stringify(salvos));
                renderFavorites();
            };

            card.appendChild(btnDel);
            favoritesList.appendChild(card);
        });
    }

    // Carrega os favoritos salvos assim que a página abre
    renderFavorites();
});