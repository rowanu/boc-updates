# updates

## Deploy

### Site

1. Build the site
1. Inject configuration variables
1. Sync the site contents
1. Update the `cache-control` on `index.html`

```
NODE_ENV=production npm run build
export API=<ENDPOINT_URL>
sed -i "s~INSERT_API~${API:-API_NOT_SET}~g" dist/index.html
aws s3 sync dist/ s3://$SITE_BUCKET/updates/
aws s3 cp s3://$SITE_BUCKET/updates/index.html \
  s3://$SITE_BUCKET/updates/index.html --metadata-directive REPLACE --cache-control no-cache
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
