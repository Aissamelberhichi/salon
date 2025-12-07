{
  "info": {
    "name": "Salon SaaS API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:5000/api"
    }
  ],
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "url": "http://localhost:5000/health"
      }
    },
    {
      "name": "Login",
      "request": {
        "method": "POST",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"email\": \"client@test.com\",\n  \"password\": \"client123\"\n}"
        },
        "url": "{{base_url}}/auth/login"
      }
    },
    {
      "name": "Register Client",
      "request": {
        "method": "POST",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"fullName\": \"New Client\",\n  \"email\": \"newclient@test.com\",\n  \"phone\": \"+212600999888\",\n  \"password\": \"password123\"\n}"
        },
        "url": "{{base_url}}/auth/register/client"
      }
    },
    {
      "name": "Get Me",
      "request": {
        "method": "GET",
        "header": [{"key": "Authorization", "value": "Bearer {{token}}"}],
        "url": "{{base_url}}/auth/me"
      }
    }
  ]
}