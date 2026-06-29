MySongProfileApp
Descrição do Projeto
O MySongProfileApp é uma aplicação web desenvolvida para permitir que usuários criem e gerenciem uma playlist personalizada com suas músicas favoritas.
A aplicação possui autenticação de usuários, gerenciamento de perfil e gerenciamento de playlists, permitindo que cada usuário mantenha sua própria lista de músicas associada à conta criada.
O projeto é composto por:

Frontend: desenvolvido com HTML, CSS, Bootstrap e TypeScript.
Backend: desenvolvido com Django e Django REST Framework.
API REST: responsável pela autenticação, gerenciamento de usuários e gerenciamento das playlists.

Domínios da Aplicação":

Frontend
A aplicação pode ser acessada através do seguinte endereço: https://mysongprofileappv2.onrender.com

Backend
A API pode ser acessada através do seguinte endereço: https://t2-inf1407-2026-back.onrender.com

O frontend depende diretamente do backend para funcionar.
Caso o backend esteja desligado, suspenso ou fora do ar, o frontend continuará carregando normalmente, porém não será possível:

Fazer login;
Criar usuários;
Editar perfil;
Visualizar playlist;
Criar playlist;
Editar músicas;
Remover músicas;
Realizar qualquer operação que dependa da API.

Portanto, o backend deve estar em execução para que o sistema funcione corretamente.

Funcionalidades Implementadas
- Cadastro de Usuário
  Permite criar uma nova conta no sistema informando:
  - Username
  - E-mail
  - Senha

Após o cadastro, o usuário pode realizar login e acessar as funcionalidades protegidas do sistema.

Login
  O sistema possui autenticação baseada em JWT (JSON Web Token).
  Ao efetuar login com sucesso:
    - O token de acesso é gerado pelo backend;
    - O token é armazenado no navegador;
    - O usuário passa a ter acesso às áreas protegidas do sistema.


Logout
  Permite encerrar a sessão do usuário.
  Ao realizar logout:
    - O token é removido do armazenamento local do navegador;
    - O acesso às páginas protegidas é encerrado.


Perfil do Usuário
  Cada usuário possui um perfil próprio.
  No perfil é possível:
    - Visualizar informações da conta;
    - Editar informações pessoais;
    - Atualizar:
        Username;
        Nome;
        Sobrenome;
        Gênero;
        E-mail.

Playlist (SongList)
  Cada usuário possui sua própria playlist.
  Visualização
  A página de perfil exibe:
    - Músicas cadastradas;
    - Quantidade de músicas adicionadas;
    - Quantidade de espaços restantes;
    - Estado de completude da playlist.

Criação da Playlist
  O sistema permite criar uma playlist contendo até cinco músicas.
  Cada música contém:
    - Nome;
    - Artista;
    - Gênero musical.

Edição de Música
  O usuário pode alterar informações de qualquer música presente em sua playlist:
    - Nome;
    - Artista;
    - Gênero.

Remoção de Música
  Também é possível:

  - Remover músicas da playlist;
  - Atualizar automaticamente o estado da lista.


Controle de Acesso:
  As páginas protegidas exigem autenticação.
  Caso um usuário tente acessar recursos protegidos sem estar autenticado, ele será redirecionado para a página de login.

Tecnologias Utilizadas:
  Frontend
    HTML5
    CSS3
    Bootstrap
    TypeScript

  Backend
    Python
    Django
    Django REST Framework
    JWT Authentication

  Hospedagem
    Render

EndPoints:

POST   /api/users/
POST   /api/login/
POST   /api/logout/

GET    /api/profile/
PUT    /api/profile/

GET    /api/songlist/
POST   /api/songlist/

PUT    /api/songlist/{id}/
DELETE /api/songlist/{id}/

Funcionalidades Não Implementadas
  Algumas funcionalidades foram previstas durante o desenvolvimento, mas não foram totalmente implementadas.
    Recuperação de Senha por E-mail:
      Atualmente não existe integração com serviços de e-mail.
      Dessa forma, o sistema:
      - Não envia e-mails;
      - Não envia links de recuperação;
      - Não envia códigos de redefinição para o endereço eletrônico do usuário.
    Swagger não implementado:
      É possível acessar a página do swagger ao adicionar "/swagger" ao endereço inicial do backend, mas não está funcionando como devido. A funcionalidade de testar a Api está devolvendo respostas inesperadas para os requests.

Houve um problema no meio do desenvolvimento então foi necessário recriar o repositório do frontend duas vezes e o de backend uma vez. Aqui estão prints dos commits dos repositórios antigos de, respectivamente, frontend e backend, só como prova:
<img width="1919" height="788" alt="image" src="https://github.com/user-attachments/assets/2f4d9c8a-5896-42f7-8d3b-564b2389e026" />
<img width="1910" height="868" alt="image" src="https://github.com/user-attachments/assets/90c9b764-8f3d-4818-ae7a-b5374444d8f3" />
<img width="1919" height="844" alt="image" src="https://github.com/user-attachments/assets/3ef68fb2-8fe2-4292-9463-5682863b0894" />



