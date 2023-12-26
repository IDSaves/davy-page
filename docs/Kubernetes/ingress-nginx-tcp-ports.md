---
title: Вывод конкретных портов из ingress-nginx
id: ingress-nginx-tcp-ports
---

Если вам понадобится выводить сервисы на конкретные порты из кластера, а не на домен или path домена (**например вывести порт для postgresql**), то вам нужно будет выполнить следующие действия:

1. Создать ConfigMap для ingress-nginx описывающий порты и tcp сервисы, которые будут открываться.
**Пример конфига `tcp-services`** 
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: tcp-services
  namespace: ingress-nginx # обязательно создаём в том же неймспейсе
              						 # в котором создан и сам контроллер  
data:
  5432: "sobes/db-service:5432"
       # <namespace>/<service-name>:<service-port>
```
2. Указать имя созданного конфига в deployment файле `ingress-nginx-controller`.
	Формат `<namespace>/<configmap-name>` ![ingress-nginx-conf-example](./img/ingress-nginx-conf-example.png)
3. Указать порты LoadBalancer сервису `ingress-nginx-controller` 
	![ingress-nginx-conf-example-2](./img/ingress-nginx-conf-example-2.png)