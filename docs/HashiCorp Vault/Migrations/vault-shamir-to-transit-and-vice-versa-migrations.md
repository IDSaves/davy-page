---
id: vault-shamir-to-transit-and-vice-versa-migrations
title: '"shamir to transit" unseal (и наоборот)'
---

### "shamir to transit"

Для миграции "shamir to transit" достаточно:
1. В конфиг добавить `seal "transit"` блок
2. Выполнить команду `vault operator unseal -migrate`

:::tip Пример добавленного блока `seal "transit"`
 
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
:::
### "transit to shamir"

Для миграции "shamir to transit" достаточно:
1. В конфиге блоку `seal "transit"` добавить `disabled: true`
2. Выполнить команду `vault operator unseal -migrate`

:::tip Пример обновлённого блока `seal "transit"`

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
...
```