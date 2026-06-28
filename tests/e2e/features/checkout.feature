Feature: Checkout

  Background:
    Given the user is authenticated in the system
    And they have a product in the cart

  Scenario: Successful checkout
    When they fill in the checkout information correctly
    And they complete the purchase
    Then they should see the order completion message

  Scenario Outline: Checkout missing required field shows error message
    When they try to complete the checkout omitting "<field>"
    Then they should see an error message in the checkout containing "<message>"

    Examples:
      | field          | message                 |
      | first name     | First Name is required  |
      | last name      | Last Name is required   |
      | zip code       | Postal Code is required |
      | all fields     | First Name is required  |
