# updates

## Deploy

### Site

```
NODE_ENV=production npm run build
API=<ENDPOINT_URL> ./inject-env.sh
```

Set cache control on `index.html`:

```
aws s3 cp s3://<BUCKET>/updates/index.html s3://<BUCKET>/updates/index.html --metadata-directive REPLACE --cache-control no-cache`
```

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Run your unit tests
```
npm run test:unit
```

### Lints and fixes files
```
npm run lint
```
