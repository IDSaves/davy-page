---
id: k8s-install-and-use-certmanager
title: Установка и использование Cert-Manager в K8S
---

### 1. Установка
:::tip 
Лучше тутора нет  https://cert-manager.io/docs/installation/kubectl/
:::
### 2. Создание Issuer'а

:::warning Внимание
В `Kind` указывайте `ClusterIssuer` если необходимо, чтобы Issuer был доступен во всех namespace'ах и `Issuer` если он нужен только в конкретном. В случае с `Issuer` дополнительно указывайте и `namespace`, в котором вы его создадите.
:::
#### 2.1 Вариант с LetsEncrypt'ом

После создания нижеуказанного Issuer'а, Cert-Manager сможет автоматически генерировать и обновлять сертификаты для нужных Ingress Rules.

```yml
apiVersion: cert-manager.io/v1
kind: ClusterIssuer 
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: <ВАША ПОЧТА>
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
      - http01:
          ingress:
            ingressClassName: nginx
```

:::warning Внимание
В `IngressClassName` указывайте ClassName нужного вам ingress контроллера. В нашем случае указан class Ingress-Nginx контроллера. Список всех существующих в кластере class'ов ingress можно посмотреть командой `kubectl get IngressClass`
:::

#### 2.2 Вариант c собственным CA

В отличие от варианта с использованием LetsEncrypt тут дополнительно необходимо создать секрет с публичным и приватным ключами вашего CA.

:::tip 
Как создавать CA описано тут – [Создание CA сертификатов](../TLS/CA-certs)
:::

```yml
apiVersion: v1
kind: Secret
metadata:
  name: vault-ca
  namespace: vault
data:
  tls.crt: LS0tLS1CRUdJTiBDRVJ...
  tls.key: LS0tLS1CRUdJTiBSU0EgUF...
---
apiVersion: cert-manager.io/v1
kind: Issuer
metadata:
  name: vault-ca
  namespace: vault
spec:
  ca:
    secretName: vault-ca
```

### 3. Создание и получение сертификата

#### 3.1 Автоматическая генерация сертификатов для Ingress

Cert-Manager может автоматически генерировать сертификаты из правил Ingress и обновлять их. 

Единственное, что нужно будет сделать – это указать Issuer, которые будет использоваться для управления сертификатом. Делается это можно путём добавления аннотации `cert-manager.io/cluster-issuer: "IssuerName"` в случае если вы указываете `kind: ClusterIssuer`, и `cert-manager.io/issuer: "IssuerName"` в случае если указываете обычный `kind: Issuer`.

:::tip Пример
```yml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: service-ingress
  namespace: vault
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - service.davy.page
    secretName: service-tls # Cert-Manager создаст этот секрет автоматически
  rules:
  - host: service.davy.page
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: service-name
            port:
              number: 8200
```
::: 
#### 3.2 Сертификат для других целей

Если вам необходимо:
- создать сертификат, чтобы обезопасить общение сервисов друг с другом
- генерировать личные сертификаты для администраторов

То, вам подойдет способ, заключающийся в создание отдельного ресурса для сертификата. Вы сможете указать все возможные параметры будущего сертификата, и Cert-Manager создаст его, положит в секрет и будет автоматически обновлять.

:::tip Пример
```yml
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: service-cert
  namespace: service
spec:
  secretName: service-tls
  duration: 2160h # 90d
  renewBefore: 360h # 15d
  commonName: service
  isCA: false
  privateKey:
    algorithm: RSA
    encoding: PKCS1
    size: 2048
  usages:
    - server auth
    - client auth
  dnsNames:
    - service.service
  ipAddresses:
    - 127.0.0.1
  issuerRef:
    name: custom-ca
    kind: Issuer
```
:::