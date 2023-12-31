---
title: Создание и удаление юзеров
id: create-delete-user
---

:::info Также рекомендуется к прочтению [Пример: автоматизация создания и удаления пользователей linux](/docs/Ansible/auto-create-delete-user)
:::

## Создание пользователя

### 1. Создание учетной записи

:::warning Внимание
Перед тем, как создавать учетную запись, загляните в файл /etc/default/useradd. В нём будут храниться дефолтные значения, которые будут заданы вашему пользователю при создании.

Очень важно поменять значение `SHELL` на `/bin/bash` для более удобной работы с shell:
```sh
...
SHELL=/bin/bash
...
```
:::

```sh
useradd -m -g sudo username
```

- `-m` – Создаст для юзера домашнюю папку в директории `/home/` (меняется в `/etc/default/useradd`)
- `-g sudo` – Задаст юзеру группу `sudo`

### 2. Указание пароля

:::info 
Этот шаг необязательный
:::

Нужно для того, чтобы:
- user мог подключиться к серверу по ssh с паролем (**это не безопасно**)
- user мог запускать с судо команды, требующие пароля

```sh
passwd username
```

### 3. Выставление trusted сертификата для входа по ssh

:::info 
Этот шаг, как и предыдущий необязательный, но **крайне рекомендованый**.
:::

Для того, чтобы наш user мог подключаться к серверу не вводя пароль (лучше вообще вход по паролю отключите в `/etc/ssh/sshd_config`), ему в его домашнюю директорию нужно добавить файл `~/.ssh/authorized_keys` и на первой строке прописать публичный ключ user'а. 

После этого user сможет подключаться к серверу через
```sh
ssh username@server
```

## Удаление пользователя

### 1. Проверяем если у юзера открыты сессии и убиваем их

Выводим следующей командой все процессы, относящиеся к подключениям нужного нам юзера.
```sh
who -u | grep username
```

Если подключения есть, то убиваем их командой:
```sh
kill -HUP id1 id2 id3...
```

:::info
Всё вышеперечисленное можно сделать одной командой:
```sh
who -u | grep username | awk '{ print $6 }' | kill -HUP $(xargs)
```
:::

### 2. Удаляем учетную запись

```sh
userdel -r username
```
- `-r` – также удаляет и домашнюю директорию пользователя 