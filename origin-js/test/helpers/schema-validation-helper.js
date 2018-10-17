import { expect } from 'chai'

const base64Regex = /(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)/

export const validateEvent = (event) => {
  expect(event).to.have.property('id').that.is.a('string')
  expect(event).to.have.property('blockNumber').that.is.a('number')
  expect(event).to.have.property('logIndex').that.is.a('number')
  expect(event).to.have.property('transactionIndex').that.is.a('number')
  expect(event).to.have.property('transactionHash').startsWith('0x')
  expect(event).to.have.property('blockHash').startsWith('0x')
  expect(event).to.have.property('address').startsWith('0x')
  expect(event).to.have.property('signature').startsWith('0x')
  expect(event).to.have.property('type', 'mined')
  expect(event).to.have.property('event').that.is.a('string')
  expect(event).to.have.property('returnValues').that.is.an('object')
}

export const validateListing = (listing) => {
  expect(listing).to.be.an('object')
  expect(listing).to.have.property('id').that.is.a('string')
  expect(listing).to.have.property('media').that.is.an('array')
  expect(listing).to.have.property('schemaId').that.is.a('string')
  expect(listing).to.have.property('type').that.is.a('string')
  expect(listing.type).to.equal('unit')

  expect(listing).to.have.property('category').that.is.a('string')
  expect(listing.category).to.equal('schema.forSale')
  expect(listing).to.have.property('subCategory').that.is.a('string')
  expect(listing.subCategory).to.equal('schema.forSale.mushrooms')

  expect(listing).to.have.property('title').that.is.a('string')
  expect(listing.title).to.equal('my listing')
  expect(listing).to.have.property('description').that.is.a('string')
  expect(listing.description).to.equal('my description')

  expect(listing).to.have.property('expiry')
  expect(new Date(listing.expiry).getMonth).to.be.a('function')
  expect(listing).to.have.property('price').that.is.an('object')
  expect(listing.price).to.have.property('currency', 'ETH')
  expect(listing.price).to.have.property('amount', '0.033')
  expect(listing).to.have.property('commission').that.is.an('object')
  expect(listing.commission).to.have.property('currency', 'OGN')
  expect(listing.commission).to.have.property('amount', '0')

  expect(listing).to.have.property('ipfsHash').startsWith('0x')
  expect(listing).to.have.property('depositManager').startsWith('0x')
  expect(listing).to.have.property('seller').startsWith('0x')
  expect(listing).to.have.property('status', 'active')
  expect(listing).to.have.property('offers').that.is.an('object')
  expect(listing).to.have.property('events').that.is.an('array')

  validateEvent(listing.events[0])
}

export const validateOffer = (offer) => {
  expect(offer).to.have.property('status').that.is.a('string')
  expect(offer).to.have.property('unitsPurchased').that.is.a('number')
  expect(offer).to.have.property('listingId').that.is.a('string')
  expect(offer).to.have.property('createdAt').that.is.a('number')
  expect(offer).to.have.property('schemaId').that.is.a('string')
  expect(offer).to.have.property('buyer').that.is.a('string')
  expect(offer.buyer).to.startWith('0x')

  expect(offer).to.have.property('refund', '0')
  expect(offer).to.have.property('listingType', 'unit')
  expect(offer).to.have.property('totalPrice').that.is.an('object')
  expect(offer.totalPrice).to.have.property('currency').that.is.a('string')
  expect(offer.totalPrice).to.have.property('amount').that.is.a('string')
  expect(offer).to.have.property('ipfs').that.is.an('object')
  expect(offer).to.have.property('events').that.is.an('array')

  expect(offer.ipfs).to.have.property('hash').that.is.a('string')
  expect(offer.ipfs).to.have.property('data').that.is.an('object')
}

export const validateAttestation = (attestation) => {
  expect(attestation).to.have.property('topic').that.is.a('number')
  expect(attestation).to.have.property('service').that.is.a('string')
  expect(attestation).to.have.property('data').that.is.a('string')
  expect(attestation).to.have.property('signature').that.is.a('string')
}

export const validateUser = (user) => {
  expect(user.attestations).to.be.an('array')
  expect(user).to.have.property('profile').that.is.an('object')
  expect(user.profile).to.have.property('firstName').that.is.a('string')
  expect(user.profile).to.have.property('lastName').that.is.a('string')

  expect(user.profile).to.have.property('ipfs').that.is.an('object')
  expect(user.profile).to.have.property('schemaId').that.is.a('string')
  expect(user.profile.ipfs).to.have.property('hash').that.is.a('string')
  expect(user.profile.ipfs).to.have.property('data').that.is.an('object')

  if (user.attestations.length) user.attestations.map(validateAttestation)

  if (user.profile.avatar) {
    expect(user.profile.avatar).to.be.a('string')
    expect(base64Regex.test(user.profile.avatar)).to.equal(true)
  }

  if (user.profile.description) {
    expect(user.profile.description).to.be.a('string')
  }
}

export const validateNotification = (notification) => {
  expect(notification).to.have.property('id').that.is.a('string')
  expect(notification).to.have.property('type').that.is.a('string')
  expect(notification).to.have.property('status').that.is.a('string')
  expect(notification).to.have.property('event').that.is.an('object')
  expect(notification).to.have.property('resources').that.is.an('object')

  validateEvent(notification.event)

  expect(notification.resources).to.have.property('listingId').that.is.a('string')
  expect(notification.resources).to.have.property('offerId').that.is.a('string')
  expect(notification.resources).to.have.property('listing').that.is.an('object')
}

export default function schemaValidation(type, schema) {
  switch(type) {
  case 'listing':
    return validateListing(schema)
  case 'user':
    return validateUser(schema)
  case 'attestation':
    return validateAttestation(schema)
  case 'offer':
    return validateOffer(schema)
  case 'notification':
    return validateNotification(schema)
  default:
    return validateListing(schema)
  }
}
