# 🦊 Okami Extension

**Okami Extension** é uma extensão para Firefox que permite acompanhar facilmente seus mangás e animes favoritos da sua biblioteca da [Okami](https://go.myokami.xyz/). Com ela, você pode buscar suas obras e marcar capítulos e episódios como lidos diretamente pelo navegador.

## ✨ Funcionalidades

- 🔍 Busca automática de obras na sua biblioteca da Okami.
- ✅ Marca capítulos e episódios como lidos com um clique.
- 🧠 Sincronização com sua conta Okami.

## 🛠️ Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/okami-extension.git
cd okami-extension
```

### 2. Crie os arquivos de ambiente

Crie os arquivos `.env` e `.env.prd` na raiz do projeto.

#### Exemplo de `.env.prd`:

```env
VITE_OKAMI_PTATFORM_URL=https://app.myokami.xyz
VITE_API_URL=https://api.myokami.xyz
```

Você também pode criar um `.env` com as mesmas variáveis para desenvolvimento local.

### 3. Instale as dependências

Usando **npm**:

```bash
npm install
```

Ou **pnpm**:

```bash
pnpm install
```

### 4. Compile o projeto

```bash
npm build
```

Ou **pnpm**:

```bash
pnpm build
```

## 🧪 Testando a extensão no Firefox

1. Acesse `about:debugging` no Firefox.
2. Clique em **“Carregar Extensão Temporária”**.
3. Selecione a **pasta `dist`** gerada após o build.

## 📦 Empacotamento para publicação

Certifique-se de remover logs e verificar se todas as permissões estão corretamente definidas no `manifest.json`. Você pode usar [o validador de extensões da Mozilla](https://addons.mozilla.org/pt-BR/developers/) para garantir que tudo esteja correto antes de enviar.

## 📄 Licença

Este projeto está licenciado sob a [MIT License](LICENSE).