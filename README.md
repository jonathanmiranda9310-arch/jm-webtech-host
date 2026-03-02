# 🚀 JM Webtech Host - Plataforma Educacional Full Stack

 ![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
 ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
 ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
 ![PHP](https://img.shields.io/badge/PHP-777BB4?style=for-the-badge&logo=php&logoColor=white)
 ![MySQL](https://img.shields.io/badge/MySQL-00000F?style=for-the-badge&logo=mysql&logoColor=white)

Uma plataforma educacional completa desenvolvida para hospedar, catalogar e gerenciar documentações de projetos técnicos divididos em três grandes vertentes: **Game Academy, Maker Academy e Robotics Academy**.

O sistema possui uma interface interativa (com temas Claro/Escuro), formatação avançada de código-fonte e um painel de administração seguro construído do zero.

## ✨ Funcionalidades Principais

* **Arquitetura Modular:** Separação de projetos em categorias dinâmicas (Games, Maker e Robótica).
* **Painel Administrativo Restrito:** Criação, edição e exclusão de projetos habilitados apenas para usuários autenticados (Admin).
* **Syntax Highlighting Automático:** Integração nativa com `Highlight.js` para exibição de códigos-fonte (C++, Python, JS, etc.) em formato de IDE.
* **Upload de Mídia Seguro:** Suporte para capa do projeto e Galeria de Imagens (exclusiva para a Game Academy), com validação de extensão e *Magic Bytes*.
* **UI/UX Reativa:** Alternância de temas (Light/Dark Mode), animações em Canvas (Matrix background) e design responsivo.

## 🛡️ Engenharia de Segurança (AppSec)

Este projeto foi construído considerando as principais vulnerabilidades da web, implementando defesas rigorosas no backend:

* **Proteção de Sessão:** Uso de `session_start()` no PHP para evitar rotas quebradas ou acesso direto a endpoints administrativos.
* **Autenticação Segura:** Backend preparado para validação de senhas via `password_hash()` e `password_verify()` (BCRYPT).
* **Filtro Anti-Malware (MIME-Type):** Bloqueio de injeção de arquivos e *spoofing*. A API não confia na extensão nominal, analisando fisicamente o arquivo através de `getimagesizefromstring`.
* **Proteção contra DoS em Uploads:** Limite estrito de 2MB por requisição de imagem no servidor para evitar exaustão de disco.
* **Proteção CORS:** Bloqueio de chamadas externas de outros domínios na API.

## ⚙️ Como executar localmente


1. Clone o repositório para a sua máquina.
2. Certifique-se de ter o **XAMPP** (ou similar) instalado rodando Apache e MySQL.
3. Coloque a pasta do projeto dentro de `htdocs`.
4. Importe o arquivo estrutural do banco de dados:
   * Acesse o `phpMyAdmin`.
   * Crie um banco de dados chamado `banco_jmwebtech`.
   * Importe o arquivo `database.sql` incluído neste repositório.
5. Renomeie o arquivo `api.example.php` para `api.php` e preencha com as credenciais do seu banco de dados local.
6. Acesse no navegador: `http://localhost/nome-da-pasta`.

## 👨‍💻 Autor

**Jonathan Miranda**

 *Full Stack Developer | Cybersecurity*


