let graficoEspectro;
let alvoAtivoId = null;
let socket;

window.addEventListener('DOMContentLoaded', () => {
    inicializarGrafico();
    conectarAoServidorCore();
});

function inicializarGrafico() {
    const ctx = document.getElementById('spectrogramChart').getContext('2d');
    graficoEspectro = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Array.from({length: 16}, (_, i) => `${i * 500}Hz`),
            datasets: [{
                data: Array(16).fill(0),
                borderColor: '#06b6d4',
                backgroundColor: 'rgba(6, 182, 212, 0.02)',
                borderWidth: 2,
                pointRadius: 0,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { min: 0, max: 255, grid: { color: '#141d31' } },
                x: { grid: { display: false } }
            },
            plugins: { legend: { display: false } }
        }
    });
}

function conectarAoServidorCore() {
    // Aponta para a porta padrão do servidor de rede estruturado em Java
    socket = new WebSocket('ws://localhost:8888');

    socket.onopen = () => {
        const status = document.getElementById('server-status');
        status.innerText = "CONECTADO";
        status.className = "status-online";
        document.getElementById('transcriptionBox').innerHTML = `<p class="meta">[SISTEMA]: Link estável com o Core Java. Aguardando comando de interceptação...</p>`;
    };

    socket.onclose = () => {
        const status = document.getElementById('server-status');
        status.innerText = "DESCONECTADO";
        status.className = "offline";
        setTimeout(conectarAoServidorCore, 5000); // Tenta reconectar a cada 5 segundos
    };

    socket.onmessage = (event) => {
        const payload = JSON.parse(event.data);

        // Processa telemetria global da infraestrutura
        if (payload.tipo === 'hardware') {
            document.getElementById('cpu-load').innerText = payload.cpu;
            document.getElementById('net-load').innerText = payload.banda;
            return;
        }

        // Processa os pacotes RTP da chamada grampeada em tempo real
        if (alvoAtivoId && payload.alvoId === alvoAtivoId) {
            
            // Atualiza gráfico espectral com as amplitudes numéricas enviadas pelo Java
            if (payload.ondas) {
                graficoEspectro.data.datasets[0].data = payload.ondas;
                graficoEspectro.update('none');
            }

            // Injeta o texto descriptografado/processado pelo servidor
            if (payload.texto) {
                const box = document.getElementById('transcriptionBox');
                const classe = payload.origem === 'Alvo' ? 'msg-alvo' : 'msg-destino';
                box.innerHTML += `<p class="${classe}"><strong>[${payload.origem.toUpperCase()}]:</strong> ${payload.texto}</p>`;
                box.scrollTop = box.scrollHeight;
            }

            // Atualiza metadados do fluxo VoIP
            document.getElementById('meta-codec').innerText = payload.codec;
            document.getElementById('meta-jitter').innerText = payload.jitter;
            document.getElementById('meta-loss').innerText = payload.perda;
            document.getElementById('meta-ping').innerText = payload.latencia;
        }
    };
}

function alternarGrampo(id) {
    if (alvoAtivoId === id) {
        desativarGrampo(id);
        return;
    }

    if (alvoAtivoId !== null) {
        desativarGrampo(alvoAtivoId);
    }

    alvoAtivoId = id;

    // Atualização visual do painel
    const card = document.getElementById(`target-${id}`);
    card.classList.add('Interceptando');
    const btn = card.querySelector('.btn-action');
    btn.innerText = "DESCONECTAR";
    btn.classList.add('active');

    // Envia ordem via WebSocket para o servidor Java começar a clonar os pacotes deste canal
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ comando: "START", alvoId: id }));
    }
}

function desativarGrampo(id) {
    alvoAtivoId = null;

    const card = document.getElementById(`target-${id}`);
    card.classList.remove('Interceptando');
    const btn = card.querySelector('.btn-action');
    btn.innerText = "GRAMPEAR";
    btn.classList.remove('active');

    // Reseta tabelas
    document.getElementById('meta-codec').innerText = "NENHUM";
    document.getElementById('meta-jitter').innerText = "0.0 ms";
    document.getElementById('meta-ping').innerText = "0 ms";
    graficoEspectro.data.datasets[0].data = Array(16).fill(0);
    graficoEspectro.update();

    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ comando: "STOP", alvoId: id }));
    }
    document.getElementById('transcriptionBox').innerHTML = `<p class="meta">[SISTEMA]: Canal de escuta encerrado pelo operador.</p>`;
}
