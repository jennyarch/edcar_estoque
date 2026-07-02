# 🚗 EdCar Estoque

Sistema web desenvolvido para gerenciamento de estoque de uma loja de autopeças, permitindo o controle de produtos, movimentação de estoque e gestão de preços de venda de forma simples, rápida e intuitiva.

O projeto foi desenvolvido utilizando **Next.js**, **TypeScript**, **Tailwind CSS**, **Ant Design** e **Firebase**, seguindo uma arquitetura moderna voltada para escalabilidade, organização do código e boa experiência do usuário.

---

## 📋 Sobre o Projeto

O **EdCar Estoque** nasceu da necessidade de informatizar o processo de controle de estoque de uma loja de autopeças, eliminando controles manuais e reduzindo erros relacionados à entrada, saída e precificação de produtos.

A aplicação oferece uma interface moderna e responsiva para facilitar as operações diárias do estabelecimento.

---

## ✨ Funcionalidades

* Tela de Login com autenticação de usuários
* Cadastro de produtos
* Edição de produtos
* Exclusão de produtos
* Consulta rápida de produtos
* Controle de entrada e saída de estoque
* Baixa de produtos através de modal
* Controle de preços de venda
* Atualização automática do estoque
* Interface responsiva
* Feedback visual durante as operações

---

## 🛠 Tecnologias

| Tecnologia   | Descrição                                |
| ------------ | ---------------------------------------- |
| Next.js      | Framework React para aplicações modernas |
| React        | Biblioteca para construção da interface  |
| TypeScript   | Tipagem estática para maior segurança    |
| Tailwind CSS | Framework utilitário para estilização    |
| Ant Design   | Biblioteca de componentes UI             |
| Firebase     | Banco de dados e serviços em nuvem       |

---

## 📁 Estrutura do Projeto

```
src/
│
├── app/                # Rotas da aplicação (App Router)
├── components/         # Componentes reutilizáveis
├── services/           # Comunicação com Firebase
├── hooks/              # Hooks customizados
├── types/              # Tipagens TypeScript
├── utils/              # Funções auxiliares
├── styles/             # Estilos globais
└── assets/             # Recursos estáticos
```

> A organização segue o conceito de separação de responsabilidades, facilitando manutenção, escalabilidade e reutilização de código.

---

## 🚀 Como executar o projeto

### Clone o repositório

```bash
git clone https://github.com/jennyarch/edcar_estoque.git
```

Entre na pasta do projeto

```bash
cd edcar_estoque
```

Instale as dependências

```bash
npm install
```

ou

```bash
yarn
```

Configure as variáveis de ambiente criando um arquivo `.env.local`.

Exemplo:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

Execute o projeto

```bash
npm run dev
```

A aplicação estará disponível em

```
http://localhost:3000
```

---

## ⚙️ Scripts disponíveis

```bash
npm run dev
```

Inicia o ambiente de desenvolvimento.

```bash
npm run build
```

Gera a versão de produção.

```bash
npm run start
```

Executa a aplicação em modo de produção.

```bash
npm run lint
```

Realiza análise estática do código.

---

## 🎯 Objetivos do Projeto

* Automatizar o controle de estoque.
* Centralizar o gerenciamento de produtos.
* Melhorar o controle de preços.
* Reduzir erros operacionais.
* Facilitar a rotina da loja.
* Proporcionar uma experiência intuitiva ao usuário.

---

## 💡 Diferenciais

* Interface moderna utilizando Ant Design.
* Estilização responsiva com Tailwind CSS.
* Código totalmente desenvolvido em TypeScript.
* Integração com Firebase para persistência dos dados.
* Componentização visando reutilização e manutenção.
* Estrutura preparada para futuras funcionalidades.

---

## 🔒 Variáveis de Ambiente

Por questões de segurança, o projeto não versiona arquivos `.env`.

Utilize um arquivo `.env.local` baseado no exemplo acima para configurar as credenciais do Firebase.

---

## 📈 Melhorias Futuras

* Controle de usuários e permissões.
* Dashboard com indicadores.
* Relatórios em PDF.
* Histórico de movimentações.
* Exportação para Excel.
* Controle de fornecedores.
* Cadastro de clientes.
* Controle financeiro.
* Notificações de estoque mínimo.

---

## 🤝 Contribuições

Contribuições são bem-vindas.

Caso encontre algum problema ou tenha sugestões de melhorias, fique à vontade para abrir uma **Issue** ou enviar um **Pull Request**.

---

## 👩‍💻 Desenvolvido por

**Jennyfer Sampaio**

Frontend Developer

GitHub: https://github.com/jennyarch
