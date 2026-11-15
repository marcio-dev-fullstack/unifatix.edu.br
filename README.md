# Arquitetura e Estrutura Recomendada: Portal UniFatix

Este documento estabelece a especificação técnica oficial e a arquitetura de arquivos de última geração para o diretório **`Portal-UniFatix`** do ecossistema **UNIFATIX** (`unifatix.edu.br`). O objetivo desta estrutura é proporcionar isolamento modular, escalabilidade de código, segurança baseada em funções (RBAC - *Role-Based Access Control*) e compatibilidade imediata com ambientes de integração e entrega contínuas (CI/CD).

---

## 1. Visão Geral e Princípios de Design de Software

A arquitetura do **Portal UniFatix** foi concebida segundo os princípios de separação de responsabilidades (*Separation of Concerns*), defesa em profundidade e design orientado à experiência do usuário (*UX/UI*).

### Diretrizes Fundamentais
* **Isolamento de Domínios**: Separação física clara entre a interface pública de login, a Área do Aluno, o Painel do Administrador e os serviços de API.
* **Segurança em Múltiplas Camadas**: Implementação de guardas de navegação no lado do cliente (*Frontend Route Guards*) combinados com validação estrita por tokens JWT e middlewares de autorização no lado do servidor (*Backend Security Guards*).
* **Persistência e Resiliência**: Suporte duplo para execução *Serverless/Stateless* e suporte a bancos de dados estruturados em JSON ou SQL/NoSQL.
* **Design System Consistente**: Padronização visual em modo escuro (*Dark Mode Premium*) com alta legibilidade e componentes responsivos.

---

## 2. Árvore Completa de Diretórios do Portal-UniFatix

A estrutura hierárquica a seguir representa o padrão recomendado para organização dos arquivos no repositório:

```text
unifatix.edu.br/
└── Portal-UniFatix/
    ├── assets/
    │   ├── css/
    │   │   ├── style.css           # Estilos globais e variáveis de tema (ZENTIX Theme)
    │   │   └── login.css           # Layout e animações exclusivas da tela de login
    │   ├── js/
    │   │   ├── auth.js             # Gerenciador de sessão, estado do usuário e logout
    │   │   ├── auth-guard.js       # Guarda de rotas em tempo de execução (HEAD script)
    │   │   └── courses-data.js     # Catálogo de cursos, módulos, videoaulas e quizzes
    │   └── img/
    │       ├── logo-unifatix.svg   # Identidade visual vetorial da instituição
    │       ├── avatars/            # Fotos de perfil e placeholders de usuários
    │       └── badges/             # Emblemas e selos de validação de certificados
    │
    ├── aluno/                      # Módulo de Acesso Exclusivo do Estudante
    │   ├── index.html              # Dashboard do Aluno (Métricas, Progresso e Boletos)
    │   ├── curso.html              # Sala de aula virtual (Player, Anotações e Quiz)
    │   ├── financeiro.html         # Gestão de mensalidades, código de barras e boletos
    │   └── certificados.html       # Central de emissão e download de certificados PDF
    │
    ├── admin/                      # Módulo de Gestão Administrativa (Acesso Total)
    │   ├── index.html              # Painel de controle, métricas globais e relatórios
    │   └── alunos.html             # Gestão de alunos, matrículas e liberação de acesso
    │
    ├── api/                        # Servidor RESTful Node.js / Express
    │   ├── database/
    │   │   ├── db.js               # Conector de banco de dados e persistência JSON
    │   │   ├── users.json          # Registros de usuários, hashes Bcrypt e perfis
    │   │   └── boletos.json        # Status financeiro e histórico de mensalidades
    │   ├── middleware/
    │   │   └── authMiddleware.js   # Middleware de validação do Token JWT e Roles
    │   ├── routes/
    │   │   ├── auth.js             # Endpoints /api/auth/login e /api/auth/me
    │   │   └── financeiro.js       # Endpoints de consulta e atualização de boletos
    │   └── server.js               # Ponto de entrada do servidor HTTP Express
    │
    ├── login.html                  # Interface principal de autenticação de usuários
    ├── valida.html                 # Validador público de certificados por QR Code/Hash
    ├── Dockerfile                  # Containerização oficial para produção
    ├── package.json                # Gerenciador de dependências e scripts npm
    └── README.md                   # Manual técnico e documentação da pasta
```

---

## 3. Modelo de Segurança e Controle de Acesso (RBAC)

O controle de acesso do Portal UniFatix diferencia rigorosamente as permissões de cada perfil de usuário para impedir acessos não autorizados e ações destrutivas acidentais.

### Definição dos Perfis de Usuário

| Perfil (`role`) | Nível de Acesso | Permissões de Leitura | Permissões de Escrita / Exclusão |
| :--- | :--- | :--- | :--- |
| **`admin`** | **Total (Superuser)** | Visualizar todos os alunos, turmas, logs e boletos. | Criar, editar e **excluir** alunos, cursos, boletos e emitir certificados manuais. |
| **`aluno`** | **Restrito (Read-Only/Self)** | Visualizar os próprios cursos, anotações, quizzes e status financeiro. | Cadastrar anotações próprias e responder quizzes. **Bloqueio total de exclusão**. |

### Matriz de Credenciais Padrão de Teste

* **Aluna de Exemplo**:
  * **Nome Completo**: KESIA DE OLIVEIRA QUADROS
  * **Usuário (`login`)**: `kesia`
  * **Senha**: `12345678`
  * **Perfil**: `aluno`
  * **Status Financeiro**: `🟢 Boleto em Dia`
* **Administrador do Sistema**:
  * **Nome Completo**: Administrador UNIFATIX
  * **Usuário (`login`)**: `admin`
  * **Senha**: `admin123`
  * **Perfil**: `admin`

---

## 4. Fluxo de Autenticação e Proteção de Rotas (Auth Guard)

Para garantir que páginas administrativas não sejam acessadas via digitação direta de URL sem a devida autorização, o sistema utiliza uma camada dupla de proteção.

### 4.1. Proteção no Frontend (`auth-guard.js`)

Este script deve ser inserido no `<head>` das páginas protegidas para interromper a renderização antes que dados confidenciais sejam exibidos no navegador:

```javascript
// Portal-UniFatix/assets/js/auth-guard.js
(function verificarPermissaoAcesso() {
    const dadosSessao = localStorage.getItem('unifatix_session') || sessionStorage.getItem('unifatix_session');
    const usuario = dadosSessao ? JSON.parse(dadosSessao) : null;
    const caminhoAtual = window.location.pathname;

    // 1. Redireciona para o login se não houver usuário autenticado
    if (!usuario || !usuario.token) {
        alert('Sessão expirada ou não encontrada. Faça login para continuar.');
        window.location.href = '../login.html';
        return;
    }

    // 2. Bloqueia o acesso de alunos às páginas da pasta /admin/
    if (caminhoAtual.includes('/admin/') && usuario.role !== 'admin') {
        alert('Acesso negado! Este painel é restrito a administradores.');
        window.location.href = '../aluno/index.html';
        return;
    }
})();
```

### 4.2. Proteção no Backend (`authMiddleware.js`)

No servidor Node.js/Express, cada requisição para endpoints protegidos passa pela validação de assinatura do token JWT e pela verificação do perfil:

```javascript
// Portal-UniFatix/api/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

function verificarTokenJWT(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ erro: 'Acesso negado. Token não fornecido.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'unifatix_chave_secreta_2026');
        req.usuario = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ erro: 'Token inválido ou expirado.' });
    }
}

function exigirPerfil(roleRequerida) {
    return (req, res, next) => {
        if (!req.usuario || req.usuario.role !== roleRequerida) {
            return res.status(403).json({ erro: 'Acesso negado. Permissão insuficiente.' });
        }
        next();
    };
}

module.exports = { verificarTokenJWT, exigirPerfil };
```

---

## 5. Especificação Técnica dos Módulos Funcionais

### 5.1. Área do Aluno (`/aluno/`)
* **`index.html`**: Apresenta os cards de resumo (Cursos em Andamento, Aulas Concluídas, Certificados Liberados) e o banner de status da mensalidade com indicação de *Boleto em Dia*.
* **`curso.html`**: Sala de estudo com player de vídeo responsivo, lista lateral de módulos, bloco de anotações pessoal com salvamento automático no *LocalStorage* e sistema de Quiz com feedback imediato.
* **`financeiro.html`**: Exibe o status da conta do estudante, o histórico das mensalidades pagas e o botão para cópia da linha digitável do boleto atual.
* **`certificados.html`**: Lista os certificados conquistados após a conclusão de 100% das disciplinas, com botão para geração de documento e validação por hash.

### 5.2. Painel Administrativo (`/admin/`)
* **`index.html`**: Indicadores institucionais com gráficos de matrículas ativas, taxa de conclusão de cursos e arrecadação de mensalidades.
* **`alunos.html`**: Tabela interativa para busca de estudantes, alteração manual de status financeiro (Boleto Pago / Pendente) e botão de exclusão protegido e visível exclusivamente para o perfil `admin`.

---

## 6. Integração com Backend, Docker e Script de Implantação

### 6.1. Containerização com Dockerfile

O arquivo `Dockerfile` na raiz da pasta `Portal-UniFatix` garante que a aplicação rode com o mesmo ambiente em qualquer provedor de nuvem:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
ENV PORT=3000
CMD ["npm", "start"]
```

### 6.2. Automação de Deploy via Git (Comando em Uma Única Linha)

Para enviar todas as atualizações da estrutura `Portal-UniFatix` diretamente para o repositório oficial no GitHub (`unifatix.edu.br.git`), execute o comando abaixo no terminal da pasta raiz:

```bash
git init && git add . && git commit -m "Arquitetura v6.0: Estrutura recomendada para a pasta Portal-UniFatix" && git branch -M main && (git remote add origin https://github.com/marcio-dev-fullstack/unifatix.edu.br.git 2>nul || git remote set-url origin https://github.com/marcio-dev-fullstack/unifatix.edu.br.git) && git push -u origin main --force
```

---

*Documento gerado como especificação técnica padrão para o ecossistema de aprendizado UNIFATIX.*
