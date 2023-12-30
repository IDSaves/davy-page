---
id: k8s-master-node-deploy
title: ⚡️ Развёртывание мастер ноды
sidebar_position: 2
---

### 1. Перед началом прописать это:
```sh
modprobe br_netfilter

echo 1 > /proc/sys/net/bridge/bridge-nf-call-iptables
echo 1 > /proc/sys/net/ipv4/ip_forward

sudo sysctl -p
```
### 2. Устанавливаем containerD
:::info Как это сделать – https://github.com/containerd/containerd/blob/main/docs/getting-started.md
:::
### 3. Настраиваем containerD
#### 3.1 Заменяем файл `/etc/containerd/config.toml` на дефолтный
```sh
containerd config default > /etc/containerd/config.toml
```
#### 3.2 Находим в файле `/etc/containerd/config.toml` директиву `SystemdCgroup` и ставим ей `true`
#### 3.3 Рестартим containerD командой `systemctl restart containerD`

### 6. Устанавливаем kubectl, kubeadm и kubelet 
:::info Как это сделать – https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/install-kubeadm/#installing-kubeadm-kubelet-and-kubectl
:::

### 7. Инитим мастер ноду через kubeadm

:::warning Обазательно указываем cidr для подов в кластере
:::

```sh
kubeadm init --pod-network-cidr=10.244.0.0/16
```

### 8.1 Устанавливаем addon для pod network'a Cilium 

:::info Как это сделать – https://docs.cilium.io/en/stable/gettingstarted/k8s-install-default/
:::

### (ВТОРОЙ ВАРИАНТ) 8.2 Устанавливаем addon для pod network'а Calico

:::info Как это сделать – https://docs.tigera.io/calico/latest/getting-started/kubernetes/quickstart#install-calico
:::

:::warning ВАЖНО! 
 Перед установкой addon'а **Calico** нужно указать в спеке yaml установщика cidr, указанный при создании ноды. 
 ```
 ...
 calicoNetwork:
  ipPools:
    - ...
      cidr: 192.168.0.0/16
 ...
```
:::
___

:::danger Все последующие шаги – **не обязательны**
:::
___
### 9. Устанавливаем MetalLB (LoadBalancer)

:::info Как это сделать – [Установка и настройка балансера MetalLB](/docs/Kubernetes/Installations/k8s-install-and-configure-metallb)
:::
### 11. Устанавливаем ingress-nginx controller

:::info Как это сделать – https://kubernetes.github.io/ingress-nginx/deploy
:::