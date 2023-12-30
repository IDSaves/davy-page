---
id: k8s-install-and-configure-metallb
title: Установка и настройка балансера MetalLB в K8S
---

### **1.** Установка 

:::tip Туториал
https://metallb.universe.tf/installation/
:::

:::danger Важно
Если MetalLB не будет запускаться из-за ошибки "отсутствует секрет memberlist", то создайте его вручную этой командой:
 
```sh
kubectl create secret generic -n metallb-system memberlist --from-literal=secretkey="$(openssl rand -base64 128)"
```
:::

### **2.** Создаём pool IPшников, которые MetalLB будет назначать сервисам с типом LoadBalancer.

```yaml
apiVersion: metallb.io/v1beta1
kind: IPAddressPool
metadata:
  name: pool-name
  namespace: metallb-system
spec:
  addresses:
  - 192.168.0.2/24
  avoidBuggyIPs: true
```

:::tip
Если вам нужно указать в адреса только один адрес, то используйте `/32`
:::

:::tip
По дефолту MetalLB будет назначать всем сервисам без разбора адреса указанные в Pool'е. Если вы хотите назначать определённые адреса определённым сервисам, то вам нужно добавить селектор.

```yml
...
spec:
	...
	serviceAllocation: 
		# Нужна для решения ситуаций, когда 
		# сервису подходят айпишники из двух пулов.
		# Выберется пул с наивысшим приоритетом
		priority: 50
		
		# указание конкретных неймспейсов
		namespaces:
			 - namespace-a
			 - namespace-b
		
		# селект namespace'ов по их лейблам 
		- namespaceSelectors: 
			- matchLabels: 
				foo: bar 

		# селект сервисов по лейблам
		serviceSelectors: 
			- matchExpressions: 
				- { key: app, operator: In, values: [bar] }
``` 
:::