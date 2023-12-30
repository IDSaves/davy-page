---
id: k8s-install-prometheus-with-graphana
title: Установка Prometheus и Graphana в K8S
tags: 
  - Prometheus
---

### 1. Добавление репозитория Helm

```sh
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
```
```sh
helm repo update
```

### 2. Создаём namespace

```sh
kubectl create namespace monitoring
```

### 3. Создаём файл с конфигурацией

По дефолту Prometheus может находить ServiceMonitors и PodMonitors только в рамках namespace'а, в котором находится, поэтому если в будущем вы планируете (а это скорее всего так) использовать (Service|Pod)Monitors из других namespace'ов, то я рекомендую добать следующие значения в конфигурацию релиза Helm.

```yml title="values.yml"
prometheus:
  prometheusSpec:
    podMonitorSelectorNilUsesHelmValues: false
    serviceMonitorSelectorNilUsesHelmValues: false
```

### 4. Устанавливаем чарт

```sh
helm install kube-prom-stack prometheus-community/kube-prometheus-stack -n monitoring -f values.yml
```

### 5. Создаём Ingress для Prometheus

:::info Пример:
```yml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: graphana
  namespace: monitoring
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - graphana.service.davy.page
    secretName: graphana-tls
  rules:
  - host: graphana.service.davy.page
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: prometheus-stack-grafana
            port:
              number: 80
```
:::

### 6. Заходим в Graphana и меняем дефолтный пароль

:::tip Дефолтный учетный данные:
```
login: admin
password: prom-operator
```
:::