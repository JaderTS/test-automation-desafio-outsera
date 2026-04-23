Feature: Checkout

  Background:
    Given que o usuário está autenticado no sistema
    And possui um produto no carrinho

  Scenario: Checkout com sucesso
    When ele preenche os dados de checkout corretamente
    And finaliza a compra
    Then deve visualizar a mensagem de compra concluída

  Scenario Outline: Checkout sem campo obrigatório exibe mensagem de erro
    When ele tenta finalizar o checkout omitindo "<campo>"
    Then deve visualizar a mensagem de erro no checkout contendo "<mensagem>"

    Examples:
      | campo          | mensagem                |
      | primeiro nome  | First Name is required  |
      | sobrenome      | Last Name is required   |
      | CEP            | Postal Code is required |
      | todos os campos| First Name is required  |
