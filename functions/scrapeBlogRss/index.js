const AWS = require("aws-sdk");
const Parser = require("rss-parser");

const client = new AWS.DynamoDB.DocumentClient({
  params: { TableName: process.env.ACTIVE_TABLE_NAME },
});
const log = (data) => console.log(JSON.stringify(data));
const parser = new Parser();

const sortByPublishedAt = (items) =>
  items
    .slice()
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

const getFeedItems = async (url) => {
  const feed = await parser.parseURL(url);
  return feed.items;
};

const parseItemsFrom = (feed, source, type) => {
  const expiresAt = Math.floor(+new Date() / 1000) + 1209600; // 2 weeks
  return feed.map(({ isoDate, guid, title, link }) => ({
    PK: source,
    SK: guid,
    expiresAt,
    link: link,
    publishedAt: isoDate,
    source,
    title: title,
    type: type,
  }));
};

const put = async function (Item) {
  log(Item);
  const params = { Item };
  return client.put(params).promise();
};

const updateSources = async function (source) {
  const params = {
    Key: { PK: "SOURCES", SK: "SOURCES" },
    UpdateExpression: "ADD #sources :source",
    ExpressionAttributeNames: {
      "#sources": "sources",
    },
    ExpressionAttributeValues: { ":source": client.createSet(source) },
  };
  return client.update(params).promise();
};

const handler = async (event) => {
  log(event);
  for (const source of event.sources) {
    await updateSources(source.name);
    const feed = await getFeedItems(source.url);
    const items = parseItemsFrom(feed, source.name, source.type);
    const sorted = sortByPublishedAt(items);
    // NOTE: These puts could easily be done in parallel, but no need
    // TODO: Make this an environment variable
    for (const item of sorted.slice(0, 50)) {
      const response = await put(item);
      log(response);
    }
  }
};

exports.handler = handler;
exports.parseItemsFrom = parseItemsFrom;
exports.sortByPublishedAt = sortByPublishedAt;
