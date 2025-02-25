from datetime import timedelta

# NÃO MODIFIQUE ISSO
minimal = timedelta(hours=13, minutes=20)

# nomes que vou colocar fixo
# nomes que vou colocar fixo
# nomes que vou colocar fixo
 
# O mínimo de horas é 6h e 20, usar if para análise

#-----Data aqui----#
#var = datetime.datetime.now()
#print("Data e hr atual:", var)

#---POO prof---#
class Pessoa:
    def __init__(self, id, nome, horas, minutos):
        self.id = id
        self.nome = nome
        # Cria o 'score' como um timedelta com base nas horas e minutos
        self.score = timedelta(hours=horas, minutes=minutos)

    def mostrar_dados(self):  # Corrigi a indentação para fora do __init__
        # Verifica se o score é menor que o valor mínimo (6h20m)
        if self.score < minimal:
            status = "Individuo(a)"
        else:
            status = "Horario correto"
        
        print(f"id: {self.id}")
        print(f"Nome: {self.nome}")
        print(f"score: {self.score}")
        print(f"Status: {status}")
        print("---------------------")

# Criando instâncias de Pessoa com 4 argumentos: id, nome, horas e minutos
p1 = Pessoa(1, "Prof1", 20, 20)  # 20 horas e 20 minutos
p2 = Pessoa(2, "Prof2", 15, 30)  # 15 horas e 30 minutos
p3 = Pessoa(3, "Prof3", 3, 30)   # 3 horas e 30 minutos

# Mostrando os dados de cada pessoa
p1.mostrar_dados()
p2.mostrar_dados()
p3.mostrar_dados()

