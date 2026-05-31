let graficoEspectro;
let alvoAtivo = null;
let audioContext, analyser, microphone, javascriptNode;
let loopTextoInterval;

// Banco de dados interno contendo as streams de dados textuais descriptografados
const bancoDialogos = {
    1: [
        { origem: "Alvo", msg: "O carregamento já está saindo do pátio principal." },
        { origem: "Destino", msg: "Excelente. Mantenha essa linha segura e mude de rota." },
        { origem: "Alvo", msg: "Entendido. Desligando rádio secundário agora." }
    ],
    2: [
        { origem: "Alvo", msg: "Consegui descriptografar o acesso aos servidores." },
        { origem: "Destino", msg: "Qual é o volume total dos logs extraídos?" },
        { origem: "Alvo", msg: "Cerca de 40 Gigabytes de metadados brutos." }
    ]
};

// Inicializa a tela com o gráfico limpo e os timers de hardware de controle
window.addEventListener('DOMContentLoaded', () => {
    const ctx = document.getElementById('spectrogramChart').getContext('2d');
    
    graficoEspectro = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Array.from({length: 32}, (_, i) => `${i * 250}Hz`),
            datasets: [{
                label: 'Frequência Digital',
                data: Array(32).fill(0),
                borderColor: '#06b6d4',
                backgroundColor: 'rgba(6, 182, 212, 0.05)',
                borderWidth: 2,
                pointRadius: 0,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { min: 0, max: 255, grid: { color: '#1e293b' }, ticks: { color: '#64748b' } },
                x: { grid: { display: false }, ticks: { color: '#64748b' } }
            },
            plugins: { legend: { display: false } }
        }
    });

    // Loop de monitoramento de recursos internos da aplicação (Simulado)
    setInterval(() => {
        document.getElementById('cpu-load').innerText = Math.floor(Math.random() * 8 + 4) + "%";
        if (alvoAtivo) {
            document.getElementById('net-load').innerText = (Math.random() * 1.2 + 2.4).toFixed(2) + " Mbps";
        } else {
            document.getElementById('net-load').innerText = "0.00 Mbps";
        }
    }, 1500);
});

// Mecanismo de ativação e tratamento dos eventos dos botões "INTERCEPTAR"
async function alternarInterceptacao(id, numero) {
    // Se clicar no alvo já ativo, corta o sinal
    if (alvoAtivo === id) {
        pararSistemaEscuta(id);
        return;
    }

    // Se houver outro alvo tocando, desliga-o antes de ligar o novo
    if (alvoAtivo !== null) {
        pararSistemaEscuta(alvoAtivo);
    }

    alvoAtivo = id;

    // Modifica os estados das classes CSS e botões em tempo real
    const card = document.getElementById(`target-${id}`);
    card.classList.add('Interceptando');
    const btn = card.querySelector('.btn-action');
    btn.innerText = "DESCONECTAR";
    btn.classList.add('active');

    document.getElementById('transcriptionBox').innerHTML = `<p class="meta">[SISTEMA]: Conectando ao canal de áudio de ${numero}...</p>`;
    
    // Injeta dados técnicos nas tabelas de telemetria
    document.getElementById('meta-codec').innerText = id === 1 ? "G.711 PCMA" : "OPUS voice";
    document.getElementById('meta-loss').innerText = "0.00%";

    // Inicialização da API Web Audio nativa para capturar som e modular dados
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        microphone = audioContext.createMediaStreamSource(stream);
        javascriptNode = audioContext.createScriptProcessor(256, 1, 1);

        analyser.smoothingTimeConstant = 0.5;
        analyser.fftSize = 64; // Segmenta o espectro em 32 faixas coletoras

        microphone.connect(analyser);
        analyser.connect(javascriptNode);
        javascriptNode.connect(audioContext.destination);

        // Atualiza o gráfico fisicamente usando o áudio capturado no ambiente
        javascriptNode.onaudioprocess = () => {
            const arrayFrequencias = new Uint8Array(analyser.frequencyBinCount);
            analyser.getByteFrequencyData(arrayFrequencias);
            
            graficoEspectro.data.datasets[0].data = Array.from(arrayFrequencias);
            graficoEspectro.update('none'); // Renderização rápida de alto desempenho

            // Altera dinamicamente os valores de latência e jitter na interface
            document.getElementById('meta-jitter').innerText = (Math.random() * 1.8).toFixed(1) + " ms";
            document.getElementById('meta-ping').innerText = Math.floor(Math.random() * 6 + 8) + " ms";
        };

        iniciarFluxoTexto(id);

    } catch (err) {
        // Fallback automatizado caso o navegador não possua microfone liberado
        console.warn("Dispositivo de captação não encontrado. Alternando para o gerador sintético.");
        document.getElementById('transcriptionBox').innerHTML += `<p class="meta" style="color:var(--red)">[AVISO]: Microfone não detectado. Iniciando injeção de ruído espectral sintético.</p>`;
        configurarModoSimulado(id);
    }
}

// Desativa todos os loops e limpa as conexões e os objetos de áudio ativos
function pararSistemaEscuta(id) {
    alvoAtivo = null;
    clearInterval(loopTextoInterval);

    if (javascriptNode) {
        javascriptNode.onaudioprocess = null;
        if (microphone) microphone.disconnect();
        if (analyser) analyser.disconnect();
        if (audioContext) audioContext.close();
    }

    // Retorna os botões do painel ao estado original
    const card = document.getElementById(`target-${id}`);
    card.classList.remove('Interceptando');
    const btn = card.querySelector('.btn-action');
    btn.innerText = "INTERCEPTAR";
    btn.classList.remove('active');

    // Reseta toda a tabela de dados numéricos
    document.getElementById('transcriptionBox').innerHTML = `<p class="meta">[SISTEMA]: Canal de monitoramento limpo e fechado.</p>`;
    document.getElementById('meta-codec').innerText = "NENHUM";
    document.getElementById('meta-jitter').innerText = "0.0 ms";
    document.getElementById('meta-loss').innerText = "0.00%";
    document.getElementById('meta-ping').innerText = "0 ms";

    graficoEspectro.data.datasets[0].data = Array(32).fill(0);
    graficoEspectro.update();
}

// Controla o surgimento sequencial das mensagens traduzidas no painel de texto
function iniciarFluxoTexto(id) {
    let index = 0;
    const falas = bancoDialogos[id];
    const box = document.getElementById('transcriptionBox');

    loopTextoInterval = setInterval(() => {
        if (index < falas.length) {
            const item = falas[index];
            const classe = item.origem === 'Alvo' ? 'msg-alvo' : 'msg-destino';
            box.innerHTML += `<p class="${classe}"><strong>[${item.origem.toUpperCase()}]:</strong> ${item.msg}</p>`;
            box.scrollTop = box.scrollHeight;
            index++;
        } else {
            box.innerHTML += `<p class="meta">[SISTEMA]: Fim da transmissão de pacotes de dados de voz.</p>`;
            clearInterval(loopTextoInterval);
        }
    }, 4500);
}

// Motor de alimentação de ondas randômicas contínuas para uso sem microfone
function configurarModoSimulado(id) {
    iniciarFluxoTexto(id);
    loopTextoInterval = setInterval(() => {
        const dadosFalsos = Array.from({length: 32}, () => Math.floor(Math.random() * 120) + 20);
        dadosFalsos[6] = Math.floor(Math.random() * 80) + 160; // Força pico harmônico na frequência vocal
        
        graficoEspectro.data.datasets[0].data = dadosFalsos;
        graficoEspectro.update('none');
        
        document.getElementById('meta-jitter').innerText = (Math.random() * 4).toFixed(1) + " ms";
        document.getElementById('meta-ping').innerText = Math.floor(Math.random() * 20 + 30) + " ms";
    }, 100);
}