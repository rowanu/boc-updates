const AWS = require('aws-sdk')

const maxAgeSeconds = 1800 // 30 minutes

const client = new AWS.DynamoDB.DocumentClient({
  params: { TableName: process.env.ACTIVE_TABLE_NAME },
})
const log = data => console.log(JSON.stringify(data))

const getSources = async function() {
  const params = {
    Key: {
      PK: 'SOURCES',
      SK: 'SOURCES',
    },
  }
  return client.get(params).promise()
}

const query = async function(source) {
  const params = {
    KeyConditionExpression: '#pk = :source',
    ExpressionAttributeValues: { ':source': source },
    ExpressionAttributeNames: { '#pk': 'PK' },
  }
  return client.query(params).promise()
}

const cleanItem = ({ link, publishedAt, source, title, type }) => ({
  link,
  publishedAt,
  source,
  title,
  type,
})

const handler = async event => {
  log({ event })
  const {
    Item: {
      sources: { values: sources },
    },
  } = await getSources()
  log({ sources })
  let items = []
  for (const source of sources) {
    const response = await query(source)
    items = items.concat(response.Items)
  }
  const payload = {
    statusCode: 200,
    isBase64Encoded: false,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': `max-age=${maxAgeSeconds}`,
    },
    body: JSON.stringify(items.map(cleanItem)),
  }
  log({ payload })
  return payload
}

exports.handler = handler
exports.cleanItem = cleanItem

if (require.main === module) {
  handler()
}
