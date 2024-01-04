---
title: Автоматизация создания и удаления пользователей
id: auto-create-delete-user
---

:::info Все описания плейбуков в комментах
:::

## Создание

```yaml
- name: Create User
  hosts: some_host
  gather_facts: false
  vars:
    # Поместит содержимое файла в переменную
    user_ssh_public_key: "{{ lookup('file', 'user_key.pub') }}"
  # Перед запуском запрашиваем имя и 
  # группу для будущего пользователя (группу можно не указывать)
  vars_prompt:
    - name: username
      prompt: User to create
      private: false
    - name: group
      prompt: User's group
      private: false
      default: ""
  tasks:
    # Проверяем существует ли такой пользователь уже
    - name: "Check if user is already exists"
      ansible.builtin.command: "id {{ username }}"
      register: user_check_result
      # Команда ничего не меняет, поэтому ставим false
      changed_when: false
      # Ставим ignore_errors, потому что в случае если такого юзера нет, 
      # то мы получим ошибку и без ignore_errors выполнение плейбука остановится
      ignore_errors: true 
    - name: "Execute useradd"
      # Создаём юзера через useradd и проставляем ему заданную группу есть есть
      ansible.builtin.command: 'useradd -m {{ "-g %s" % group if group else "" }} {{ username }}'
      # Выполняем только если такого юзера не существует
      when: user_check_result.rc == 1 
      register: useradd_result
      # Проверяем return code результата. (0 значит успешно)
      changed_when: useradd_result.rc == 0
    # Создаём папку в которой будет лежать файл с 
    # доверенными публичными ключами для подключения по ssh
    - name: Creating .ssh dir
      ansible.builtin.file:
        path: '/home/{{ username }}/.ssh'
        state: directory
        owner: '{{ username }}'
        group: '{{ group if group else username }}'
        # даём владельцу правка на чтение, запись, 
        # выполнение и у всех остальных забираем
        mode: '700'
    # Добавляем наш ключ пользователя в файл ~/.ssh/authorized_keys
    - name: "Insert ssh cert"
      ansible.builtin.copy:
        dest: '/home/{{ username }}/.ssh/authorized_keys'
        content: '{{ user_ssh_public_key }}'
        # даём владельцу права на чтение и запись,
        # всем остальным только на чтение
        mode: '644'
        owner: '{{ username }}'
        group: '{{ group if group else username }}'
```

## Удаление

```yaml
- name: Delete User
  hosts: some_host
  gather_facts: false
  # Перед запуском запрашиваем 
  # имя пользователя для удаления
  vars_prompt:
    - name: username
      prompt: User to delete
      private: false
  tasks:
    # Проверяем если такого пользователя и так нет
    - name: "Check if user is not exists"
      ansible.builtin.command: "id {{ username }}"
      register: user_check_result
      # Команда ничего не меняет, поэтому ставим false
      changed_when: false
    # Проверяем если пользователь приконнекчен к серверу
    - name: "Check if user is currently connected"
      ansible.builtin.shell:
        cmd: "set -o pipefail && who -u | grep '{{ username }}' | wc -l"
        executable: /bin/bash
      register: user_connections_check_result
      # Команда ничего не меняет, поэтому ставим false
      changed_when: false
      ignore_errors: true
    # Обрываем все подключения пользователя
    - name: "Delete connections"
      ansible.builtin.shell:
        cmd: "set -o pipefail && who -u | grep '{{ username }}' | awk '{ print $6 }' | kill -HUP $(xargs)"
        executable: /bin/bash
      # Выполняем таску только если предыдущая 
      # вернула больше нуля подключений
      when: user_connections_check_result.stdout != '0'
      register: user_connections_delete_result
      # Проверяем return code результата. (0 значит успешно)
      changed_when: user_connections_delete_result.rc == 0
    # Удаляем пользователя вместе с его /home/username директорией
    - name: "Execute userdel"
      ansible.builtin.command: "userdel -f -r {{ username }}"
      register: userdelete_result
      # Проверяем return code результата. (0 значит успешно)
      changed_when: userdelete_result.rc == 0
```