'use strict'

const Cookie = require('tough-cookie').Cookie
const Injector = require(global.SRC_ROOT + '/dmm/cookie-injector')
const async = require('async')
require('should')

describe('Region cookie generator', () => {

  const dmmDomainPath = ['/', '/netgame/', '/netgame_s/']

  async.forEach([
  {case: 'no cookie', input: []},
  {case: 'valid pre-existing cookie', input: [new Cookie({key: 'ckcy', value: 1}).toString()]},
  {case: 'invalid pre-existing cookie', input: [new Cookie({key: 'ckcy', value: 9999}).toString()]}
  ], item => {
    it('should revoke region restriction with ' + item.case, () => {
      const injector = new Injector(item.input, dmmDomainPath)
      const cookies = injector.revokeRegionRestriction()

      const ckcy = cookies.filter(cookie => {
        return cookie.key == 'ckcy'
      })
      ckcy.length.should.equal(dmmDomainPath.length)

      ckcy.forEach(cookie => {
        cookie.key.should.equal('ckcy')
        cookie.value.should.equal(1)
        cookie.domain.should.equal('dmm.com')
        dmmDomainPath.should.containEql(cookie.path)
      })
    })
  })

  it('should set default cookie to empty array', () => {
    const injector = new Injector()
    injector.cookies.should.deepEqual([], 'should be empty array')
  })

  it('should set default sub domain to root page', () => {
    const injector = new Injector()
    injector.subdomains.should.containEql('/')
  })
})
