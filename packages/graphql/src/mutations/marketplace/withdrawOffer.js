import { post } from '@origin/ipfs'
import txHelper, { checkMetaMask } from '../_txHelper'
import IdentityProxy from '@origin/contracts/build/contracts/IdentityProxy_solc'
import contracts from '../../contracts'
import cost from '../_gasCost'
import parseId from '../../utils/parseId'
import { normalCompare } from '../../utils/normalize'
import { proxyOwner } from '../../utils/proxy'

async function withdrawOffer(_, data) {
  const from = data.from || contracts.defaultMobileAccount
  await checkMetaMask(from)

  const ipfsHash = await post(contracts.ipfsRPC, data)
  const { listingId, offerId, marketplace } = parseId(data.offerID, contracts)
  const { withdrawOffer } = marketplace.contractExec.methods

  let tx = withdrawOffer(listingId, offerId, ipfsHash)

  let gas = cost.withdrawOffer

  const { seller } = await marketplace.contractExec.methods
    .listings(listingId)
    .call()
  const owner = await proxyOwner(from)

  // Only use the proxy if the proxy is the seller
  if (owner && normalCompare(seller, from)) {
    const offer = await marketplace.eventSource.getOffer(listingId, offerId)
    const Proxy = new contracts.web3Exec.eth.Contract(IdentityProxy.abi, from)
    const txData = await tx.encodeABI()

    tx = Proxy.methods.marketplaceFinalizeAndPay(
      marketplace.contract._address,
      txData,
      from,
      offer.currency,
      offer.value
    )
    gas += 100000
  }

  return txHelper({
    tx,
    from,
    mutation: 'withdrawOffer',
    gas
  })
}

export default withdrawOffer
