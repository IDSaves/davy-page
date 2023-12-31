---
id: vault-file-to-raft-migration
title: '"file" storage (non-HA) to "raft" storage (HA)'
---

:::warning
Всё показанное ниже описано для vault'а находящегося в кластере k8s. Однако, немного поправив, этот гайд можно также проводить миграции и для vault'ов, находящихся в других окружениях. 
:::

:::danger Внимание
Крайне рекомендуется переда началом миграции сделать бэкап вашего volume'а, в котором хранятся данные текущего vault сервера.
:::

#### 1. Создайте миграционный файл

```hcl
storage_source "file" {
  path = "ПУТЬ ДО ВАШЕГО ТЕКУЩЕГО ХРАНИЛИЩА"
}

storage_destination "raft" {
  path = "ПУТЬ ДО ВАШЕГО ТЕКУЩЕГО ХРАНИЛИЩА"
}

# Адрес vault'а, который другые узлы vault кластера будут использовать для поиска "лидирующего" vault'а и подключения к нему.
cluster_addr = "https://vault-0.vault-internal:8201"
```
#### 2. Поместите файл внутрь пода

Это можно прямо в контейнере создайте файл через `kubectl exec -it vault-0 -- /bin/sh`, либо если нет доступа к созданию файлов, прокиньте файл в под через ConfigMap.
#### 3. Выполните миграцию

```sh
kubectl exec -it vault-0 -- vault operator migrate -config=migrate.hcl
```
#### 4. Поправьте конфиг

Удалите из конфига старый блок `storage "file"` и добавьте новый `storage "raft"`.

```hcl
storage "raft" {
  path = "Путь до хранилища"
  
  # Автоматическое присоединение к кластеру Vault.
  # Укажите тут все ваши поды кластера, для того чтобы при 
  # запуске пода, его сервер мог присоединиться к кластеру через 
  # лидирующий узел.
  retry_join {
    leader_api_addr = "https://vault-0.vault-internal:8200"
    leader_ca_cert_file = "/vault/tls/ca.crt"
    
    # В нашем случае у всех подов будет один и тот же сертификат.
    # Но по хорошему для каждого создавать отдельный.
    leader_client_cert_file = "/vault/tls/tls.crt"
    leader_client_key_file = "/vault/tls/tls.key"
  }
}
```

Перезапустите под.
#### 5. Увеличьте кол-во реплик vault серверов

:::warning При необходимости предварительно создайте для каждой новой реплики PV. 
:::

```shell
kubectl scale statefulsets <stateful-set-name> --replicas=<new-replicas>
```

Если у вас не настроено автоматической распечатывание vault'ов, то после увеличения реплик до нужного кол-ва и запуска каждой из них необходимо каждую распечатать.

Далее поднятые сервера автоматически подключатся к vault кластеру.