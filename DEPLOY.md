# Prévia online para os sócios

O projeto já inclui a API e o site no mesmo aplicativo Flask. Para compartilhar um link sem deixar o VS Code ou o computador ligados, publique o aplicativo em um serviço web.

## Publicar no Render

1. Crie um repositório **privado** no GitHub e envie os arquivos deste projeto. Não envie `cm3.sqlite3`, `.env` nem `__pycache__` (já estão no `.gitignore`). Inclua a pasta `static` com as fotos.
2. No [Render](https://dashboard.render.com/), conecte sua conta do GitHub e escolha **New → Blueprint**. Selecione o repositório. O arquivo `render.yaml` já define o serviço web gratuito, a instalação, a inicialização e uma chave de sessão aleatória.
3. Confirme a criação. Quando o deploy terminar, copie o endereço `https://...onrender.com` e envie aos sócios.

Se preferir criar um **Web Service** manualmente, use `pip install -r requirements.txt` no build e `gunicorn --workers 1 --bind 0.0.0.0:$PORT app:app` no start. Configure `CM3_SECRET_KEY` com um valor longo e aleatório, `CM3_REQUIRE_SECRET=1` e `CM3_COOKIE_SECURE=1`.

## Limites desta prévia

O plano gratuito do Render pausa o site após um período sem visitas. A primeira abertura depois disso pode demorar. Seu sistema atual usa SQLite em arquivo local; nesse plano, contas, reservas e alterações feitas online podem desaparecer após pausa, reinício ou novo deploy. Use apenas dados de teste. Para uso real com alunos, será necessário um banco persistente e uma revisão final de segurança e conteúdo.

O site público, as imagens e a API sob `/api/` estarão no mesmo endereço. A área administrativa exige um administrador criado no ambiente hospedado; criar um administrador no seu computador não o cria online.
