---
title: Использование crictl
id: container-runtime-info
---

`crictl` – это cli для управления container runtime'ов совместимых с CRI. Его очень удобно использовать для мониторинга контейнеров и образов в вашем используемом runtime'е.

:::tip
Если по каким-то причинам kube-apiserver временно не доступен, то можно использовать `crictl`, чтобы хоть как-то управлять контейнерами.
:::

::::info Как установить?

Скачать `crictl` можно на странице релизов репозитория cri-tools. 
:::note https://github.com/kubernetes-sigs/cri-tools/releases
:::

::::

___

:::warning
Вам может понадобиться указать runtime endpoint.

Пример:
```sh
crictl -r unix:///run/containerd/containerd.sock ps -a
```

Чтобы каждый раз это не вводить лучше сохранить endpoint в конфиг:
```
crictl config --set runtime-endpoint=unix:///run/containerd/containerd.sock
crictl config --set image-endpoint=unix:///run/containerd/containerd.sock
```
:::

### Основные команды:

1. `crictl images` – просмотр скаченных образов
2. `crictl ps -a` – просмотр контейнеров
3. `crictl logs <ContainerID>` – просмотр логов контейнера 
3. `crictl exec -it <ContainerID> /bin/sh` – запуск shell внутри контейнера

:::tip
Для просмотра всех команд: `crictl -h`
:::