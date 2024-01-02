---
title: Обход блокировки HashiCorp в РФ (пример для helm)
id: helm-ru-block-evasion
---

HashiCorp заблокировали доступ для своих ресурсов из России.
Чтобы это обойти достаточно на зарубежном VPS поставить nginx с вот таким конфигом:

```nginx
server {
  listen 80 default_server;
  listen [::]:80 default_server;
  server_name <ВАШ ДОМЕН>;

  location / {
    proxy_pass https://helm.releases.hashicorp.com;
    proxy_ssl_server_name on;
  }
}
```

Далее по указанному `server_name` можно спокойно отправлять запросы с российских серверов и попадать в hashicorp.

:::tip
Подобным способом через nginx можно соорудить прокси на любой нужный вам сервис.
:::

#### Способ применения

Добавляем репозиторий hashicorp
```sh
helm repo add hashicorp https://<ВАШ ДОМЕН>
```

Смотрим список всех чартов
```sh
helm search repo hashicorp
```
![helm-search-repo](./img/helm-search-repo.png)

Пытаемся установить чарт в кластер и видимо ошибку 
```sh
helm install vault hashicorp/vault --values values-file.yaml -n vault
---
Error: failed to fetch https://helm.releases.hashicorp.com/vault-0.27.0.tgz : 403 Forbidden
```

В команде установки заменяем название чарта на ссылку, в которую он стучится, и дополнительно меняем хост в этой ссылке на наше прокси
```sh
helm install vault http://<ВАШ ДОМЕН>/vault-0.27.0.tgz --values values-file.yaml -n vault
```

:::tip
Время от времени обновляем репозиторий hashicorp командой `helm repo update` для того чтобы видеть новый версии чартов.
:::
