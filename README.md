# CM3

Site da academia com apresentação pública, área do aluno e painel administrativo. A API é Flask e SQLite; o site é React (pasta `web/`), entregue pronto pelo próprio Flask.

## Executar

```powershell
python -m pip install -r requirements.txt
$env:CM3_SECRET_KEY = "troque-por-uma-chave-longa-e-aleatoria"
python app.py
```

Abra `http://127.0.0.1:5000`.

Para publicar uma prévia que funcione sem o computador ligado, siga [DEPLOY.md](DEPLOY.md).

## Editar o site (React)

O código do site fica em `web/` (React, Vite, Tailwind, GSAP e Lenis, fonte Montserrat). O Flask entrega a versão pronta, gerada em `static/site/`. Componentes no padrão shadcn ficam em `web/src/components/ui/` (ex.: a galeria circular das modalidades) e podem ser importados com `@/components/ui/...`.

```powershell
cd web
npm install
npm run dev     # site em http://127.0.0.1:5173, usando a API do python app.py
npm run build   # gera static/site/ (envie essa pasta junto no GitHub)
```

- Textos, contatos, modalidades e perguntas frequentes: `web/src/dados/site.ts`.
- Grade semanal de aulas: `web/src/dados/grade.ts`.
- Fotos: `web/public/fotos/`. Ritmos e Pilates usam fotos ilustrativas do Unsplash: troque pelas fotos das turmas da CM3 em `web/src/dados/site.ts`.
- Cores e fontes da marca: no topo de `web/src/index.css`.
- Planos e equipe continuam vindo do painel administrativo.
- A versão anterior em HTML ficou guardada em `_versao-html-antiga/`.

## Criar o primeiro administrador

```powershell
flask --app app create-admin
```

O comando pede nome, e-mail e senha. Depois, use a **Área do aluno** no site para entrar. O painel permite cadastrar alunos, professores, planos, aulas e treinos, registrar frequência e atribuir plano e vencimento aos alunos.

## Antes de publicar

- Confirme e atualize os valores, benefícios dos planos, grade de aulas e equipe. Os dados iniciais são demonstrativos.
- Confira os contatos e o endereço em `web/src/dados/site.ts` e rode `npm run build`. O mapa aponta para a Praça Dídimo Carneiro, no Centro de Surubim.
- As fotos são as da própria academia e as fontes vão junto no site; só o mapa precisa de internet.
- Configure uma chave `CM3_SECRET_KEY` forte e HTTPS na hospedagem. O servidor embutido do Flask é para desenvolvimento; use uma hospedagem com servidor WSGI para produção.
- Faça backup do arquivo `cm3.sqlite3`, que contém as contas e dados do painel.
