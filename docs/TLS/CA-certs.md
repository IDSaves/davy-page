---
title: Создание CA сертификатов
id: CA-certs
---

### 1. Создаём **private key** 

Команда:
```sh
openssl genrsa -out ca.key 2048
```
### 2. Создаём **CSR** файл или **Certificate Signing Request**

:::tip
**Certificate Signing Request (CSR)** это файл со всеми деталями будущего сертификата, но без подписи
:::

Команда: 
```sh
openssl req -new -key ca.key -subj "/CN=YOUR-CA" -out ca.csr
```
### 3. Подписываем сертификат своим приватным ключём

Создаём файл с X.509 конфигурацией для сертификата.
```hcl
# v3-ext

# Обязательные значения для CA
basicConstraints = CA:TRUE
keyUsage = keyCertSign
```

Команда: 
```sh
openssl x509 -req \
	-in ca.csr \ 
	-signkey ca.key \
	-out ca.crt \
	-days "500" \
	-extfile v3-ext.cnf # созданный ранеее файл
```

Получаем самоподписанный сертификат или **public key**.