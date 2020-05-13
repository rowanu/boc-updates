const AWS = require('aws-sdk')

const client = new AWS.DynamoDB.DocumentClient({
  params: { TableName: process.env.ACTIVE_TABLE_NAME },
})
const log = data => console.log(JSON.stringify(data))

const query = async function(source) {
  const params = {
    KeyConditionExpression: '#pk = :source',
    ExpressionAttributeValues: { ':source': source },
    ExpressionAttributeNames: { '#pk': 'PK' },
  }
  return await client.query(params).promise()
}

const handler = async event => {
  log(event)
  // TODO: Get sources from DB
  // TODO: Get items by source
  const response = await query('Recent Announcements')
  // TODO: Return merged/sorted items
  // TODO: Remove DDB fields e.g. PK, SK
  return response.Items
}

exports.handler = handler

if (require.main === module) {
  handler()
}
