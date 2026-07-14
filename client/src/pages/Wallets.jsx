import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import AppLayout from '../components/layout/AppLayout.jsx'
import SectionHeader from '../components/common/SectionHeader.jsx'
import Button from '../components/common/Button.jsx'
import WalletCard from '../components/wallet/WalletCard.jsx'
import WalletCardSkeleton from '../components/wallet/WalletCardSkeleton.jsx'
import AddWalletCard from '../components/wallet/AddWalletCard.jsx'
import { useSimulatedLoading } from '../hooks/useSimulatedLoading.js'
import { wallets } from '../data/wallets.js'

function Wallets() {
  const isLoading = useSimulatedLoading()

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <SectionHeader
          title="My Wallets"
          action={
            <Link to="/wallets/new">
              <Button icon={<Plus size={16} />}>Create Wallet</Button>
            </Link>
          }
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            <>
              <WalletCardSkeleton />
              <WalletCardSkeleton />
              <WalletCardSkeleton />
              <WalletCardSkeleton />
            </>
          ) : (
            <>
              {wallets.map((wallet) => (
                <WalletCard key={wallet.id} wallet={wallet} />
              ))}
              <AddWalletCard />
            </>
          )}
        </div>
      </div>
    </AppLayout>
  )
}

export default Wallets
