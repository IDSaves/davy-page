---
id: helm-tips
title: Подсказки к Helm
---

### 1. Смена контекста kubectl перед установкой чарта
Перед тем как устанавливать чарт в какой-либо namespace - выставьте его в текущем контексте kubectl командой `kubectl config set-context --current --namespace=<namespace>`. Иначе могут возникнуть проблемы с установкой.

### 2. Обновления значений у релиза

:::info Пример с обновлением конкретных значений:
```sh
helm upgrade prometheus prometheus-community/kube-prometheus-stack \
  --namespace prometheus  \
  --set prometheus.prometheusSpec.podMonitorSelectorNilUsesHelmValues=false \
  --set prometheus.prometheusSpec.serviceMonitorSelectorNilUsesHelmValues=false
```
:::

:::info Пример с обновлением всех значений с помощью файла:
```sh
helm upgrade prometheus prometheus-community/kube-prometheus-stack \
  --namespace prometheus  \
  -f values.yml
```
:::

### 3. Просмотр значений релиза

:::info Пример:
```sh
helm get values ingress-nginx --namespace ingress-nginx
```
:::

### 4. Просмотр всех возможных значений чарта

:::info Пример:
```sh
helm show values ingress-nginx/ingress-nginx
```
:::