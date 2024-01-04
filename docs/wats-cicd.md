---
id: wats-cicd
---

# CI/CD Что это?

**CI/CD – это методология разработки программного обеспечения.**

- `CI (Continious Integration)` – как можно чаще интегрируем свои изменения в основную ветку. При этом мы должны ставить задачи, как можно более гранулярно, потому что маленькие изменения легче интегрировать. 

- `CD (Continous Delivery/Deployment)`
  - `Continious Delivery` – при помощи `CI`, держим нашу рабочую ветку постоянно готовую к деплою на продакшен
  - `Continious Deployment` - автоматический деплой в production

:::info
Если у вас процесс предполагает релиз-менеджера, то у вас `Continious Delivery`. Если у вас всё, что попадает в мастер ветку, сразу оказывается на проде, то `Continious Delivery` + `Continious Deployment`.
:::

___

#### Основные CI/CD системы

1. TeamCity
2. Gitlab
3. Jenkins