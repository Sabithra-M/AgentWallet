import { Link } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout.jsx'
import Card from '../components/common/Card.jsx'
import SectionHeader from '../components/common/SectionHeader.jsx'
import Button from '../components/common/Button.jsx'
import Input from '../components/common/Input.jsx'
import Dropdown from '../components/common/Dropdown.jsx'
import BackLink from '../components/common/BackLink.jsx'
import WalletIcon from '../components/wallet/WalletIcon.jsx'
import Skeleton from '../components/common/Skeleton.jsx'
import { useSimulatedLoading } from '../hooks/useSimulatedLoading.js'

const CATEGORIES = [
  { value: 'travel', label: 'Travel' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'food', label: 'Food' },
  { value: 'bills', label: 'Bills' },
]

function FieldSkeleton() {
  return (
    <div className="flex flex-col gap-1.5">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-11 w-full rounded-xl" />
    </div>
  )
}

function DetailsCardSkeleton() {
  return (
    <Card className="flex flex-col gap-5">
      <Skeleton className="h-4 w-32" />
      <FieldSkeleton />
      <FieldSkeleton />
      <FieldSkeleton />
      <FieldSkeleton />
    </Card>
  )
}

function IconCardSkeleton() {
  return (
    <Card className="flex flex-col gap-4">
      <Skeleton className="h-4 w-40" />
      <div className="flex flex-wrap gap-3">
        <Skeleton className="h-12 w-12 rounded-xl" />
        <Skeleton className="h-12 w-12 rounded-xl" />
        <Skeleton className="h-12 w-12 rounded-xl" />
        <Skeleton className="h-12 w-12 rounded-xl" />
      </div>
    </Card>
  )
}

function CreateWallet() {
  const isLoading = useSimulatedLoading()

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <BackLink to="/wallets" label="Back to Wallets" />

        <div>
          <h1 className="text-xl font-semibold text-slate-800">Create Wallet</h1>
          <p className="mt-1 text-sm text-slate-500">Set up a new wallet with its own spending limit.</p>
        </div>

        {isLoading ? (
          <>
            <DetailsCardSkeleton />
            <IconCardSkeleton />
          </>
        ) : (
          <>
            <Card className="flex flex-col gap-5">
              <SectionHeader title="Wallet Details" />
              <Input label="Wallet Name" id="wallet-name" placeholder="e.g. Travel Wallet" />
              <Dropdown label="Wallet Category" id="wallet-category" defaultValue="travel">
                {CATEGORIES.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </Dropdown>
              <Input
                label="Monthly Spending Limit"
                id="wallet-limit"
                type="number"
                placeholder="e.g. 10000"
              />
              <Input
                label="Description"
                id="wallet-description"
                placeholder="What is this wallet for?"
              />
            </Card>

            <Card className="flex flex-col gap-4">
              <SectionHeader title="Wallet Color / Icon" />
              <div className="flex flex-wrap gap-3">
                {CATEGORIES.map((category, index) => (
                  <button
                    key={category.value}
                    type="button"
                    aria-label={`${category.label} icon`}
                    aria-pressed={index === 0}
                    className={`rounded-xl p-1 transition-all ${
                      index === 0
                        ? 'ring-2 ring-indigo-500 ring-offset-2'
                        : 'ring-1 ring-transparent hover:ring-slate-200'
                    }`}
                  >
                    <WalletIcon category={category.value} />
                  </button>
                ))}
              </div>
            </Card>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Link to="/wallets" className="w-full sm:w-auto">
                <Button type="button" variant="outline" className="w-full">
                  Cancel
                </Button>
              </Link>
              <Button type="button" variant="primary" className="w-full sm:w-auto">
                Create Wallet
              </Button>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  )
}

export default CreateWallet
