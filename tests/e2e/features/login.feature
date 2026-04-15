Feature: Login

  Scenario: Login com sucesso
    Given que o usuário acessa a página de login
    When ele preenche credenciais válidas
    And clica em entrar
    Then deve ser redirecionado para a página de produtos

  Scenario: Login com senha inválida
    Given que o usuário acessa a página de login
    When ele preenche usuário válido e senha inválida
    And clica em entrar
    Then deve visualizar uma mensagem de erro de login

  Scenario: Login com usuário inexistente
    Given que o usuário acessa a página de login
    When ele preenche um usuário inexistente e uma senha qualquer
    And clica em entrar
    Then deve visualizar uma mensagem de erro de autenticação

  Scenario: Login com campos vazios
    Given que o usuário acessa a página de login
    When ele clica em entrar sem preencher os campos
    Then deve visualizar uma mensagem de erro de campos obrigatórios

  Scenario: Logout com sucesso
    Given que o usuário está autenticado no sistema
    When ele realiza logout
    Then deve retornar para a tela de login