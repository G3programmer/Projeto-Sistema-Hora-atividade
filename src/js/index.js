document.addEventListener('DOMContentLoaded', () => {
    const pessoasTableBody = document.getElementById('pessoasTableBody');
    const obsModal = document.getElementById('obsModal');
    const obsHistory = document.getElementById('obsHistory');
    const obsForm = document.getElementById('obsForm');
    const newObsInput = document.getElementById('newObs');
    const pessoaIdInput = document.getElementById('pessoaId');
    const newDateInput = document.getElementById('newDate');
    const newTotalHorasInput = document.getElementById('newTotalHoras');

    // Estrutura inicial de pessoas
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

    function savePessoas() {
        localStorage.setItem('pessoas', JSON.stringify(pessoas));
    }

    function verificarStatus(pessoa, mes) {
        const observacoes = pessoa.meses[mes].obs;
        
        if (observacoes.length === 0) {
            pessoa.status = "sem registro";
            return;
        }
    
        let totalMinutos = 0;
    
        observacoes.forEach(obs => {
            let horas = 0;
            let minutos = 0;
            const totalHoras = obs.totalHoras;
    
            if (totalHoras.includes(':')) {
                const [h, m] = totalHoras.split(':').map(num => parseInt(num.trim(), 10));
                horas = h || 0;
                minutos = m || 0;
            } else {
                const partes = totalHoras.toLowerCase().split('h');
                if (partes.length === 2) {
                    horas = parseInt(partes[0], 10);
                    minutos = parseInt(partes[1].replace('min', ''), 10) || 0;
                } else {
                    minutos = parseInt(totalHoras.replace('min', ''), 10) || 0;
                }
            }
    
            if (isNaN(horas)) horas = 0;
            if (isNaN(minutos)) minutos = 0;
    
            totalMinutos += (horas * 60) + minutos;
        });
    
        const metaMinutos = 1280; // 21h20min = 1280 minutos
    
        if (totalMinutos === 0) {
            pessoa.status = "sem registro";
        } else if (totalMinutos === metaMinutos) {
            pessoa.status = "Fechou exato as horas";
        } else if (totalMinutos > metaMinutos) {
            const horasExtras = totalMinutos - metaMinutos;
            const horasExtrasH = Math.floor(horasExtras / 60);
            const minutosExtras = horasExtras % 60;
            
            if (horasExtrasH > 0 && minutosExtras > 0) {
                pessoa.status = `Horas extras: ${horasExtrasH}h${minutosExtras}min`;
            } else if (horasExtrasH > 0) {
                pessoa.status = `Horas extras: ${horasExtrasH}h`;
            } else {
                pessoa.status = `Horas extras: ${minutosExtras}min`;
            }
        } else {
            const horasFaltantes = metaMinutos - totalMinutos;
            const horasFaltantesH = Math.floor(horasFaltantes / 60);
            const minutosFaltantes = horasFaltantes % 60;
            
            if (horasFaltantesH > 0 && minutosFaltantes > 0) {
                pessoa.status = `Deve horas: ${horasFaltantesH}h${minutosFaltantes}min`;
            } else if (horasFaltantesH > 0) {
                pessoa.status = `Deve horas: ${horasFaltantesH}h`;
            } else {
                pessoa.status = `Deve horas: ${minutosFaltantes}min`;
            }
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
            verificarStatus(pessoa, selectedMonth);
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

            tr.querySelector('.month-selector').value = selectedMonth;
        });

        document.querySelectorAll('.month-selector').forEach(selector => {
            selector.addEventListener('change', (event) => {
                const pessoaId = event.target.getAttribute('data-pessoa-id');
                const selectedMonth = event.target.value;
                const pessoa = pessoas[pessoaId];
                const tr = event.target.closest('tr');
                
                verificarStatus(pessoa, selectedMonth);
                tr.querySelector('.status').textContent = pessoa.status;
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
    
            pessoas[pessoaId].meses[selectedMonth].obs.push({ 
                texto: novaObs || 'N/A', 
                data: novaData, 
                totalHoras: novoTotalHoras
            });
    
            pessoas[pessoaId].meses[selectedMonth].totalHoras = novoTotalHoras;
            
            // Atualizar status antes de salvar
            verificarStatus(pessoas[pessoaId], selectedMonth);
            
            savePessoas();
            loadPessoas();
            openModal(pessoaId);
        }
    });
    

    function deleteObservacao(pessoaId, mes, obsIndex) {
        const pessoa = pessoas[pessoaId];
        pessoa.meses[mes].obs.splice(obsIndex, 1);
        
        if (pessoa.meses[mes].obs.length === 0) {
            pessoa.meses[mes].totalHoras = "N/A";
        } else {
            const ultimaObs = pessoa.meses[mes].obs[pessoa.meses[mes].obs.length - 1];
            pessoa.meses[mes].totalHoras = ultimaObs.totalHoras;
        }
    
        verificarStatus(pessoa, mes);
        savePessoas();
        loadPessoas();
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