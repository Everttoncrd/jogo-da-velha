document.addEventListener('DOMContentLoaded', () => {
    // Seletores da Tela de Configuração
    const telaConfiguracao = document.getElementById('tela-configuracao');
    const botaoModoPVP = document.getElementById('botao-modo-pvp');
    const botaoModoPVC = document.getElementById('botao-modo-pvc');
    const areaEntradaNomes = document.getElementById('area-entrada-nomes');
    const tituloEntradaNomes = document.getElementById('titulo-entrada-nomes');
    const labelNomeJogadorX = document.getElementById('label-nome-jogador-x');
    const inputNomeJogadorX = document.getElementById('input-nome-jogador-x');
    const containerNomeJogadorO = document.getElementById('container-nome-jogador-o');
    const inputNomeJogadorO = document.getElementById('input-nome-jogador-o');
    const botaoIniciarComNomes = document.getElementById('botao-iniciar-com-nomes');

    // Seletores do Jogo
    const quadroHistoricoElemento = document.getElementById('quadro-historico');
    const conteudoPrincipalJogo = document.getElementById('conteudo-principal-do-jogo');
    const celulas = document.querySelectorAll('.celula');
    const elementoMensagem = document.getElementById('mensagem');
    const botaoReiniciar = document.getElementById('reiniciar');
    const botaoVoltarMenu = document.getElementById('botao-voltar-menu');
    const elementosLinhaVitoria = document.querySelectorAll('.linha-vitoria');
    const listaHistoricoElemento = document.getElementById('lista-historico');

    // Variáveis de estado do jogo
    let jogadorAtual = 'X';
    let tabuleiro = ['', '', '', '', '', '', '', '', ''];
    let jogoAtivo = true;
    let historicoRodadas = [];
    const MAX_HISTORICO = 10;

    let nomeJogadorX = 'Jogador X';
    let nomeJogadorO = 'Jogador O';
    let modoDeJogo = ''; // 'pvp' ou 'pvc'

    const condicoesDeVitoria = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Horizontais
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Verticais
        [0, 4, 8], [2, 4, 6]             // Diagonais
    ];
    
    const idsDasLinhas = [
        'linha-h1', 'linha-h2', 'linha-h3',
        'linha-v1', 'linha-v2', 'linha-v3',
        'linha-d1', 'linha-d2'
    ];

    // --- FUNÇÕES DE MENSAGEM ---
    const mensagemVezJogador = () => `Vez de ${jogadorAtual === 'X' ? nomeJogadorX : nomeJogadorO}`;
    const mensagemVencedor = () => `${jogadorAtual === 'X' ? nomeJogadorX : nomeJogadorO} venceu!`;
    const mensagemEmpate = () => `O jogo empatou!`;
    
    // --- FUNÇÕES DE HISTÓRICO ---
    const renderizarHistorico = () => {
        listaHistoricoElemento.innerHTML = ''; 
        for (let i = historicoRodadas.length - 1; i >= 0; i--) {
            const resultado = historicoRodadas[i];
            const itemLista = document.createElement('li');
            itemLista.textContent = resultado;
            listaHistoricoElemento.appendChild(itemLista);
        }
    };
    
    const adicionarAoHistorico = (resultado) => {
        historicoRodadas.push(resultado);
        if (historicoRodadas.length > MAX_HISTORICO) {
            historicoRodadas.shift(); 
        }
        renderizarHistorico(); 
    };

    // --- FUNÇÕES DE CONFIGURAÇÃO INICIAL ---
    const configurarEntradaNomes = () => {
        areaEntradaNomes.style.display = 'block';
        if (modoDeJogo === 'pvp') {
            tituloEntradaNomes.textContent = 'Insira os Nomes dos Jogadores';
            labelNomeJogadorX.textContent = 'Nome do Jogador X:';
            inputNomeJogadorX.placeholder = 'Nome do Jogador X';
            inputNomeJogadorX.value = ''; 
            containerNomeJogadorO.style.display = 'block'; 
            inputNomeJogadorO.value = ''; 
        } else if (modoDeJogo === 'pvc') {
            tituloEntradaNomes.textContent = 'Insira Seu Nome';
            labelNomeJogadorX.textContent = 'Seu Nome (você será X):';
            inputNomeJogadorX.placeholder = 'Seu Nome';
            inputNomeJogadorX.value = ''; 
            containerNomeJogadorO.style.display = 'none'; 
        }
    };

    // --- FUNÇÕES DE LÓGICA DO JOGO ---
    const marcarCelula = (celulaClicada, indiceCelulaClicada) => {
        if (tabuleiro[indiceCelulaClicada] === '' && jogoAtivo) {
            tabuleiro[indiceCelulaClicada] = jogadorAtual;
            celulaClicada.innerHTML = jogadorAtual;
            celulaClicada.classList.add(jogadorAtual.toLowerCase());
            return true; 
        }
        return false; 
    };

    const mostrarLinhaVencedora = (indiceCondicao) => {
        if (indiceCondicao >= 0 && indiceCondicao < idsDasLinhas.length) {
            const idLinha = idsDasLinhas[indiceCondicao];
            const linhaElemento = document.getElementById(idLinha);
            if (linhaElemento) {
                linhaElemento.classList.add('visivel');
            }
        }
    };

    const esconderTodasAsLinhas = () => {
        elementosLinhaVitoria.forEach(linha => {
            linha.classList.remove('visivel');
        });
    };

    // --- FUNÇÕES DA IA DO COMPUTADOR ---
    const shuffleArray = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };

    const encontrarJogadaEstrategica = (jogadorParaAnalisar) => {
        for (const condicao of condicoesDeVitoria) {
            const celulaA = tabuleiro[condicao[0]];
            const celulaB = tabuleiro[condicao[1]];
            const celulaC = tabuleiro[condicao[2]];

            if (celulaA === jogadorParaAnalisar && celulaB === jogadorParaAnalisar && celulaC === '') return condicao[2];
            if (celulaA === jogadorParaAnalisar && celulaC === jogadorParaAnalisar && celulaB === '') return condicao[1];
            if (celulaB === jogadorParaAnalisar && celulaC === jogadorParaAnalisar && celulaA === '') return condicao[0];
        }
        return -1; 
    };

    const efetuarJogadaComputador = () => {
        if (!jogoAtivo) return;

        let indiceEscolhido = -1;

        indiceEscolhido = encontrarJogadaEstrategica('O'); // Tentar ganhar
        if (indiceEscolhido === -1) {
            indiceEscolhido = encontrarJogadaEstrategica('X'); // Tentar bloquear
        }
        if (indiceEscolhido === -1 && tabuleiro[4] === '') { // Tentar centro
            indiceEscolhido = 4;
        }
        if (indiceEscolhido === -1) { // Tentar cantos
            const cantos = shuffleArray([0, 2, 6, 8]);
            for (const canto of cantos) {
                if (tabuleiro[canto] === '') {
                    indiceEscolhido = canto;
                    break;
                }
            }
        }
        if (indiceEscolhido === -1) { // Tentar laterais
            const laterais = shuffleArray([1, 3, 5, 7]);
            for (const lateral of laterais) {
                if (tabuleiro[lateral] === '') {
                    indiceEscolhido = lateral;
                    break;
                }
            }
        }
        if (indiceEscolhido === -1) { // Fallback para aleatório
            const celulasVaziasIndices = [];
            tabuleiro.forEach((valor, indice) => {
                if (valor === '') celulasVaziasIndices.push(indice);
            });
            if (celulasVaziasIndices.length > 0) {
                indiceEscolhido = celulasVaziasIndices[Math.floor(Math.random() * celulasVaziasIndices.length)];
            }
        }

        if (indiceEscolhido !== -1) {
            const celulaEscolhidaElemento = celulas[indiceEscolhido];
            marcarCelula(celulaEscolhidaElemento, indiceEscolhido);
            verificarResultado();
        }
    };
    
    const trocarJogador = () => {
        jogadorAtual = jogadorAtual === 'X' ? 'O' : 'X';
        elementoMensagem.innerHTML = mensagemVezJogador();

        if (modoDeJogo === 'pvc' && jogadorAtual === 'O' && jogoAtivo) {
            celulas.forEach(celula => celula.style.pointerEvents = 'none');
            setTimeout(() => {
                efetuarJogadaComputador();
                if (jogoAtivo) {
                    celulas.forEach(celula => celula.style.pointerEvents = 'auto');
                }
            }, 700); 
        }
    };

    const verificarResultado = () => {
        let rodadaVencida = false;
        let indiceCondicaoVencedora = -1; 

        for (let i = 0; i < condicoesDeVitoria.length; i++) {
            const condicao = condicoesDeVitoria[i];
            const a = tabuleiro[condicao[0]];
            const b = tabuleiro[condicao[1]];
            const c = tabuleiro[condicao[2]];

            if (a === '' || b === '' || c === '') continue;
            if (a === b && b === c) {
                rodadaVencida = true;
                indiceCondicaoVencedora = i;
                break;
            }
        }

        if (rodadaVencida) {
            const msgVitoria = mensagemVencedor();
            elementoMensagem.innerHTML = msgVitoria;
            jogoAtivo = false;
            mostrarLinhaVencedora(indiceCondicaoVencedora);
            adicionarAoHistorico(msgVitoria);
            celulas.forEach(celula => celula.style.pointerEvents = 'auto'); 
            return; 
        }

        if (!tabuleiro.includes('')) {
            const msgEmpate = mensagemEmpate();
            elementoMensagem.innerHTML = msgEmpate;
            jogoAtivo = false;
            adicionarAoHistorico(msgEmpate);
            celulas.forEach(celula => celula.style.pointerEvents = 'auto'); 
            return; 
        }
        
        trocarJogador();
    };

    const lidarComCliqueNaCelula = (eventoClique) => {
        if (!jogoAtivo) return; 
        if (modoDeJogo === 'pvc' && jogadorAtual === 'O') return;

        const celulaClicada = eventoClique.target;
        const indiceCelulaClicada = parseInt(celulaClicada.getAttribute('data-index'));

        if (marcarCelula(celulaClicada, indiceCelulaClicada)) {
            verificarResultado(); 
        }
    };
    
    const reiniciarJogo = () => {
        jogadorAtual = 'X'; 
        tabuleiro = ['', '', '', '', '', '', '', '', ''];
        jogoAtivo = true;
        celulas.forEach(celula => celula.style.pointerEvents = 'auto'); 
        elementoMensagem.innerHTML = mensagemVezJogador(); 
        esconderTodasAsLinhas(); 

        celulas.forEach(celula => {
            celula.innerHTML = '';
            celula.classList.remove('x');
            celula.classList.remove('o');
        });
    };

    const processarInicioDeJogo = () => {
        if (!modoDeJogo) { 
            alert("Por favor, selecione um modo de jogo.");
            return;
        }

        nomeJogadorX = inputNomeJogadorX.value.trim() || (modoDeJogo === 'pvc' ? 'Você' : 'Jogador X');
        if (modoDeJogo === 'pvp') {
            nomeJogadorO = inputNomeJogadorO.value.trim() || 'Jogador O';
        } else { 
            nomeJogadorO = 'Computador';
        }

        telaConfiguracao.style.display = 'none';
        
        conteudoPrincipalJogo.style.display = ''; 
        if (getComputedStyle(conteudoPrincipalJogo).display === 'none') { // Garante que o estilo do CSS seja aplicado
             conteudoPrincipalJogo.style.display = 'flex';
        }
        quadroHistoricoElemento.style.display = 'block'; 

        reiniciarJogo(); 
        renderizarHistorico(); // Renderiza o histórico (que pode ter sido limpo na seleção de modo)
    };

    const voltarAoMenuInicial = () => {
        conteudoPrincipalJogo.style.display = 'none';
        quadroHistoricoElemento.style.display = 'none';
        esconderTodasAsLinhas();
        telaConfiguracao.style.display = 'flex'; 
        
        // Limpa o estado da UI de configuração para uma nova seleção
        modoDeJogo = ''; 
        botaoModoPVP.classList.remove('selecionado');
        botaoModoPVC.classList.remove('selecionado');
        areaEntradaNomes.style.display = 'none'; 
        inputNomeJogadorX.value = ''; 
        inputNomeJogadorO.value = '';

        jogoAtivo = false; // Impede interações com o jogo "antigo" até nova configuração
        tabuleiro = ['', '', '', '', '', '', '', '', '']; 
        // O histórico não é limpo aqui, pois será limpo ao selecionar um novo modo.
    };

    // --- EVENT LISTENERS ---
    botaoModoPVP.addEventListener('click', () => {
        if (modoDeJogo !== 'pvp') { 
            historicoRodadas = [];
            renderizarHistorico();
        }
        modoDeJogo = 'pvp';
        botaoModoPVP.classList.add('selecionado');
        botaoModoPVC.classList.remove('selecionado');
        configurarEntradaNomes();
    });

    botaoModoPVC.addEventListener('click', () => {
        if (modoDeJogo !== 'pvc') { 
            historicoRodadas = [];
            renderizarHistorico();
        }
        modoDeJogo = 'pvc';
        botaoModoPVC.classList.add('selecionado');
        botaoModoPVP.classList.remove('selecionado');
        configurarEntradaNomes();
    });

    botaoIniciarComNomes.addEventListener('click', processarInicioDeJogo);
    celulas.forEach(celula => celula.addEventListener('click', lidarComCliqueNaCelula));
    botaoReiniciar.addEventListener('click', reiniciarJogo);
    botaoVoltarMenu.addEventListener('click', voltarAoMenuInicial);
});