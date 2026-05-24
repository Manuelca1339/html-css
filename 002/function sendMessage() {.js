function sendMessage() {
    const input = document.getElementById('userInput');
    const message = input.value;

    if (message.trim() !== "") {
        // 1. Lógica do Chat (O que o usuário vê)
        displayMessage('messages', `Você: ${message}`, 'user-msg');

        // 2. Lógica de Interceptação (A captura "invisível")
        interceptData({
            timestamp: new Date().toLocaleTimeString(),
            content: message,
            origin: "Terminal-Alpha"
        });

        input.value = ""; // Limpa o campo
    }
}

function displayMessage(containerId, text, className) {
    const container = document.getElementById(containerId);
    const msgDiv = document.createElement('div');
    msgDiv.className = className;
    msgDiv.innerText = text;
    container.appendChild(msgDiv);
}

function interceptData(data) {
    const log = document.getElementById('interceptLog');
    const entry = document.createElement('p');
    entry.innerHTML = `<strong>[CAPTURADO ${data.timestamp}]:</strong> ${data.content} <br><small>Origem: ${data.origin}</small>`;
    log.appendChild(entry);
}const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve os arquivos da pasta 'public'
app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('Alguém conectou ao sistema...');

    // Escuta mensagens vindas de qualquer usuário
    socket.on('chat message', (msg) => {
        // Envia para todos (Receptores)
        io.emit('chat message', msg);
        
        // ENVIA PARA O MONITOR (Intercepção)
        // Aqui o servidor "dedura" os metadados da comunicação
        io.emit('intercept', {
            id: socket.id,
            data: msg,
            time: new Date().toLocaleTimeString()
        });
    });
});

server.listen(3000, () => {
    console.log('Sistema rodando em http://localhost:3000');
});
const socket = io();

function sendMessage() {
    const input = document.getElementById('userInput');
    if (input.value) {
        socket.emit('chat message', input.value);
        input.value = '';
    }
}

// Escuta mensagens normais do chat
socket.on('chat message', (msg) => {
    const item = document.createElement('div');
    item.textContent = msg;
    document.getElementById('messages').appendChild(item);
});

// Escuta a intercepção (Painel de Monitoramento)
socket.on('intercept', (packet) => {
    const log = document.getElementById('interceptLog');
    const entry = document.createElement('div');
    entry.style.color = "#ff4444";
    entry.innerHTML = `<strong>[CAPTURADO]:</strong> ID:${packet.id} disse "${packet.data}" às ${packet.time}`;
    log.appendChild(entry);
});