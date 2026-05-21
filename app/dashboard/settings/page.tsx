import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { 
  Settings, 
  User, 
  ShieldCheck, 
  Bell, 
  Trash2, 
  Shield, 
  Lock,
  ExternalLink,
  Wallet,
  History
} from 'lucide-react'
import DashboardSidebar from '@/components/DashboardSidebar'
import HeroAnimations from '@/components/HeroAnimations'
import ProfileSettingsForm from './ProfileSettingsForm'
import SecuritySettingsForm from './SecuritySettingsForm'
import PayoutSettingsForm from './PayoutSettingsForm'
import PrivacySettingsForm from './PrivacySettingsForm'
import NotificationSettingsForm from './NotificationSettingsForm'
import ActivityLog from './ActivityLog'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch the current profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch activity logs
  const { data: auditLogs } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div className="flex bg-muted/5 min-h-[calc(100vh-64px)]">
      <DashboardSidebar />
      
      <main className="flex-1 p-4 sm:p-6 md:p-10 overflow-x-hidden">
        <HeroAnimations>
          <div className="max-w-6xl mx-auto space-y-12">
            
            {/* Header Section */}
            <div className="animate-title opacity-0 flex items-center gap-6">
              <div className="h-16 w-16 rounded-[2.5rem] bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-xl shadow-primary/5">
                <Settings className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-4xl font-semibold tracking-tight">Settings</h1>
                <p className="text-muted-foreground text-sm font-medium">Manage your personal information and account security.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-10">
              
              {/* Profile Section */}
              <section className="animate-btns opacity-0 space-y-6">
                <div className="flex items-center gap-3 px-2">
                  <User className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-medium tracking-tight">Public Profile</h2>
                </div>
                
                <ProfileSettingsForm user={user} profile={profile} />
              </section>

              {/* Payout & Revenue Section */}
              <section className="animate-btns opacity-0 space-y-6">
                <div className="flex items-center gap-3 px-2">
                  <Wallet className="h-5 w-5 text-emerald-500" />
                  <h2 className="text-xl font-medium tracking-tight">Payout & Revenue</h2>
                </div>
                
                <PayoutSettingsForm profile={profile} />
              </section>

              {/* Privacy & Visibility Section */}
              <section className="animate-btns opacity-0 space-y-6">
                <div className="flex items-center gap-3 px-2">
                  <Shield className="h-5 w-5 text-indigo-500" />
                  <h2 className="text-xl font-medium tracking-tight">Privacy & Visibility</h2>
                </div>
                
                <PrivacySettingsForm profile={profile} />
              </section>

              {/* Notifications Section */}
              <section className="animate-desc opacity-0 space-y-6">
                <div className="flex items-center gap-3 px-2">
                  <Bell className="h-5 w-5 text-orange-500" />
                  <h2 className="text-xl font-medium tracking-tight">Email Notifications</h2>
                </div>
                
                <NotificationSettingsForm profile={profile} />
              </section>

              {/* Activity Log Section */}
              <section className="animate-desc opacity-0 space-y-6">
                <div className="flex items-center gap-3 px-2">
                  <History className="h-5 w-5 text-muted-foreground" />
                  <h2 className="text-xl font-medium tracking-tight">Account Activity</h2>
                </div>
                
                <ActivityLog logs={auditLogs || []} />
              </section>

              {/* Security & Danger Zone Section */}
              <SecuritySettingsForm />

            </div>
          </div>
        </HeroAnimations>
      </main>
    </div>
  )
}

