from flask import Flask, render_template, request, redirect, url_for
from datetime import datetime, timedelta

# Inicializa o Flask
app = Flask(__name__)

# Valor mínimo de horas: 6h20m
minimal = timedelta(hours=6, minutes=20)

# Classe Pessoa
class Pessoa:
    def __init__(self, id, nome, data, entrada, saida):
        self.id = id
        self.nome = nome
        self.data = data
        self.entrada = entrada
        self.saida = saida
        self.score = self.calcular_score()
        self.status = "Horário correto" if self.score >= minimal else "Individuo(a)"

    def calcular_score(self):
        formato = "%H:%M"
        entrada_dt = datetime.strptime(self.entrada, formato)
        saida_dt = datetime.strptime(self.saida, formato)
        return saida_dt - entrada_dt

# Criação da lista de pessoas fora da função
pessoas = [
    Pessoa(1, "Prof1", "2025-02-25", "08:00", "14:20"),
    Pessoa(2, "Prof2", "2025-02-25", "09:00", "15:30"),
    Pessoa(3, "Prof3", "2025-02-25", "10:00", "13:30")
]

# Rota principal
@app.route('/')
def index():
    return render_template('index.html', pessoas=pessoas)  # Passando a lista para o template

# Rota para salvar o tempo
@app.route('/salvar_tempo', methods=['POST'])
def salvar_tempo():
    nome = request.form['nome']
    data = request.form['data']
    entrada = request.form['entrada']
    saida = request.form['saida']
    
    # Adicionando nova pessoa à lista
    nova_pessoa = Pessoa(len(pessoas) + 1, nome, data, entrada, saida)
    pessoas.append(nova_pessoa)
    
    return redirect(url_for('index'))

if __name__ == '__main__':
    app.run(debug=True)