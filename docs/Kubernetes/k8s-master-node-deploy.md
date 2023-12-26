---
id: k8s-master-node-deploy
title: Развёртывание мастер ноды
---

### **1.** Перед началом прописать это:
```sh
modprobe br_netfilter

echo 1 > /proc/sys/net/bridge/bridge-nf-call-iptables
echo 1 > /proc/sys/net/ipv4/ip_forward

sudo sysctl -p
```
### **2.** Устанавливаем containerD по этому тутору: https://github.com/containerd/containerd/blob/main/docs/getting-started.md
### **3.** Удаляем файл `/etc/containerd/config.toml` и заменяем его на дефолтный вот этой командой:
```sh
containerd config default > /etc/containerd/config.toml
```
### **4.** Находим в файле `/etc/containerd/config.toml` директиву `SystemdCgroup` и ставим ей `true`
### **5.** Рестартим containerD командой `systemctl restart containerD`
### **6.** Устанавливаем kubectl, kubeadm и kubelet по этому тутору: https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/install-kubeadm/#installing-kubeadm-kubelet-and-kubectl 
### **7.** Инитим мастер ноду командой через kubeadm с указанием cidr для подов в кластере `kubeadm init --pod-network-cidr=10.244.0.0/16`
### **8.1** Устанавливаем addon для pod network'a Cilium по этому тутору https://docs.cilium.io/en/stable/gettingstarted/k8s-install-default/
###  (ВТОРОЙ ВАРИАНТ) **8.2** Устанавливаем addon для pod network'а Calico по этому тутору https://docs.tigera.io/calico/latest/getting-started/kubernetes/quickstart#install-calico

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
### **9.** Устанавливаем MetalLB (LoadBalancer)

:::tip Как это сделать рассказывается тут – [Установка и настройка балансера MetalLB](../Kubernetes/k8s-install-and-configure-metallb)
:::
### **11.** Устанавливаем ingress-nginx controller

:::tip Как это сделать рассказывается тут – https://kubernetes.github.io/ingress-nginx/deploy
:::
### **12.** Устанавливаем Cert-Manager и создаём нужные Issuer'ы

:::tip Как это сделать рассказывается тут – [Установка и использование Cert-Manager в K8S](../Kubernetes/k8s-install-and-use-certmanager)
:::
