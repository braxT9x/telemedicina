# Roteiro da demonstração

Roteiro para apresentar a plataforma de telemedicina aos representantes da
empresa, **no navegador** (computador). Duração estimada: 20 a 25 minutos.

Todos os dados são **fictícios**: nomes, e-mails, CRMs e histórias clínicas
foram inventados. Os e-mails usam o domínio reservado `demo.example.com`, que
não recebe mensagens, e nenhuma notificação é enviada durante a carga dos dados.

## 1. Preparação (antes da reunião)

### Carregar os dados

No servidor, com o tenant já criado (`bootstrap_tenant`):

```bash
cd backend
python3 manage.py seed_demo --schema <schema_do_tenant>
```

Com Docker Compose:

```bash
docker compose exec api python manage.py seed_demo --schema <schema_do_tenant>
```

**Rode o comando de novo no dia da apresentação, até 1 hora antes.** As datas
das consultas são calculadas a partir do momento em que o comando roda: assim a
agenda mostra consultas passadas, de hoje e futuras, e a teleconsulta da Dona
Maria fica disponível para entrar na hora (por 2 horas). O comando pode ser
repetido quantas vezes for preciso, ele não duplica nada.

Consultas futuras e passadas caem sempre em dias úteis. Para apagar os dados
de demonstração depois (usuários, acompanhamentos, motivos e a clínica; as
especialidades e filas ficam):

```bash
python3 manage.py seed_demo --schema <schema_do_tenant> --remove
```

### Contas

Senha de todas as contas: **`Demo@2026`** (pode ser trocada com
`--password` ou com a variável `DEMO_PASSWORD`).

| Papel | Nome | E-mail |
|-------|------|--------|
| Administrador | Administrador Demonstração | `admin@demo.example.com` |
| Médica de família | Dra. Ana Souza | `dra.ana.souza@demo.example.com` |
| Cardiologista | Dr. Ricardo Almeida | `dr.ricardo.almeida@demo.example.com` |
| Dermatologista | Dra. Juliana Costa | `dra.juliana.costa@demo.example.com` |
| Psiquiatra | Dr. Marcos Nogueira | `dr.marcos.nogueira@demo.example.com` |
| Paciente | Maria Aparecida da Silva | `maria.silva@demo.example.com` |
| Paciente | João Pedro Santos | `joao.santos@demo.example.com` |
| Paciente | Fernanda Lima | `fernanda.lima@demo.example.com` |
| Paciente | Carlos Eduardo Pereira | `carlos.pereira@demo.example.com` |
| Paciente | Luíza Ferreira | `luiza.ferreira@demo.example.com` |
| Paciente | Rafael Gomes | `rafael.gomes@demo.example.com` |
| Paciente | Paulo Ribeiro | `paulo.ribeiro@demo.example.com` |
| Paciente | Beatriz Martins | `beatriz.martins@demo.example.com` |

### O que os dados contêm

- 1 clínica: **Clínica Saúde Conectada** (São Paulo, endereço fictício)
- 4 especialidades e 4 filas: Clínica Médica, Cardiologia, Dermatologia, Saúde Mental
- 10 motivos de consulta (rotina, renovação de receita, atestado, check-up cardiológico...)
- Agenda de atendimento de segunda a sexta, das 8h às 18h (almoço 12h-13h), para os 4 médicos
- 9 acompanhamentos (em aberto, encerrados e um com paciente não identificado)
- 11 consultas: passadas, hoje, futuras, online, presenciais, uma cancelada e uma ainda sem confirmação do paciente
- Mensagens de chat e receitas (losartana, metformina, apixabana)

| Paciente | Médico | Situação |
|----------|--------|----------|
| Maria Aparecida da Silva | Dra. Ana | Hipertensão e diabetes. **Teleconsulta agora**, chat e 2 receitas |
| João Pedro Santos | Dra. Ana | Pós-operatório de joelho. Teleconsulta no próximo dia útil, uma consulta cancelada |
| Carlos Eduardo Pereira | Dr. Ricardo | Pré-operatório cardíaco. Teleconsulta hoje às 16h, presencial na semana seguinte |
| Fernanda Lima | Dra. Juliana | Pinta suspeita. Dermatoscopia presencial nos próximos dias, ainda sem confirmação |
| Luíza Ferreira | Dr. Marcos | Ansiedade e insônia. Teleconsulta nos próximos dias |
| Rafael Gomes | Dra. Ana | Entorse de tornozelo. Consulta presencial nos próximos dias |
| Paulo Ribeiro | Dra. Ana | Tosse após gripe. **Encerrado** |
| Beatriz Martins | Dra. Juliana | Dermatite. **Encerrado** |
| Paciente não identificado | Dra. Ana | Encaminhamento recebido por telefone |

### Checklist técnico

- [ ] `seed_demo` rodado há menos de 1 hora
- [ ] Dois navegadores (ou uma janela normal e uma anônima): um para o **médico**, outro para o **paciente**
- [ ] Portal do médico aberto na tela de login, portal do paciente aberto na tela de login
- [ ] Câmera e microfone liberados nos dois navegadores (teste rápido antes)
- [ ] Servidor de vídeo (LiveKit) configurado e testado
- [ ] Som do computador ligado, notificações do sistema desligadas
- [ ] Zoom do navegador em 100% ou 110% para a projeção

## 2. Roteiro

### Abertura (1 min)

> "Vamos ver um dia de trabalho de uma médica de família e de uma paciente
> crônica, do agendamento à teleconsulta, tudo pelo navegador, sem instalar
> nada."

### Parte 1: o portal do médico (6 min)

1. **Login** como `dra.ana.souza@demo.example.com`. Mostrar a tela de login
   com a marca da empresa.
2. **Painel**: próximas consultas (a teleconsulta da Dona Maria aparece em
   destaque com o botão **Entrar agora**) e os acompanhamentos a tratar.
3. **Acompanhamentos**: abas *Agendados*, *A tratar* e *Encerrados*. Mostrar
   que o caso do Paulo Ribeiro está encerrado e fica no histórico.
4. Abrir **Acompanhamento de hipertensão e diabetes** (Maria):
   - descrição e **notas clínicas internas** (só a equipe vê, o paciente não);
   - histórico de consultas: a primeira teleconsulta já realizada e a de hoje;
   - **chat** com a paciente: ela avisou que fez os exames;
   - **receitas**: losartana e metformina.
5. **Agenda**: visão semana, consultas online e presenciais coloridas, e os
   horários de atendimento cadastrados.
6. **Contatos**: lista de pacientes e colegas.

### Parte 2: o portal do paciente (4 min)

No segundo navegador:

1. **Login** como `maria.silva@demo.example.com`.
2. Tela inicial: a **próxima consulta** com o botão para entrar e o
   acompanhamento com o chat.
3. Mandar uma mensagem no chat: *"Doutora, já estou pronta."*
4. Voltar ao navegador do médico e mostrar que a mensagem chegou **em tempo
   real**, sem recarregar a página. Responder.

### Parte 3: a teleconsulta (6 min)

1. No navegador do médico, clicar em **Entrar** na consulta da Maria. Mostrar
   a sala de espera: teste de câmera e microfone.
2. No navegador da paciente, entrar na mesma consulta.
3. Durante a chamada, mostrar:
   - vídeo e áudio;
   - **chat** durante a chamada;
   - **compartilhamento de tela** (por exemplo, mostrar um exame);
   - gravação e transcrição, se estiverem ativadas no servidor.
4. Encerrar a chamada.

### Parte 4: o paciente pede uma consulta (3 min)

1. No navegador do paciente (ainda como Maria, ou como `rafael.gomes@demo.example.com`),
   abrir **Nova solicitação**.
2. Escolher a especialidade **Clínica Médica**, o motivo **Agendar com médica
   de família** e um horário livre da agenda da Dra. Ana.
3. Voltar ao portal do médico e mostrar a nova consulta na agenda.

> Os motivos ligados a uma **fila** (ex.: *Renovação de receita*) caem na fila
> da equipe; os ligados a um **médico** (ex.: *Retorno pós-operatório*) vão
> direto para ele; o motivo *Agendar com médica de família* usa os horários
> livres da agenda.

### Parte 5: administração (3 min, opcional)

1. Login como `admin@demo.example.com` e abrir o painel de administração.
2. Mostrar: usuários, organização (logo, cores, textos da tela de login),
   especialidades, motivos de consulta e filas.
3. Mencionar: mensagens automáticas por e-mail/SMS/WhatsApp, lembretes de
   consulta, integração FHIR, login único (SSO) e criptografia ponta a ponta.

### Encerramento (2 min)

> "Tudo o que vimos roda no navegador, tanto para o médico quanto para o
> paciente, e pode ser personalizado com a marca da empresa."

Abrir para perguntas.

## 3. Plano B

| Problema | O que fazer |
|----------|-------------|
| O botão **Entrar** não aparece na consulta da Maria | O comando foi rodado há mais de 2 horas: rode `seed_demo` de novo e recarregue a página |
| O vídeo não conecta | Mostrar o resto do fluxo (chat em tempo real, agenda) e explicar a chamada com a tela da sala de espera |
| Câmera ou microfone bloqueados | Clicar no cadeado da barra de endereço e liberar a câmera e o microfone |
| Login recusado | Conferir a senha `Demo@2026` (ou a passada em `--password`) e rodar `seed_demo` de novo, ele redefine as senhas |
| Algum dado foi alterado durante um ensaio | Rodar `seed_demo` de novo: os acompanhamentos de demonstração são recriados do zero |
