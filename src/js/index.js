document.addEventListener('DOMContentLoaded', () => {
    const pessoasTableBody = document.getElementById('pessoasTableBody');
    const obsModal = document.getElementById('obsModal');
    const obsHistory = document.getElementById('obsHistory');
    const obsForm = document.getElementById('obsForm');
    const newObsInput = document.getElementById('newObs');
    const pessoaIdInput = document.getElementById('pessoaId');
    const newDateInput = document.getElementById('newDate');
    const newEntradaInput = document.getElementById('newEntrada');
    const newSaidaInput = document.getElementById('newSaida');

    let pessoas = JSON.parse(localStorage.getItem('pessoas')) || [
        {
            nome: "Angela",
            datas: {
                segunda: { entrada: "13:00", saida: "15:40" },
                quarta: { entrada: "13:00", saida: "15:40" },
            },
            status: "",
            obs: []
        },
    ];

    function savePessoas() {
        localStorage.setItem('pessoas', JSON.stringify(pessoas));
    }

    // Função para verificar horas trabalhadas
    function verificarHoras(entrada, saida, totalHoras) {
        const [entradaHora, entradaMinuto] = entrada.split(':').map(Number);
        const [saidaHora, saidaMinuto] = saida.split(':').map(Number);

        const minutosEntrada = (entradaHora * 60) + entradaMinuto;
        const minutosSaida = (saidaHora * 60) + saidaMinuto;
        const totalMinutosTrabalhados = minutosSaida - minutosEntrada;

        const totalHorasEmMinutos = totalHoras * 60;

        return totalMinutosTrabalhados - totalHorasEmMinutos;
    }

    // Cálculo de horas extras
    function verificarStatus(pessoa) {
        let minutosTrabalhadosTotal = 0;
        const metaMinutos = 2 * 60 + 40; // 2h40min em minutos
    
        // Verifique cada dia de trabalho
        for (const dia in pessoa.datas) {
            const entrada = pessoa.datas[dia].entrada;
            const saida = pessoa.datas[dia].saida;
    
            // Verifique se a entrada e a saída são válidas
            if (entrada && saida) {
                const diferenca = verificarHoras(entrada, saida, 2 + 40/60); // 2h40min em horas decimais
    
                // Acumula a diferença de minutos trabalhados
                minutosTrabalhadosTotal += diferenca;
            }
        }
    
        // Depuração: Log para verificar a quantidade de minutos calculada
        console.log(`Minutos trabalhados totais: ${minutosTrabalhadosTotal}`);
        
        // Verificamos se há horas extras ou faltantes
        if (minutosTrabalhadosTotal === 0) {
            pessoa.status = "Hora cumprida";
        } else if (minutosTrabalhadosTotal > 0) {
            pessoa.status = `Horas extras: ${Math.floor(minutosTrabalhadosTotal / 60)}h${minutosTrabalhadosTotal % 60}min`;
        } else {
            const horasFaltantes = Math.abs(minutosTrabalhadosTotal);
            pessoa.status = `Faltando: ${Math.floor(horasFaltantes / 60)}h${horasFaltantes % 60}min`;
        }
    }

   // Atualiza a tabela
function loadPessoas() {
    pessoasTableBody.innerHTML = ''; // Limpa a tabela
    pessoas.forEach((pessoa, index) => {
        verificarStatus(pessoa); // Atualiza o status de horas extras
        const tr = document.createElement('tr');

        // Separar os dias da semana das datas numéricas
        const dias = Object.keys(pessoa.datas)
            .filter(dia => isNaN(Date.parse(dia))) // Filtra apenas os dias da semana
            .join(', ');

        const primeiroDia = Object.keys(pessoa.datas)[0];
        const entrada = pessoa.datas[primeiroDia].entrada;
        const saida = pessoa.datas[primeiroDia].saida;

        tr.innerHTML = `
            <td>${pessoa.nome}</td>
            <td>${dias}</td>
            <td>${entrada}</td>
            <td>${saida}</td>
            <td>${pessoa.status}</td>
            <td><button class="open-modal-btn" data-pessoa-id="${index}">Ver Observações</button></td>
        `;
        pessoasTableBody.appendChild(tr);
    });
}

    // Função para abrir o modal e exibir observações
    function openModal(pessoaId) {
        pessoaIdInput.value = pessoaId;
        obsHistory.innerHTML = '';
        const observacoes = pessoas[pessoaId].obs;
        observacoes.forEach((obs, obsIndex) => {
            const p = document.createElement('p');
            p.textContent = `${obs.texto} (Salvo em: ${obs.data}) `;
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Excluir';
            deleteButton.onclick = () => deleteObservacao(pessoaId, obsIndex);
            p.appendChild(deleteButton);
            obsHistory.appendChild(p);
        });
        obsModal.style.display = 'block';
    }

    // Fechar o modal
    function closeModal() {
        obsModal.style.display = 'none';
    }

    document.querySelector('.close-btn').addEventListener('click', closeModal);

    // Ação ao clicar fora do modal
    window.onclick = (event) => {
        if (event.target == obsModal) {
            closeModal();
        }
    };

    // Adicionar nova observação
    obsForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const novaObs = newObsInput.value;
        const novaData = newDateInput.value;
        const novaEntrada = newEntradaInput.value;
        const novaSaida = newSaidaInput.value;

        if (novaObs && novaData && novaEntrada && novaSaida) {
            const pessoaId = pessoaIdInput.value;
            const [ano, mes, dia] = novaData.split('-'); // Pegando a data do input
            const dataFormatada = `${dia}/${mes}/${ano}`; // Convertendo para DD/MM/AAAA
            

            // Salvar os horários e atualizar status
            if (!pessoas[pessoaId].datas[novaData]) {
                pessoas[pessoaId].datas[novaData] = {};
            }
            pessoas[pessoaId].datas[novaData].entrada = novaEntrada;
            pessoas[pessoaId].datas[novaData].saida = novaSaida;

            verificarStatus(pessoas[pessoaId]); // Recalcular status após a mudança

            // Salvar a observação
            pessoas[pessoaId].obs.push({ texto: novaObs, data: dataAtual });
            savePessoas();

            const p = document.createElement('p');
            p.textContent = `${novaObs} (Salvo em: ${dataAtual})`;
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Excluir';
            deleteButton.onclick = () => deleteObservacao(pessoaId, pessoas[pessoaId].obs.length - 1);
            p.appendChild(deleteButton);
            obsHistory.appendChild(p);

            // Limpar campos do formulário
            newObsInput.value = '';
            newDateInput.value = '';
            newEntradaInput.value = '';
            newSaidaInput.value = '';
            loadPessoas();
        }
    });

    // Deletar uma observação
    function deleteObservacao(pessoaId, obsIndex) {
        pessoas[pessoaId].obs.splice(obsIndex, 1);
        savePessoas();
        openModal(pessoaId);
    }

    document.addEventListener('click', (event) => {
        if (event.target.classList.contains('open-modal-btn')) {
            const pessoaId = event.target.getAttribute('data-pessoa-id');
            openModal(pessoaId);
        }
    });

    window.onclick = (event) => {
        if (event.target == obsModal) {
            closeModal();
        }
    };

    loadPessoas();
});

const pessoaId = pessoaIdInput.value;
const dataAtual = new Date().toLocaleDateString('pt-BR');

const novaObservacao = {
    texto: `${novaObs} (Entrada: ${novaEntrada}, Saída: ${novaSaida})`,
    data: dataAtual
};

pessoas[pessoaId].obs.push(novaObservacao);
savePessoas();