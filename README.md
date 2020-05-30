# BigOrange.Cloud/Updates

![](diagrams-architecture.png)

### Layers

![](diagrams-layers.png)

## Deploy

### Data

Updates are stored as items in a [DynamoDB](https://aws.amazon.com/dynamodb/)
table.

```
make data.template
```

### Scrapers

```
make scrapers.template
```

### API

This site uses a [API Gateway HTTP
API](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api.html).

```
make scrapers.template
```

### Site

#### Infrastructure

```
make site.template
```

#### Application

This website follows the [Immutable Web Apps](https://immutablewebapps.org/)
standard. The steps to deploy are:

1. Build the site
1. Inject configuration variables
1. Sync the site contents
1. Update the `cache-control` on `index.html`

```
npm install
NODE_ENV=production npm run build
export API=<ENDPOINT_URL>
sed -i "s~INSERT_API~${API:-API_NOT_SET}~g" dist/index.html
aws s3 sync dist/ s3://$SITE_BUCKET/updates/
aws s3 cp s3://$SITE_BUCKET/updates/index.html \
  s3://$SITE_BUCKET/updates/index.html --metadata-directive REPLACE --cache-control no-cache
```

## Development

Environment variables are not injected in to the `index.html` in development,
they're sourced from environment variables.

To run the front-end locally:

```
VUE_APP_API=$API
npm run serve
```

### Testing

All tests (for functions and front-end) live in `/tests`:

```
npm run test:unit
npm run test:unit:watch
```
