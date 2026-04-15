Feature: Carrinho

  Scenario: Visualizar detalhes de um produto
    Given que o usuário está autenticado no sistema
    When ele acessa os detalhes de um produto
    Then deve visualizar as informações do produto

  Scenario: Adicionar um produto ao carrinho
    Given que o usuário está autenticado no sistema
    When ele adiciona um produto ao carrinho
    Then o carrinho deve exibir 1 item

  Scenario: Remover produto da listagem
    Given que o usuário está autenticado no sistema
    And ele adicionou um produto ao carrinho
    When ele remove o produto pela listagem
    Then o carrinho não deve exibir itens

  Scenario: Adicionar múltiplos produtos ao carrinho
    Given que o usuário está autenticado no sistema
    When ele adiciona 2 produtos ao carrinho
    Then o carrinho deve exibir 2 itens