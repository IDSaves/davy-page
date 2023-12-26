---
title: (Docker) Установка распечатывающего (unseal) Vault
id: docker-istall-unseal-vault
---

:::info Вариант для маленьких серверов 
:::

___
### 1. Подготовка сертификатов

Создаём сертификаты необходимые для установки безопасного общения между распечатывающим Vault'ом и Vault'ами, которые он будет распечатывать.
#### 1.1 Создаём CA (Certificate Authority)

Для всех наших будущих сертификатов нужно создать CA, который будет их подписывать. 

:::tip Как это сделать подробно расписано тут – [Создание CA сертификатов](../TLS/CA-certs)
:::

Сертификат, который в итоге должен быть:
- `ca.crt (или .pem)` и его приватных ключ `ca.key`
#### 1.2 Создаём самоподписанный сертификат для Unseal-Vault сервера 

:::warning Внимание
При создании сертификата в X.509 конфигурации укажите IP-адрес и домен, по которому вы будете обращаться к вашему серверу по https. **Обязательно одним из адресов укажите `127.0.0.1`, чтобы к Unseal-Vault был доступ у `vault operator`.**
:::

:::tip Как это сделать подробно расписано тут – [Создание самоподписанных сертификатов](../TLS/self-signed-certs). 
:::

Сертификат, который в итоге должен быть:
- `unseal-vault.crt (или .pem)` и его приватных ключ `unseal-vault.key`
#### 1.3 Создаём клиентские сертификаты

Нужно создать клиентские сертификаты, чтобы Unseal-Vault сервер мог определять проверенных клиентов и авторизовывать их запросы. 

Для кого:
- Для Vault'ов, которые будут распечатываться через Unseal-Vault.
- Для operator'а находящегося внутри Unseal-Vault, который будет использоваться для ручного распечатывания и управления vault'ом. Доступного через команду `vault operator`.

:::tip Как это сделать подробно расписано тут – [Создание самоподписанных сертификатов](../TLS/self-signed-certs). 
 
Делается это также, как и создание сертификатов из предыдущего пункта, за исключением того, что в этот раз необходимости в указании `Alt_Names` в X.509 конфигурации нет.
:::

Список сертификатов, которые в итоге должны быть:
- `vault-client-[1..N].crt (или .pem)` и приватных ключ для каждого – `vault-client-[1..N].key`
- `vault-operator.crt (или .pem)` и его приватных ключ – `vault-operator.key`
### 2. Запуск контейнера Unseal-Vault

Для запуска контейнера нам понадобятся: 
1. Установленный Docker Compose 
2. Файл с конфигурацией запуска контейнера через Docker Compose (`docker-compose.yml`)
3. Файл с нужными переменными окружения (`.env`)
4. Файл с конфигурацией сервера Unseal-Vault 
#### 2.1 Конфигурация запуска контейнера через Docker Compose

Вам необходимо создать файл `docker-compose.yml` в папке, в которой будут храниться все данные вашего контейнера Unsel-Vault.

```yml title="docker-compose.yml"
version: "3.9"
services:
  vault:
    image: hashicorp/vault:1.15.2
    container_name: vault
    command: server
      -config=/vault/config/config.json # путь до конфига сервера 
                                        # внутри контейнера
    cap_add:
      - IPC_LOCK # Обязателен, для того чтобы можно было отключить
                 # memory-lock для vault (подробне будет ниже)
    env_file:
      - ./.env # путь до файла с env переменными, которые
               # будут помещены в контейнер после его запуска
    ports:
      - 8200:8200 # выводим наружу порт, для взаимодействия 
                  # с vault снаружи 
    volumes:
      - ./data/vault:/vault/file # внешние хранилище для данных
      - ./logs/vault:/vault/logs # внешнее хранилище для логов
      - ./config:/vault/config   # внешнее хранилище для конфига сервера
      - <путь до папки с сертификатом и ключём Unseal-Vault сервера>:/vault/tls
      - <путь до папки с клиентским сертификатом и ключем для оператора>:/vault/operator-tls
```
#### 2.2 Создание файла с переменными окружения (ENV VARS)

Vault оператору для успешной отправки запросов на сервер Unseal-Vault необходим ряд переменных окружения, которые мы должны указать.

```sh
# .env

VAULT_ADDR=https://127.0.0.1:8200 # адрес сервера
VAULT_CAPATH=/vault/tls/ca.crt # путь до CA сертификата
VAULT_CLIENT_KEY=/vault/operator-tls/vault-operator.key # путь до клиентского сертификата оператора
VAULT_CLIENT_CERT=/vault/operator-tls/vault-operator.crt # путь до ключа клиентского сертификата оператора
```
#### 2.3 Создание файла с конфигурацией Unseal-Vault сервера

```json title="/config/config.json"
{
  // Описание того, какое хранилище будет использовано 
  // (в нашем случае интегрированного) и его параметров
  "storage": {
    "file": {
      "path": "/vault/file" // путь до папки с данными vault 
    }
  },

  "listener": {
    "tcp": {
      "address": "[::]:8200", // адрес сервера 
      "cluster_address": "[::]:8201", // адрес для взаимодествия
                                      // с другими серверами vault
                                      // внутри vault кластера.
                                      // В нашем случае указывать его
                                      // не обязательно, так как у 
                                      // нас не кластер, а один 
                                      // сервер vault.

      "tls_disable": "false", // включает TLS 
                              // (по дефолту оно и так включено, тут
                              // указано для наглядности)
      "tls_cert_file": "/vault/tls/unseal-vault.crt", // tls сертификат 
                                                      // сервера
      "tls_key_file": "/vault/tls/unseal-vault.key", // ключ от tls
                                                     // сертификата сервера
      "tls_client_ca_file": "/vault/tls/ca.crt", // сертификат CA
                                                 // для проверки клиентских
                                                 // сертификатов (все
                                                 // клиентские сертификаты
                                                 // должны быть подписаны им)
      "tls_require_and_verify_client_cert": "true" // включает проверку
                                                   // клиентских сертификатов
                                                   // по указанному выше CA
    }
  },

  "ui": false, // отключение ui
  "disable_mlock": true // отключение memory-lock необходимо
                        // для vault серверов, использующих 
                        // интегрированное хранилище, как этот
}
```
#### 2.4 Запуск

Командой `docker compose up -d` запускаем контейнер. После запуска проверяем статус vault'а в контейнере `docker exec -it vault vault status`. 

:::tip В случае возникновения ошибок смотреть логи в `docker logs vault`
:::
### 3. Инициализация 

С помощью vault operator'а можно инициализировать vault, задав кол-во ключей, на которые алгоритмом Шамира разобьётся ключ шифрования данных vault'a. Эти ключи будут использоваться для ручного распечатывания.

```sh
docker exec -it vault vault operator init \  
-key-shares=4 \  # кол-во ключей шамира
-key-threshold=2 \  # необходимок кол-во ключей для распечатывания
-format=json > vault-unseal-keys.json # файл, в который будут сохранены ключи
```

:::tip Полученный файл с ключами будет выглядеть примерно вот так:

```json
{  
"unseal_keys_b64": [  
  "4Wm5BYsNal+zMbsb3ewNbi6zLtKIOXz3L+NFX7jw0/3T",  
  "miasg31FmPJqx9LrnPaVEuG639fvjAqZF3gp4ZlKw+wK",  
  "EyVw9nQH/T+3zsa4HbPJ2s15l6B5MizMKQlKqs9taFzX",  
  "zc7eU9MEvy9AaV4FPSQe7Jla2LcqSjS8KNPFDlQs0Rcg"  
],
"unseal_keys_hex": [  
  "e169b9058b0d6a5fb331...",  
  "9a26ac837d4598f26ac7...",  
  "132570f67407fd3fb7cec...",  
  "cdcede53d304bf2f4069..."  
],
"unseal_shares": 4,  
"unseal_threshold": 2,  
"recovery_keys_b64": [],  
"recovery_keys_hex": [],  
"recovery_keys_shares": 0,  
"recovery_keys_threshold": 0,  
"root_token": "hvs.NbXRWfYNI4PmA860aBlC4onU"
}	
```
:::
### 4. Создание транзитного ключа

Транзитный ключ будет использоваться для шифрования ключей vault'ов, которые будут распечатываться с Unseal-Vault'а. 

:::info Все последующие операции будут проводиться внутри контейнера. Чтобы туда попасть введите `docker exec -it vault /bin/sh`
:::
#### 4.1 Распечатайте vault

```sh
vault operator unseal
```
#### 4.2 Авторизуйтесь, используя `root_token`

```sh
vault login
```
#### 4.3 Создайте transit secret

```sh
vault secrets enable transit  
vault write -f transit/keys/autounseal
```

#### 4.4 Создайте policy для будущего токена

```sh
vault policy write autounseal -<<EOF
path "transit/encrypt/autounseal" {
  capabilities = [ "update" ]
}

path "transit/decrypt/autounseal" {
  capabilities = [ "update" ]
}
EOF
```

#### 4.5 Создайте Auto-unseal token

```sh
vault token create -orphan -policy=autounseal -period=24h  
```

:::tip Полученный токен будет выглядеть вот так:

```
Key                 Value  
token               hvs.CAESIP_A7TaC9kt4yUeqg... 
token_accessor      wkTM4nsF0ehkRvIuBD9cedHC  
token_duration      24h  
token_renewable     true  
token_policies      ["autounseal" "default"]  
identity_policies   []  
policies            ["autounseal" "default"]
```
:::

:::warning Вы должны сохранить значение `token`
Именно его вы будете указывать в настройке автоматического распечатывания в вашем vault.
:::



 