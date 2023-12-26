VERSION=$(npm version patch)
docker build -t cr.selcloud.ru/davy/davy-page:$VERSION .
docker push cr.selcloud.ru/davy/davy-page:$VERSION