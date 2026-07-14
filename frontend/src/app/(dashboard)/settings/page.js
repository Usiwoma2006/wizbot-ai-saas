'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, Palette, Bell, TriangleAlert, Loader2 } from 'lucide-react'
import api from '@/lib/api'

export default function SettingsPage() {
  const router = useRouter()

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Section-specific saving state, so clicking one "Save" button doesn't
  // disable the others while it's in flight.
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingAppearance, setSavingAppearance] = useState(false)
  const [savingNotifications, setSavingNotifications] = useState(false)

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function loadProfile() {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get('/merchant/me/')
      setProfile(data)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProfile()
  }, [])

  function updateField(field, value) {
    setProfile((prev) => ({ ...prev, [field]: value }))
  }

  async function saveSection(fields, setSavingFn) {
    setSavingFn(true)
    try {
      const payload = {}
      fields.forEach((f) => (payload[f] = profile[f]))
      const { data } = await api.put('/merchant/me/', payload)
      setProfile(data)
    } catch (err) {
      setError(err)
    } finally {
      setSavingFn(false)
    }
  }

  async function handleDeleteAccount() {
    setDeleting(true)
    try {
      await api.delete('/merchant/me/')
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      router.push('/login')
    } catch (err) {
      setError(err)
      setDeleting(false)
      setShowDeleteModal(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 animate-pulse space-y-6">
        <div className="h-8 w-40 bg-gray-200 rounded" />
        <div className="h-64 bg-gray-100 rounded-xl" />
        <div className="h-64 bg-gray-100 rounded-xl" />
      </div>
    )
  }

  if (error && !profile) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 text-sm">
          Couldn&apos;t load your settings. Please try again.
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your account and widget.</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
          Something went wrong saving your changes. Please try again.
        </div>
      )}

      {/* ================= Profile ================= */}
      <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6">
        <div className="mb-6 flex items-center gap-3">
          <User className="h-5 w-5 text-blue-600" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Profile</h2>
            <p className="text-sm text-gray-500">Your account information.</p>
          </div>
        </div>

        <div className="grid gap-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Shop Name</label>
            <input
              type="text"
              value={profile.shop_name || ''}
              onChange={(e) => updateField('shop_name', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Email Address</label>
            <input
              type="email"
              value={profile.email || ''}
              readOnly
              className="w-full rounded-lg border border-gray-300 bg-gray-100 px-4 py-2.5 text-gray-500"
            />
            <p className="mt-1.5 text-xs text-gray-400">
              Your email is used to log in and can&apos;t be changed here.
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={() => saveSection(['shop_name'], setSavingProfile)}
            disabled={savingProfile}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {savingProfile && <Loader2 className="w-4 h-4 animate-spin" />}
            {savingProfile ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* ================= Widget Appearance ================= */}
      <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6">
        <div className="mb-6 flex items-center gap-3">
          <Palette className="h-5 w-5 text-blue-600" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Widget Appearance</h2>
            <p className="text-sm text-gray-500">Customize how Wiz appears on your storefront.</p>
          </div>
        </div>

        <div className="grid gap-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Widget Name</label>
            <input
              type="text"
              value={profile.widget_name || ''}
              onChange={(e) => updateField('widget_name', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Brand Color</label>
            <input
              type="color"
              value={profile.widget_color || '#2563EB'}
              onChange={(e) => updateField('widget_color', e.target.value)}
              className="h-12 w-20 cursor-pointer rounded-lg border border-gray-300"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Avatar URL</label>
            <input
              type="text"
              value={profile.widget_avatar_url || ''}
              onChange={(e) => updateField('widget_avatar_url', e.target.value)}
              placeholder="https://yourstore.com/avatar.png"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500"
            />
            <p className="mt-1.5 text-xs text-gray-400">
              Paste a link to an image. File uploads aren&apos;t supported yet.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Response Time (Hours)</label>
            <input
              type="number"
              value={profile.response_time_hours ?? ''}
              onChange={(e) => updateField('response_time_hours', Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={() =>
              saveSection(
                ['widget_name', 'widget_color', 'widget_avatar_url', 'response_time_hours'],
                setSavingAppearance
              )
            }
            disabled={savingAppearance}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {savingAppearance && <Loader2 className="w-4 h-4 animate-spin" />}
            {savingAppearance ? 'Saving…' : 'Save Appearance'}
          </button>
        </div>
      </div>

      {/* ================= Notifications ================= */}
      <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6">
        <div className="mb-6 flex items-center gap-3">
          <Bell className="h-5 w-5 text-blue-600" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
            <p className="text-sm text-gray-500">How would you like to be alerted?</p>
          </div>
        </div>

        <div className="grid gap-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Notification Email</label>
            <input
              type="email"
              value={profile.notification_email || ''}
              onChange={(e) => updateField('notification_email', e.target.value)}
              placeholder="support@yourstore.com"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
            <div>
              <h3 className="text-sm font-medium text-gray-900">
                Email me when Wiz escalates a conversation
              </h3>
              <p className="text-sm text-gray-500">
                Receive an email whenever human intervention is required.
              </p>
            </div>
            <input
              type="checkbox"
              checked={!!profile.notify_on_escalation}
              onChange={(e) => updateField('notify_on_escalation', e.target.checked)}
              className="h-5 w-5 accent-blue-600"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={() =>
              saveSection(['notification_email', 'notify_on_escalation'], setSavingNotifications)
            }
            disabled={savingNotifications}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {savingNotifications && <Loader2 className="w-4 h-4 animate-spin" />}
            {savingNotifications ? 'Saving…' : 'Save Notifications'}
          </button>
        </div>
      </div>

      {/* ================= Danger Zone ================= */}
      <div className="rounded-xl border border-red-200 bg-white p-6">
        <div className="mb-6 flex items-center gap-3">
          <TriangleAlert className="h-5 w-5 text-red-600" />
          <div>
            <h2 className="text-lg font-semibold text-red-600">Danger Zone</h2>
            <p className="text-sm text-gray-500">Permanently remove your Wiz AI account.</p>
          </div>
        </div>

        <p className="mb-6 text-sm text-gray-500">This action cannot be undone.</p>

        <button
          onClick={() => setShowDeleteModal(true)}
          className="rounded-lg border border-red-500 px-5 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
        >
          Delete Account
        </button>
      </div>

      {/* ================= Delete Confirmation Modal ================= */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                <TriangleAlert className="h-5 w-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Delete your account?</h3>
            </div>

            <p className="text-sm text-gray-500 mb-6">
              This will permanently delete your store connection, chat history, and all data.
              This can&apos;t be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                autoFocus
                className="flex-1 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-red-600 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                {deleting ? 'Deleting…' : 'Delete account'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}