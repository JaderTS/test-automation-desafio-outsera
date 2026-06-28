Feature: Cart

  Scenario: View product details
    Given the user is authenticated in the system
    When they access product details
    Then they should see product information

  Scenario: Add a product to the cart
    Given the user is authenticated in the system
    When they add a product to the cart
    Then the cart should display 1 item

  Scenario: Remove product from listing
    Given the user is authenticated in the system
    And they added a product to the cart
    When they remove the product from listing
    Then the cart should display no items

  Scenario: Add multiple products to the cart
    Given the user is authenticated in the system
    When they add 2 products to the cart
    Then the cart should display 2 items
