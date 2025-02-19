# Biblioteca

## Descrição

Este é um projeto backend desenvolvido em Node.js utilizando Express, Prisma e outras bibliotecas para gerenciar um sistema de biblioteca. A aplicação permite o registro de usuários, login, gerenciamento de livros e empréstimos de livros.

## Instalação

1. Clone o repositório:
   ```bash
   git clone <URL_DO_NOVO_REPOSITORIO>
   cd js-books
   ```

2. Instale as dependências:

   ```bash
   npm install
   docker compose up -d
   ```

3. Configure as variáveis de ambiente: Crie um arquivo .env na raiz do projeto e adicione as seguintes variáveis:

   ```bash
    API_LISTENING_PORT=3000
    DB_USERNAME=<seu_usuario>
    DB_PASSWORD=<sua_senha>
    DB_HOST=<seu_host>
    DB_PORT=<sua_porta>
    DB_NAME=<seu_banco_de_dados>
   ```

4. Inicialize o Prisma:

   ```bash
    npx prisma db push
    npx prisma migrate deploy
   ```

5. Inicie a aplicação:

   ```bash
   npm run dev
 
   ```
## Endpoints

### Autenticação de Usuário
- Login de Usuário
- POST /user/login

    ```bash
    {
      "username": "string",
      "password": "string"
    }
    ```

### Registro de Usuário

- POST /user/register

    ```bash
    {
      "email": "string",
      "username": "string",
      "password": "string"
    }
    ```

### Gerenciamento de Livros
- Criar Livros
- POST /books
    
    ```bash
    {
      "books": [
        {
          "title": "string",
          "author": "string",
          "edition": "string",
          "publisher": "string",
          "isbn": "string",
          "genre": "string",
          "page_count": "number",
          "language": "string",
          "publication_year": "number"
        }
      ]
    }
    ```

### Obter Livros
- GET /books
1. Query Params:
2. page: Número da página (opcional, padrão: 0)
3. Respostas:
- 200 OK: Lista de livros.


### Atualizar Livro
- PUT /books/:isbn

    ```bash
    {
      "title": "string",
      "author": "string",
      "edition": "string",
      "publisher": "string",
      "genre": "string",
      "page_count": "number",
      "language": "string",
      "publication_year": "number"
    }
    ```

### Deletar Livro
1. DELETE /books/:isbn
2. Respostas:
- 204 No Content: Livro deletado com sucesso.
- 400 Bad Request: Livro não encontrado.


### Empréstimo de Livros
1. Emprestar Livro

- POST /borrow
    ```bash
    {
      "isbn": "string"
    }
    ```

### Devolver Livro
1. DELETE /return/:isbn
- Respostas:
- 204 No Content: Livro devolvido com sucesso.
- 400 Bad Request: Livro não encontrado ou não emprestado.
2. Obter Livros Emprestados
- GET /borrowed
- Respostas:
- 200 OK: Lista de livros emprestados.


### Tecnologias Utilizadas
- Node.js
- Express
- Prisma
- MySQL
- bcrypt
- cookie-parser
- cors
- dotenv
- jsonwebtoken
- nodemon
- zod
- docker