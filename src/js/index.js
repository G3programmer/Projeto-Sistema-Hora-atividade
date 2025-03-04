document.addEventListener('DOMContentLoaded', () => {
    const pessoasTableBody = document.getElementById('pessoasTableBody');
    const obsModal = document.getElementById('obsModal');
    const obsHistory = document.getElementById('obsHistory');
    const obsForm = document.getElementById('obsForm');
    const newObsInput = document.getElementById('newObs');
    const pessoaIdInput = document.getElementById('pessoaId');
    const newDateInput = document.getElementById('newDate');
    const newTotalHorasInput = document.getElementById('newTotalHoras');

   // Modifique a estrutura inicial de pessoas:
let pessoas = JSON.parse(localStorage.getItem('pessoas')) || [
    {
        nome: "Angela",
        meses: {
            janeiro: { totalHoras: "N/A", obs: [] },
            fevereiro: { totalHoras: "N/A", obs: [] },
            março: { totalHoras: "N/A", obs: [] },
            abril: { totalHoras: "N/A", obs: [] },
            maio: { totalHoras: "N/A", obs: [] },
            junho: { totalHoras: "N/A", obs: [] },
            julho: { totalHoras: "N/A", obs: [] },
            agosto: { totalHoras: "N/A", obs: [] },
            setembro: { totalHoras: "N/A", obs: [] },
            outubro: { totalHoras: "N/A", obs: [] },
            novembro: { totalHoras: "N/A", obs: [] },
            dezembro: { totalHoras: "N/A", obs: [] },
        },
        status: "sem registro"
    },
];

// Modifique a função verificarStatus:
function verificarStatus(pessoa, mes) {
    const totalHoras = pessoa.meses[mes].totalHoras;
    
    if (!totalHoras || totalHoras === "N/A") {
        pessoa.status = "sem registro";
        return;
    }

    if (totalHoras.trim() === "") {
        pessoa.status = "sem registro";
        return;
    }

    const [horas, minutos] = totalHoras.split(/[hmin]+/).map(part => parseInt(part.trim(), 10));
    
    if (isNaN(horas) || isNaN(minutos)) {
        pessoa.status = "sem registro";
        return;
    }

    const totalMinutos = horas * 60 + minutos;
    const metaMinutos = 2 * 60 + 40;

    if (totalMinutos === 0) {
        pessoa.status = "sem registro";
    } else if (totalMinutos === metaMinutos) {
        pessoa.status = "Fechou exato as horas";
    } else if (totalMinutos > metaMinutos) {
        const horasExtras = totalMinutos - metaMinutos;
        pessoa.status = `Horas extras: ${Math.floor(horasExtras / 60)}h${horasExtras % 60}min`;
    } else {
        const horasFaltantes = metaMinutos - totalMinutos;
        pessoa.status = `Deve horas: ${Math.floor(horasFaltantes / 60)}h${horasFaltantes % 60}min`;
    }
}
    

    function loadPessoas() {
        pessoasTableBody.innerHTML = '';
        pessoas.forEach((pessoa, index) => {
            const tr = document.createElement('tr');
            
            const meses = Object.keys(pessoa.meses)
                .map(mes => `<option value="${mes}">${mes}</option>`)
                .join('');

            const selectedMonth = localStorage.getItem(`selectedMonth-${index}`) || Object.keys(pessoa.meses)[0];
            verificarStatus(pessoa, selectedMonth); // Atualiza o status ao carregar
            const totalHoras = pessoa.meses[selectedMonth].totalHoras;

            tr.innerHTML = `
                <td>${pessoa.nome}</td>
                <td>
                    <select class="month-selector" data-pessoa-id="${index}">
                        ${meses}
                    </select>
                </td>
                <td class="status">${pessoa.status}</td>
                <td><button class="open-modal-btn" data-pessoa-id="${index}">Ver Observações</button></td>
            `;
            pessoasTableBody.appendChild(tr);

            // Definir o mês selecionado
            tr.querySelector('.month-selector').value = selectedMonth;
        });

        document.querySelectorAll('.month-selector').forEach(selector => {
            selector.addEventListener('change', (event) => {
                const pessoaId = event.target.getAttribute('data-pessoa-id');
                const selectedMonth = event.target.value;
                const pessoa = pessoas[pessoaId];
                const tr = event.target.closest('tr');
                
                // Atualiza status considerando as observações do mês
                verificarStatus(pessoa, selectedMonth);
                tr.querySelector('.status').textContent = pessoa.status;

                // Salvar o mês selecionado no localStorage
                localStorage.setItem(`selectedMonth-${pessoaId}`, selectedMonth);
            });
        });
    }

    function openModal(pessoaId) {
        pessoaIdInput.value = pessoaId;
        const selectedMonth = document.querySelector(`.month-selector[data-pessoa-id="${pessoaId}"]`).value;
        obsHistory.innerHTML = '';
        const observacoes = pessoas[pessoaId].meses[selectedMonth].obs;
        observacoes.forEach((obs, obsIndex) => {
            const p = document.createElement('p');
            p.textContent = `Observação: ${obs.texto || 'N/A'} - Data: ${obs.data} - Total de Horas: ${obs.totalHoras}`;

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Excluir';
            deleteButton.onclick = () => deleteObservacao(pessoaId, selectedMonth, obsIndex);
            p.appendChild(deleteButton);
            obsHistory.appendChild(p);
        });

        // Deixar o input de total de horas vazio
        newTotalHorasInput.value = '';

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
        const novoTotalHoras = newTotalHorasInput.value;

        if (novaData && novoTotalHoras) {
            const pessoaId = pessoaIdInput.value;
            const selectedMonth = document.querySelector(`.month-selector[data-pessoa-id="${pessoaId}"]`).value;
            const dataAtual = new Date().toLocaleDateString('pt-BR');

            pessoas[pessoaId].meses[selectedMonth].obs.push({ 
                texto: novaObs || 'N/A', 
                data: novaData, 
                totalHoras: novoTotalHoras,
                minutosTrabalhados: 0
            });

            pessoas[pessoaId].meses[selectedMonth].totalHoras = novoTotalHoras;
            
            // Atualiza o status com o total de horas
            verificarStatus(pessoas[pessoaId], selectedMonth);
            savePessoas();

            const p = document.createElement('p');
            p.textContent = `Observação: ${novaObs || 'N/A'} - Data: ${novaData} - Total do dia: ${novoTotalHoras}`;
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Excluir';
            deleteButton.onclick = () => deleteObservacao(pessoaId, selectedMonth, pessoas[pessoaId].meses[selectedMonth].obs.length - 1);
            p.appendChild(deleteButton);
            obsHistory.appendChild(p);

            // Limpa os campos
            newObsInput.value = '';
            newDateInput.value = '';
            newTotalHorasInput.value = '';
            
            // Atualiza a visualização
            loadPessoas();
            openModal(pessoaId);

            // Manter o mês selecionado
            document.querySelector(`.month-selector[data-pessoa-id="${pessoaId}"]`).value = selectedMonth;
        }
    });

    function deleteObservacao(pessoaId, mes, obsIndex) {
        pessoas[pessoaId].meses[mes].obs.splice(obsIndex, 1);
        if (pessoas[pessoaId].meses[mes].obs.length === 0) {
            pessoas[pessoaId].meses[mes].totalHoras = "N/A";
            verificarStatus(pessoas[pessoaId], mes);
        } else {
            verificarStatus(pessoas[pessoaId], mes);
        }
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