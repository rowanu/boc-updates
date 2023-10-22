const { handler, cleanItem } = require('../../../functions/getItems')
import { describe, expect, it, vi } from 'vitest';

describe('getItems', () => {
  it('has a handler', () => {
    expect(typeof handler).toEqual('function')
  })

  describe('item', () => {
    it('does not have PK or SK', () => {
      const rawItem = {
        publishedAt: '2020-05-04T18:01:43.000Z',
        SK: '07e6cd546b778ac3fa8ea26bcc520740c2682deb',
        source: 'Recent Announcements',
        link:
          'https://aws.amazon.com/about-aws/whats-new/2020/05/amazon-codeguru-profiler-announces-availability-of-hourly-recommendation-reports-to-remediate-issues-quickly/',
        PK: 'Recent Announcements',
        title:
          'Amazon CodeGuru Profiler announces availability of hourly recommendation reports to remediate issues quickly',
        type: 'blog',
      }
      const item = cleanItem(rawItem)
      expect(item.PK).toEqual(undefined)
      expect(item.SK).toEqual(undefined)
    })
  })
})
