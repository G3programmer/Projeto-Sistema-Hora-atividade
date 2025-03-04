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

    function verificarHoras(entrada, saida) {
        let [h1, m1] = entrada.split(":").map(Number);
        let [h2, m2] = saida.split(":").map(Number);

        let dataEntrada = new Date(0, 0, 0, h1, m1);
        let dataSaida = new Date(0, 0, 0, h2, m2);

        let diffMinutos = (dataSaida - dataEntrada) / 60000;
        
        return diffMinutos;
    }

    function verificarStatus(pessoa) {
        let minutosTrabalhadosTotal = 0;
        const metaMinutos = 2 * 60 + 40;

        // Agora, vamos calcular as horas com base nas observações
        pessoa.obs.forEach(obs => {
            const novaEntrada = obs.entrada;
            const novaSaida = obs.saida;
            
            if (novaEntrada && novaSaida) {
                let diffMinutos = verificarHoras(novaEntrada, novaSaida);
                minutosTrabalhadosTotal += diffMinutos;
            }
        });

        // Zerar status e horas ao carregar
        if (minutosTrabalhadosTotal === 0) {
            pessoa.status = "Nenhum horário registrado";
        } else {
            const diferencaMinutos = minutosTrabalhadosTotal - metaMinutos;
            
            if (diferencaMinutos === 0) {
                pessoa.status = `Hora cumprida (Total: ${Math.floor(minutosTrabalhadosTotal / 60)}h${minutosTrabalhadosTotal % 60}min)`;
            } else if (diferencaMinutos > 0) {
                pessoa.status = `Horas extras: ${Math.floor(diferencaMinutos / 60)}h${diferencaMinutos % 60}min (Total: ${Math.floor(minutosTrabalhadosTotal / 60)}h${minutosTrabalhadosTotal % 60}min)`;
            } else {
                const horasFaltantes = Math.abs(diferencaMinutos);
                pessoa.status = `Faltando: ${Math.floor(horasFaltantes / 60)}h${horasFaltantes % 60}min (Total: ${Math.floor(minutosTrabalhadosTotal / 60)}h${minutosTrabalhadosTotal % 60}min)`;
            }
        }
    }

    function loadPessoas() {
        pessoasTableBody.innerHTML = '';
        pessoas.forEach((pessoa, index) => {
            verificarStatus(pessoa);
            const tr = document.createElement('tr');
            
            const dias = Object.keys(pessoa.datas)
                .filter(dia => isNaN(Date.parse(dia)))
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

    function openModal(pessoaId) {
        pessoaIdInput.value = pessoaId;
        obsHistory.innerHTML = '';
        const observacoes = pessoas[pessoaId].obs;
        observacoes.forEach((obs, obsIndex) => {
            const p = document.createElement('p');
            p.textContent = `${obs.texto} (Salvo em: ${obs.data}) `;

            // Agora, também mostraremos as horas calculadas nas observações
            const diffHoras = verificarHoras(obs.entrada, obs.saida);
            p.textContent += ` | Horas: ${Math.floor(diffHoras / 60)}h ${diffHoras % 60}min`;

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Excluir';
            deleteButton.onclick = () => deleteObservacao(pessoaId, obsIndex);
            p.appendChild(deleteButton);
            obsHistory.appendChild(p);
        });
        obsModal.style.display = 'block';
    }

    function closeModal() {
        obsModal.style.display = 'none';
    }

    document.querySelector('.close-btn').addEventListener('click', closeModal);
    window.onclick = (event) => {
        if (event.target == obsModal) {
            closeModal();
        }
    };

    obsForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const novaObs = newObsInput.value;
        const novaData = newDateInput.value;
        const novaEntrada = newEntradaInput.value;
        const novaSaida = newSaidaInput.value;

        if (novaObs && novaData && novaEntrada && novaSaida) {
            const pessoaId = pessoaIdInput.value;
            const dataAtual = new Date().toLocaleDateString('pt-BR');
            const diffMinutos = verificarHoras(novaEntrada, novaSaida);
            
            // Adiciona a observação com os horários
            pessoas[pessoaId].obs.push({ 
                texto: novaObs, 
                data: dataAtual, 
                entrada: novaEntrada, 
                saida: novaSaida,
                minutosTrabalhados: diffMinutos
            });
            
            // Atualiza o status com o total de horas
            verificarStatus(pessoas[pessoaId]);
            savePessoas();

            const p = document.createElement('p');
            p.textContent = `${novaObs} (${novaData}) - Total do dia: ${Math.floor(diffMinutos / 60)}h${diffMinutos % 60}min`;
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Excluir';
            deleteButton.onclick = () => deleteObservacao(pessoaId, pessoas[pessoaId].obs.length - 1);
            p.appendChild(deleteButton);
            obsHistory.appendChild(p);

            // Limpa os campos
            newObsInput.value = '';
            newDateInput.value = '';
            newEntradaInput.value = '';
            newSaidaInput.value = '';
            
            // Atualiza a visualização
            loadPessoas();
            openModal(pessoaId);
        }
    });

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

    loadPessoas();
});