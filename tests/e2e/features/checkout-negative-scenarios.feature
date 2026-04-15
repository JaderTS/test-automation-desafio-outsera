Feature: Checkout - Cenarios Negativos com Evidencias

  Scenario: Checkout sem informar o primeiro nome mostra erro especifico
    Given que o usuario esta logado e tem produto no carrinho
    When o usuario tenta finalizar sem primeiro nome
    Then a mensagem de erro "Error: First Name is required" deve ser exibida no checkout

  Scenario: Checkout sem informar o sobrenome mostra erro especifico
    Given que o usuario esta logado e tem produto no carrinho
    When o usuario tenta finalizar sem sobrenome
    Then a mensagem de erro "Error: Last Name is required" deve ser exibida no checkout

  Scenario: Checkout sem informar o CEP mostra erro especifico
    Given que o usuario esta logado e tem produto no carrinho
    When o usuario tenta finalizar sem CEP
    Then a mensagem de erro "Error: Postal Code is required" deve ser exibida no checkout

  Scenario: Checkout com todos os campos em branco mostra primeiro erro
    Given que o usuario esta logado e tem produto no carrinho
    When o usuario tenta finalizar sem nenhum dado
    Then a mensagem de erro "Error: First Name is required" deve ser exibida no checkout
