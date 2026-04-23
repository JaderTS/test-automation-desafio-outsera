Feature: Login

  Scenario: Login com sucesso
    Given que o usuário acessa a página de login
    When ele preenche credenciais válidas
    Then deve ser redirecionado para a página de produtos

  Scenario Outline: Login com dados inválidos exibe mensagem de erro
    Given que o usuário acessa a página de login
    When ele tenta login com "<tipo>"
    Then deve visualizar a mensagem de erro contendo "<mensagem>"

    Examples:
      | tipo                | mensagem                               |
      | senha incorreta     | Username and password do not match     |
      | usuario inexistente | Username and password do not match     |
      | usuario vazio       | Username is required                   |
      | senha vazia         | Password is required                   |

  Scenario: Logout com sucesso
    Given que o usuário está autenticado no sistema
    When ele realiza logout
    Then deve retornar para a tela de login
