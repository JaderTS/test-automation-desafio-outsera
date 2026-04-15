Feature: Checkout - Cenários Negativos

  Scenario: Checkout sem primeiro nome
    Given que o usuário está autenticado no sistema
    And possui um produto no carrinho
    When ele tenta checkout sem preencher o primeiro nome
    Then deve visualizar a mensagem de erro no checkout contendo "First Name is required"

  Scenario: Checkout sem sobrenome
    Given que o usuário está autenticado no sistema
    And possui um produto no carrinho
    When ele tenta checkout sem preencher o sobrenome
    Then deve visualizar a mensagem de erro no checkout contendo "Last Name is required"

  Scenario: Checkout sem CEP
    Given que o usuário está autenticado no sistema
    And possui um produto no carrinho
    When ele tenta checkout sem preencher o CEP
    Then deve visualizar a mensagem de erro no checkout contendo "Postal Code is required"

  Scenario: Checkout com todos os campos vazios
    Given que o usuário está autenticado no sistema
    And possui um produto no carrinho
    When ele tenta checkout sem preencher nenhum campo
    Then deve visualizar a mensagem de erro no checkout contendo "First Name is required"
