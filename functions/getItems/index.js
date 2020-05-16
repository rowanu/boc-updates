const AWS = require('aws-sdk')

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

const cleanItem = raw => raw

const handler = async event => {
  log(event)
  const {
    Item: {
      sources: { values: sources },
    },
  } = await getSources()
  console.log(sources)
  let items = []
  for (const source of sources) {
    const response = await query(source)
    items = items.concat(response.Items)
  }
  // TODO: Sort items?
  // TODO: Remove DDB fields e.g. PK, SK
  return items
}

exports.handler = handler
exports.cleanItem = cleanItem

if (require.main === module) {
  handler()
}
