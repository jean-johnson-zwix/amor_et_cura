'use client'

import { useActionState, useState } from 'react'
import { createClient, type NewClientFormState } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { translations, type Locale } from '@/lib/i18n'

const PROGRAMS = [
  'Case Management',
  'Child & Family Services',
  'Education Support',
  'Employment Support',
  'Food Assistance',
  'Housing Support',
  'Legal Aid Referral',
  'Medical Referral',
  'Mental Health Services',
  'Transportation Assistance',
]

const initialState: NewClientFormState = {}

export default function ClientRegistrationForm() {
  const [state, action, isPending] = useActionState(createClient, initialState)
  const [locale, setLocale] = useState<Locale>('en')
  const t = translations[locale]

  return (
    <form action={action}>
      <Card className="max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t.newClient}</CardTitle>
              <CardDescription>{t.intakeDescription}</CardDescription>
            </div>
            {/* Language toggle */}
            <div className="flex rounded-lg border border-input overflow-hidden text-sm shrink-0">
              {(['en', 'es'] as Locale[]).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setLocale(lang)}
                  className={`px-3 py-1 font-medium transition-colors ${
                    locale === lang
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {lang === 'en' ? 'EN' : 'ES'}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          {state.error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {state.error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="first_name">{t.firstName} *</Label>
              <Input
                id="first_name"
                name="first_name"
                placeholder={t.firstNamePlaceholder}
                aria-invalid={!!state.fieldErrors?.first_name}
                required
              />
              {state.fieldErrors?.first_name && (
                <p className="text-xs text-destructive">{t.firstNameRequired}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="last_name">{t.lastName} *</Label>
              <Input
                id="last_name"
                name="last_name"
                placeholder={t.lastNamePlaceholder}
                aria-invalid={!!state.fieldErrors?.last_name}
                required
              />
              {state.fieldErrors?.last_name && (
                <p className="text-xs text-destructive">{t.lastNameRequired}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="dob">{t.dob}</Label>
            <Input id="dob" name="dob" type="date" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="phone">{t.phone}</Label>
              <Input id="phone" name="phone" type="tel" placeholder="(602) 555-0100" />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">{t.email}</Label>
              <Input id="email" name="email" type="email" placeholder="cliente@ejemplo.com" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="address">{t.address}</Label>
            <Input id="address" name="address" placeholder={t.addressPlaceholder} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="program">{t.program}</Label>
            <select
              id="program"
              name="program"
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="">{t.selectProgram}</option>
              {PROGRAMS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={isPending}>
              {isPending ? t.saving : t.registerClient}
            </Button>
            <Button type="button" variant="outline" onClick={() => window.history.back()}>
              {t.cancel}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
