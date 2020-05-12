const index = require('@/../functions/scrapeBlogRss')

describe('readFeed', () => {
  it('has a handler', () => {
    expect(typeof index.handler).toEqual('function')
  })

  describe('parseItemsFrom', () => {
    it('converts a AmazonWebServicesBlog feed item to a DDB item', () => {
      const feed = require('./AmazonWebServicesBlog-feed.json')
      const item = index.parseItemsFrom(feed, 'AWS Blog')[0]
      expect(item.PK).toEqual('AWS Blog')
      expect(item.SK).toEqual('0807049d9e50dea66c3359632c2c4d8a7b39d360')
      expect(item.title).toEqual(
        'Amazon Elastic Container Service now supports Amazon EFS file systems'
      )
      expect(item.link).toEqual(
        'http://feedproxy.google.com/~r/AmazonWebServicesBlog/~3/hjCNPaKz364/'
      )
      expect(item.publishedAt).toEqual('2020-04-08T20:00:19.000Z')
      expect(item.source).toEqual('AWS Blog')
      expect(item.type).toEqual('blog')
    })
    it("converts a What's New feed item to a DDB item", () => {
      const feed = require('./WhatsNewWithAWS-feed.json')
      const item = index.parseItemsFrom(feed, 'Recent Announcements')[0]
      expect(item.PK).toEqual('Recent Announcements')
      expect(item.SK).toEqual('9d83647a29a8d0ab99fb13192de1f46b12f26389')
      expect(item.title).toEqual(
        'Amazon SageMaker now supports ml.g4dn and ml.c5n instances for ML model training'
      )
      expect(item.link).toEqual(
        'https://aws.amazon.com/about-aws/whats-new/2020/04/amazon-sagemaker-now-supports-ml-g4dn-and-ml-c5n-instances-for-ml-model-training/'
      )
      expect(item.publishedAt).toEqual('2020-04-17T17:54:52.000Z')
      expect(item.source).toEqual('Recent Announcements')
      expect(item.type).toEqual('blog')
    })
  })
})