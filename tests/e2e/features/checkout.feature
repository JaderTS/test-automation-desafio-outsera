Feature: Checkout

  Scenario: Checkout com sucesso
    Given que o usuário está autenticado no sistema
    And possui um produto no carrinho
    When ele preenche os dados de checkout corretamente
    And finaliza a compra
    Then deve visualizar a mensagem de compra concluída

  Scenario: Checkout com nome vazio
    Given que o usuário está autenticado no sistema
    And possui um produto no carrinho
    When ele tenta continuar o checkout sem preencher o nome
    Then deve visualizar uma mensagem de erro no checkout

  Scenario: Checkout com CEP vazio
    Given que o usuário está autenticado no sistema
    And possui um produto no carrinho
    When ele tenta continuar o checkout sem preencher o CEP
    Then deve visualizar uma mensagem de erro no checkout