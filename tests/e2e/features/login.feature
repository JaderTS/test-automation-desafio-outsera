Feature: Login

  Scenario: Successful login
    Given the user accesses the login page
    When they enter valid credentials
    Then they should be redirected to the products page

  Scenario Outline: Login with invalid data shows error message
    Given the user accesses the login page
    When they try to login with "<type>"
    Then they should see an error message containing "<message>"

    Examples:
      | type               | message                                |
      | wrong password     | Username and password do not match     |
      | nonexistent user   | Username and password do not match     |
      | empty username     | Username is required                   |
      | empty password     | Password is required                   |

  Scenario: Successful logout
    Given the user is authenticated in the system
    When they log out
    Then they should return to the login page
