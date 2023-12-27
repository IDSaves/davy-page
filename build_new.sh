VERSION=$(npm version patch --no-git-tag-version)
docker build -t cr.selcloud.ru/davy/davy-page:$VERSION .
docker push cr.selcloud.ru/davy/davy-page:$VERSION