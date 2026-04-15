Feature: Login - Cenários Negativos

  Scenario: Login com senha incorreta
    Given que o usuário acessa a página de login
    When ele tenta login com senha incorreta
    Then deve visualizar a mensagem de erro contendo "Username and password do not match"

  Scenario: Login com usuário inexistente
    Given que o usuário acessa a página de login
    When ele tenta login com usuário inexistente
    Then deve visualizar a mensagem de erro contendo "Username and password do not match"

  Scenario: Login com campo de usuário vazio
    Given que o usuário acessa a página de login
    When ele tenta login sem preencher o usuário
    Then deve visualizar a mensagem de erro contendo "Username is required"

  Scenario: Login com campo de senha vazio
    Given que o usuário acessa a página de login
    When ele tenta login sem preencher a senha
    Then deve visualizar a mensagem de erro contendo "Password is required"
