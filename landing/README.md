# Landing page

Site público da telemedicina (Astro + React). O botão de marcação leva o
paciente para `/new-request` no portal do paciente, já buscando a
especialidade escolhida (Clínica Médica, Cardiologia, Dermatologia ou
Psiquiatria).

```bash
cd landing
npm install
npm run dev
```

O endereço do portal do paciente vem de `PUBLIC_PATIENT_URL` (veja
`.env.example`); sem ele, usa `http://localhost:8081`.
