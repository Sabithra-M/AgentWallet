import { Pencil, Key, ShieldCheck, Smartphone, LogOut, Trash2, AlertTriangle } from 'lucide-react'
import AppLayout from '../components/layout/AppLayout.jsx'
import Card from '../components/common/Card.jsx'
import SectionHeader from '../components/common/SectionHeader.jsx'
import Button from '../components/common/Button.jsx'
import Input from '../components/common/Input.jsx'
import Avatar from '../components/common/Avatar.jsx'
import Badge from '../components/common/Badge.jsx'
import Skeleton from '../components/common/Skeleton.jsx'
import { useSimulatedLoading } from '../hooks/useSimulatedLoading.js'
import { currentUser } from '../data/user.js'

const SELECT_CLASSNAME =
  'rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 transition-all duration-200 hover:border-slate-300 focus:border-indigo-500 focus:outline-none focus:ring-[4px] focus:ring-indigo-500/15'

function SettingRow({ label, description, children }) {
  return (
    <div className="flex flex-col gap-3 border-b border-slate-100 py-4 last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-medium text-slate-700">{label}</p>
        {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2">{children}</div>
    </div>
  )
}

function SettingRowSkeleton() {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-4 last:border-0">
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-40" />
      </div>
      <Skeleton className="h-8 w-20 rounded-lg" />
    </div>
  )
}

function ToggleSwitch({ enabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
        enabled ? 'bg-indigo-600' : 'bg-slate-200'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )
}

function ProfileSkeleton() {
  return (
    <Card className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="flex flex-col items-center gap-2 sm:items-start">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-3 w-40" />
          <Skeleton className="h-5 w-24 rounded-full" />
        </div>
      </div>
      <Skeleton className="h-9 w-32 rounded-lg" />
    </Card>
  )
}

function Settings() {
  const isLoading = useSimulatedLoading()

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Settings</h1>
          <p className="mt-1 text-sm text-slate-500">Manage your account and preferences.</p>
        </div>

        {isLoading ? (
          <ProfileSkeleton />
        ) : (
          <Card className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
              <Avatar name={currentUser.name} size={64} />
              <div>
                <p className="text-lg font-semibold text-slate-800">{currentUser.name}</p>
                <p className="text-sm text-slate-500">{currentUser.email}</p>
                <div className="mt-2 flex justify-center sm:justify-start">
                  <Badge status={currentUser.role} />
                </div>
              </div>
            </div>
            <Button type="button" variant="outline" icon={<Pencil size={16} />}>
              Edit Profile
            </Button>
          </Card>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <SectionHeader title="Preferences" />
            {isLoading ? (
              <>
                <SettingRowSkeleton />
                <SettingRowSkeleton />
                <SettingRowSkeleton />
                <SettingRowSkeleton />
                <SettingRowSkeleton />
              </>
            ) : (
              <>
                <SettingRow label="Theme" description="Choose how AgentWallet looks to you">
                  <select aria-label="Theme" defaultValue="Light" className={SELECT_CLASSNAME}>
                    <option>Light</option>
                    <option>Dark</option>
                    <option>System</option>
                  </select>
                </SettingRow>
                <SettingRow label="Notifications" description="General app notifications">
                  <ToggleSwitch enabled />
                </SettingRow>
                <SettingRow label="Email Alerts" description="Get updates via email">
                  <ToggleSwitch enabled />
                </SettingRow>
                <SettingRow label="Push Notifications" description="Alerts on your device">
                  <ToggleSwitch enabled={false} />
                </SettingRow>
                <SettingRow label="Dark Mode" description="Use a darker color theme">
                  <ToggleSwitch enabled={false} />
                </SettingRow>
              </>
            )}
          </Card>

          <Card>
            <SectionHeader title="Security" />
            {isLoading ? (
              <>
                <SettingRowSkeleton />
                <SettingRowSkeleton />
                <SettingRowSkeleton />
              </>
            ) : (
              <>
                <SettingRow label="Password" description="Change your account password">
                  <Button type="button" variant="outline" icon={<Key size={16} />}>
                    Change Password
                  </Button>
                </SettingRow>
                <SettingRow label="Two-Factor Authentication" description="Add an extra layer of security">
                  <Badge status="Disabled" />
                  <Button type="button" variant="outline" icon={<ShieldCheck size={16} />}>
                    Enable
                  </Button>
                </SettingRow>
                <SettingRow label="Devices" description="Manage devices signed in to your account">
                  <Button type="button" variant="outline" icon={<Smartphone size={16} />}>
                    Manage Devices
                  </Button>
                </SettingRow>
              </>
            )}
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <SectionHeader title="Wallet Preferences" />
            {isLoading ? (
              <>
                <SettingRowSkeleton />
                <SettingRowSkeleton />
                <SettingRowSkeleton />
              </>
            ) : (
              <>
                <SettingRow label="Default Wallet" description="Used as the default for new AI requests">
                  <select aria-label="Default wallet" defaultValue="Travel" className={SELECT_CLASSNAME}>
                    <option>Travel</option>
                    <option>Shopping</option>
                    <option>Food</option>
                    <option>Bills</option>
                  </select>
                </SettingRow>
                <SettingRow label="Monthly Spending Limit" description="Across all wallets combined">
                  <Input
                    aria-label="Monthly spending limit"
                    type="number"
                    defaultValue="15000"
                    className="w-32"
                  />
                </SettingRow>
                <SettingRow label="Currency" description="Used to display all amounts">
                  <select aria-label="Currency" defaultValue="INR" className={SELECT_CLASSNAME}>
                    <option value="INR">INR - Indian Rupee</option>
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                  </select>
                </SettingRow>
              </>
            )}
          </Card>

          <Card className="!bg-red-50 border border-red-100">
            <SectionHeader
              title={
                <span className="inline-flex items-center gap-2">
                  <AlertTriangle size={16} className="text-red-500" />
                  Danger Zone
                </span>
              }
            />
            {isLoading ? (
              <>
                <SettingRowSkeleton />
                <SettingRowSkeleton />
              </>
            ) : (
              <>
                <SettingRow label="Logout" description="Sign out of your account on this device">
                  <Button type="button" variant="outline" icon={<LogOut size={16} />}>
                    Logout
                  </Button>
                </SettingRow>
                <SettingRow label="Delete Account" description="Permanently delete your account and all data">
                  <Button type="button" variant="danger" icon={<Trash2 size={16} />}>
                    Delete Account
                  </Button>
                </SettingRow>
              </>
            )}
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}

export default Settings
