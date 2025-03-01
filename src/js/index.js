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
    const calendarDiv = document.getElementById('calendar'); // Div do calendário

    // Carregar dados do localStorage
    localStorage.removeItem('pessoas'); // Apaga os dados antigos

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
        {
            nome: "Silvana",
            datas: {
                segunda: { entrada: "13:00", saida: "15:40" },
                terca: { entrada: "13:00", saida: "15:40" },
            },
            status: "",
            obs: [""]
        },
        {
            nome: "Lia",
            datas: {
                segunda: { entrada: "13:00", saida: "15:40" },
                sexta: { entrada: "13:00", saida: "15:40" },
            },
            status: "",
            obs: [""]
        },
        {
            nome: "Katriane",
            datas: {
                segunda: { entrada: "13:00", saida: "15:40" },
                quarta: { entrada: "13:00", saida: "15:40" },
            },
            status: "",
            obs: [""]
        },
        {
            nome: "Pamela",
            datas: {
                segunda: { entrada: "13:00", saida: "15:40" },
                quarta: { entrada: "13:00", saida: "15:40" },
            },
            status: "",
            obs: [""]
        },
        {
            nome: "Márcia",
            datas: {
                terca: { entrada: "13:00", saida: "15:40" },
                quinta: { entrada: "13:00", saida: "15:40" },
            },
            status: "",
            obs: [""]
        },
        {
            nome: "Monaliza",
            datas: {
                terca: { entrada: "13:00", saida: "15:40" },
                quinta: { entrada: "13:00", saida: "15:40" },
            },
            status: "",
            obs: [""]
        },
        {
            nome: "Daiana",
            datas: {
                terca: { entrada: "13:00", saida: "15:40" },
                quinta: { entrada: "13:00", saida: "15:40" },
            },
            status: "",
            obs: [""]
        },
    ];

    // Função para salvar dados no localStorage
    function savePessoas() {
        localStorage.setItem('pessoas', JSON.stringify(pessoas));
    }

    // Função para verificar status
    function verificarStatus(pessoa) {
        let horasExtras = 0;
        let horasFaltantes = 0;
        const metaMinutos = 2 * 60 + 40; // 2 horas e 40 minutos

        for (const dia in pessoa.datas) {
            const entrada = pessoa.datas[dia].entrada.split(':');
            const saida = pessoa.datas[dia].saida.split(':');
            const entradaMinutos = parseInt(entrada[0]) * 60 + parseInt(entrada[1]);
            const saidaMinutos = parseInt(saida[0]) * 60 + parseInt(saida[1]);
            const minutosTrabalhados = saidaMinutos - entradaMinutos;

            if (minutosTrabalhados > metaMinutos) {
                horasExtras += (minutosTrabalhados - metaMinutos);
            } else if (minutosTrabalhados < metaMinutos) {
                horasFaltantes += (metaMinutos - minutosTrabalhados);
            }
        }

        if (horasFaltantes > 0) {
            pessoa.status = `Individado em ${Math.floor(horasFaltantes / 60)} horas e ${horasFaltantes % 60} minutos`;
        } else if (horasExtras > 0) {
            pessoa.status = `Horas extras: ${Math.floor(horasExtras / 60)} horas e ${horasExtras % 60} minutos`;
        } else {
            pessoa.status = "Meta cumprida";
        }
    }

    // Função para carregar as pessoas na tabela
    function loadPessoas() {
        pessoasTableBody.innerHTML = '';
        pessoas.forEach((pessoa, index) => {
            verificarStatus(pessoa);
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${pessoa.nome}</td>
                <td>${Object.keys(pessoa.datas).join(', ')}</td>
                <td>13:00</td>
                <td>15:40</td>
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
            pessoas[pessoaId].datas[novaData] = { entrada: novaEntrada, saida: novaSaida };
            savePessoas(); // Salvar dados no localStorage
            const p = document.createElement('p');
            p.textContent = novaObs;
            obsHistory.appendChild(p);
            newObsInput.value = ''; // Limpar campo de entrada
            newDateInput.value = ''; // Limpar campo de data
            newEntradaInput.value = ''; // Limpar campo de entrada
            newSaidaInput.value = ''; // Limpar campo de saída
            loadPessoas(); // Recarregar a tabela
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

    function initCalendar() {
        const calendarDiv = document.getElementById('calendar'); // Garantir que o calendário seja renderizado em um div com ID 'calendar'
        
        const events = pessoas.flatMap((pessoa, pessoaIndex) => {
            return Object.keys(pessoa.datas).map(dia => {
                const dataEvento = new Date();
                const dataArray = dia.split('/');
                dataEvento.setFullYear(dataArray[2], dataArray[1] - 1, dataArray[0]);
    
                return {
                    title: pessoa.nome,
                    start: dataEvento,
                    description: pessoa.obs.join(', '),
                    pessoaId: pessoaIndex // Adicionando o ID da pessoa como parte do evento
                };
            });
        });
    
        const calendar = new FullCalendar.Calendar(calendarDiv, {
            initialView: 'dayGridMonth',
            events: events,
            dateClick: function(info) {
                const selectedDate = info.dateStr;
                newDateInput.value = selectedDate;
                
                // Encontrar a pessoa associada à data clicada
                const pessoaIndex = events.find(event => event.start.toISOString().split('T')[0] === selectedDate)?.pessoaId;
                if (pessoaIndex !== undefined) {
                    openModal(pessoaIndex); // Abrir o modal com base no ID da pessoa
                }
            }
        });
    
        calendar.render();
    }
    

    

    // Carregar as pessoas na tabela ao carregar a página
    loadPessoas();
});