import { useCreateRevenuePath, useR3vlClient, useWithdraw } from '@r3vl/sdk'
import { useEffect, useState } from 'react'
import { useNetwork, useProvider, useSigner, useAccount } from 'wagmi'

const Form = ({ onCreateRevPath, onCreateWithdrawal }) => {
  const [collabs, setCollabs] = useState({ wallets: ['0x538C138B73836b811c148B3E4c3683B7B923A0E7'], shares: [100] })
  const [error, setError] = useState(null)
  const [revenuePathAddr, setRevenuePathAddr] = useState(null)

  useEffect(() => {
    const totalShare = collabs.shares.reduce((prev, share) => prev + share, 0)

    if (totalShare === 100) setError(null)
    else setError('Total share must sum 100%')
  }, [collabs, error])

  return (
    <div>
      <div>
        <table>
          <tr>
            <th>Collaborator Wallet</th>
            <th>Share %</th>
          </tr>
          {collabs.wallets.map((_, id) => {
            const wallet = collabs.wallets[id]
            const share = collabs.shares[id]

            return (
              <tr key={id}>
                <td className="flex flex-col">
                  <input
                    defaultValue={wallet}
                    className={`border-black-50 my-4 border ${!wallet && 'border-red-600'}`}
                    placeholder="Wallet address"
                    onChange={e => {
                      const _c = { ...collabs }

                      _c.wallets[id] = e.target.value

                      setCollabs(_c)
                    }}
                  />
                </td>
                <td>
                  <input
                    defaultValue={share}
                    className="border-black-50 my-4 border"
                    placeholder="Share in percentage"
                    onChange={e => {
                      const _c = { ...collabs }

                      _c.shares[id] = parseFloat(e.target.value)

                      setCollabs(_c)
                    }}
                  />
                </td>
              </tr>
            )
          })}
        </table>
        <button
          className="bg-gray-400 p-2"
          onClick={() => setCollabs({ wallets: [...collabs.wallets, ''], shares: [...collabs.shares, 0] })}
        >
          Add Collaborator
        </button>
      </div>
      <p>
        <button
          className="bg-gray-500 p-2"
          onClick={() =>
            onCreateRevPath({
              walletList: [[...collabs.wallets]],
              distribution: [[...collabs.shares]],
              name: 'rev path test',
              mutabilityDisabled: true,
            })
          }
        >
          Create Revenue Path!
        </button>
        <br></br> <br></br>
        {/* <input
          // defaultValue={}
          className="border-black-50 my-4 border"
          placeholder="Revenue path address"
          onChange={e => {
            const rev = e.target.value
            setRevenuePathAddr(rev)
            // setRevenuePathAddr(e.target.value)
          }}
        /> */}
        <button
          className="bg-gray-500 p-2"
          // onClick={() => {
          //   onCreateWithdrawal(revenuePathAddr)
          // }}
          onClick={() => {
            onCreateWithdrawal()
          }}
        >
          Withdraw from Revenue Path
        </button>
      </p>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  )
}

const Sdk = () => {
  const provider = useProvider()
  const { data: signer } = useSigner()
  const { chain } = useNetwork()
  const { address } = useAccount()

  useR3vlClient({
    chainId: chain?.id,
    provider,
    signer,
  })

  const { mutateAsync: createRevenuePath } = useCreateRevenuePath()

  const onCreateRevPath = async payload => {
    const receipt = await createRevenuePath(payload)

    console.log('Transaction result:', receipt)
  }

  const withdraw = useWithdraw('0xEc6aC6962945fe2B21D163eD1355d2855D4FA1aC')

  const onCreateWithdrawal = () => {
    console.log('withdrawing from revenue path 0xEc6aC6962945fe2B21D163eD1355d2855D4FA1aC to ', address)
    withdraw.mutate({
      walletAddress: address,
    })
  }

  // const onCreateWithdrawal = _revenuePathAddr => {
  //   withdraw.mutate({
  //     walletAddress: address,
  //   })
  // }

  return <Form onCreateRevPath={onCreateRevPath} onCreateWithdrawal={onCreateWithdrawal} />
}

export default Sdk
