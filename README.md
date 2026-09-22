# CM3 SMART

Site da academia com apresentação pública, área do aluno e painel administrativo. Feito em Flask e SQLite.

## Executar

```powershell
python -m pip install -r requirements.txt
$env:CM3_SECRET_KEY = "troque-por-uma-chave-longa-e-aleatoria"
python app.py
```

Abra `http://127.0.0.1:5000`.

Para publicar uma prévia que funcione sem o computador ligado, siga [DEPLOY.md](DEPLOY.md).

## Criar o primeiro administrador

```powershell
flask --app app create-admin
```

O comando pede nome, e-mail e senha. Depois, use a **Área do aluno** no site para entrar. O painel permite cadastrar alunos, professores, planos, aulas e treinos, registrar frequência e atribuir plano e vencimento aos alunos.

## Antes de publicar

- Confirme e atualize os valores, benefícios dos planos, grade de aulas e equipe. Os dados iniciais são demonstrativos.
- Substitua os campos de contato e informe o endereço exato em `templates/index.html`. O mapa aponta apenas para a região de Surubim.
- Use fotos próprias e confirme os direitos de uso das imagens externas. O site precisa de conexão com a internet para carregar as fotos, fontes e mapa.
- Configure uma chave `CM3_SECRET_KEY` forte e HTTPS na hospedagem. O servidor embutido do Flask é para desenvolvimento; use uma hospedagem com servidor WSGI para produção.
- Faça backup do arquivo `cm3.sqlite3`, que contém as contas e dados do painel.
