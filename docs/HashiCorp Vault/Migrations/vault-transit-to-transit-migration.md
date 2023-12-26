---
id: vault-transit-to-transit-migration
title: '"transit" unseal to "transit" unseal'
---

Для миграции с транзита на другой транзит нужно 
1. В конфиге создать второй `seal "transit"` блок с новой конфигурацией, а старый оставить как есть, но добавить ему `disabled = "true"`. 
2. Выполнить команду `vault operator unseal -migrate`. После этого удалить из конфига старый транзит и перезапустить vault сервер.

:::tip Пример 
 
Меняем с:
```hcl
 ...
seal "transit" {
  address = "https://UNSEAL-VAULT-HOST"
  token = "TOKEN"
  disable_renewal = "false"
  key_name = "autounseal"
  mount_path = "transit/"
} 
...
```
 
На:
```hcl
...
seal "transit" {
  disabled = "true"
  address = "https://UNSEAL-VAULT-HOST"
  token = "TOKEN"
  disable_renewal = "false"
  key_name = "autounseal"
  mount_path = "transit/"
} 

seal "transit" {
  address = "https://NEW-UNSEAL-VAULT-HOST"
  token = "TOKEN"
  disable_renewal = "false"
  key_name = "autounseal"
  mount_path = "transit/"
} 
...
``` 
:::