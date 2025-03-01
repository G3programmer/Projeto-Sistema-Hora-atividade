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

    // Carregar dados do localStorage
    localStorage.removeItem('pessoas'); // Apaga os dados antigos

    let pessoas = JSON.parse(localStorage.getItem('pessoas')) || [
        {
            nome: "Angela",
            data: "Segunda e quarta",
            entrada: "13:00",
            saida: "15:40",
            horasFeitas: "00:00:00",
            status: "",
            obs: [""]
        },
        {
            nome: "Silvana",
            dias: {
                segunda: { entrada: "13:00", saida: "15:40" },
                terca: { entrada: "14:00", saida: "16:30" },
            },
            horasFeitas: "00:00:00",
            status: "",
            obs: [""]
        },
        {
            nome: "Lia",
            data: "Segunda e sexta",
            entrada: "13:00",
            saida: "14:20",
            horasFeitas: "00:00:00",
            status: "",
            obs: [""]
        },
        {
            nome: "Katriane",
            data: "Segunda e quarta",
            entrada: "13:00",
            saida: "15:40",
            horasFeitas: "00:00:00",
            status: "",
            obs: [""]
        },
        {
            nome: "Pamela",
            data: "Segunda e quarta",
            entrada: "13:00",
            saida: "15:40",
            horasFeitas: "00:00:00",
            status: "",
            obs: [""]
        },
        {
            nome: "Márcia",
            data: "Terça e quinta",
            entrada: "13:00",
            saida: "15:40",
            horasFeitas: "00:00:00",
            status: "",
            obs: [""]
        },
        {
            nome: "Monaliza",
            data: "Terça e quinta",
            entrada: "13:00",
            saida: "15:40",
            horasFeitas: "00:00:00",
            status: "",
            obs: [""]
        },
        {
            nome: "Daiana",
            data: "Terça e quinta",
            entrada: "13:00",
            saida: "15:40",
            horasFeitas: "00:00:00",
            status: "",
            obs: [""]
        },
        

    ];

    // Função para salvar dados no localStorage
    function savePessoas() {
        localStorage.setItem('pessoas', JSON.stringify(pessoas));
    }

    // Função para carregar as pessoas na tabela
    function loadPessoas() {
        pessoasTableBody.innerHTML = '';
        pessoas.forEach((pessoa, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${pessoa.nome}</td>
                <td>${pessoa.data}</td>
                <td>${pessoa.entrada}</td>
                <td>${pessoa.saida}</td>
                <td>${pessoa.horasFeitas}</td>
                <td>${pessoa.status}</td>
                <td><button class="open-modal-btn" data-pessoa-id="${index}">Ver Observações</button></td>
            `;
            pessoasTableBody.appendChild(tr);
        });
    }

    // Função para abrir o modal
    function openModal(pessoaId) {
        pessoaIdInput.value = pessoaId;
        obsHistory.innerHTML = ''; // Limpar histórico anterior
        const observacoes = pessoas[pessoaId].obs;
        observacoes.forEach((obs, obsIndex) => {
            const p = document.createElement('p');
            p.textContent = `${obs} `;
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Excluir';
            deleteButton.onclick = () => deleteObservacao(pessoaId, obsIndex);
            p.appendChild(deleteButton);
            obsHistory.appendChild(p);
        });
        obsModal.style.display = 'block';
    }

    // Função para fechar o modal
    function closeModal() {
        obsModal.style.display = 'none';
    }

    // Adicionar evento de submit ao formulário de observações
    obsForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const novaObs = newObsInput.value;
        const novaData = newDateInput.value;
        const novaEntrada = newEntradaInput.value;
        const novaSaida = newSaidaInput.value;
        if (novaObs && novaData && novaEntrada && novaSaida) {
            const pessoaId = pessoaIdInput.value;
            pessoas[pessoaId].obs.push(novaObs);
            pessoas[pessoaId].data = novaData;
            pessoas[pessoaId].entrada = novaEntrada;
            pessoas[pessoaId].saida = novaSaida;
            savePessoas(); // Salvar dados no localStorage
            const p = document.createElement('p');
            p.textContent = novaObs;
            obsHistory.appendChild(p);
            newObsInput.value = ''; // Limpar campo de entrada
            newDateInput.value = ''; // Limpar campo de data
            newEntradaInput.value = ''; // Limpar campo de entrada
            newSaidaInput.value = ''; // Limpar campo de saída
        }
    });

    // Função para excluir uma observação
    function deleteObservacao(pessoaId, obsIndex) {
        pessoas[pessoaId].obs.splice(obsIndex, 1);
        savePessoas(); // Salvar dados no localStorage
        openModal(pessoaId);
    }

    // Adicionar eventos para abrir o modal
    document.addEventListener('click', (event) => {
        if (event.target.classList.contains('open-modal-btn')) {
            const pessoaId = event.target.getAttribute('data-pessoa-id');
            openModal(pessoaId);
        }
    });

    // Fechar modal ao clicar fora do conteúdo
    window.onclick = (event) => {
        if (event.target == obsModal) {
            closeModal();
        }
    };

    // Carregar as pessoas na tabela ao carregar a página
    loadPessoas();
});