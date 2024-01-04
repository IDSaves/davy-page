---
title: Создание самоподписанных сертификатов
id: self-signed-certs
---

### 1. Создаём **private key** 

Команда:
```sh
openssl genrsa -out cert-private.key 2048
```
### 2. Создаём **CSR** файл или **Certificate Signing Request**

:::tip
**Certificate Signing Request (CSR)** это файл со всеми деталями будущего сертификата, но без подписи
:::

Команда:
```sh
openssl req -new \
  -key cert-private.key \ 
  -subj "/CN=DOMAIN-NAME" \ # обязательное указываем тут домен сайта, 
  -out cert-request.csr      # если предполагается, что сертификат будет
                             # использоваться для доступа к 
                             # сервису из браузера
```
### 3. Подписываем сертификат своим CA

Создаём файл с v3-ext конфигурацией для сертификата.
```c title="v3-ext.cnf"
authorityKeyIdentifier = keyid, issuer
basicConstraints = CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment

# необязательная часть
subjectAltName = @alt_names
[alt_names]
DNS.1 = DOMAIN-NAME // указываем тут доменное имя, по которому 
                    // предполагается обращаться к сертификату
                    
DNS.[2..N] = // можете указать сколько угодно 
             // дополнительных доменных имен

IP.1 = IP-ADDRESS // если надо, можно указать ip-адрес, 
          // для которого сертификат
          // так же будет валиден в браузере

IP.[2..N] = // так же как и для DNS можно указывать
            // несколько ip-адресов
```

Команда:
```sh
openssl x509 -req \
  -in cert-private.csr \
  -days "500" \ # кол-во дней, которые сертификат будет действительным
  -extfile v3-ext.cnf \ 
  -CA ca.pem \ 
  -CAkey ca.key \ 
  -out cert-public.crt

openssl x509 -req -in unseal-vault.csr -days "500" -extfile unseal-vault-v3-ext.cnf -CA ../ca.pem -CAkey ../ca.key -out unseal-vault.pem
```