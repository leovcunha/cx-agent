import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ChangeEvent } from 'react'
import { useTranslation } from 'react-i18next'

interface SignUpFormProps extends React.ComponentPropsWithoutRef<'div'> {
  email: string
  password: string
  repeatPassword: string
  businessName: string
  businessDescription: string
  error: string | null
  warning: string | null
  success: boolean
  isLoading: boolean
  onEmailChange: (event: ChangeEvent<HTMLInputElement>) => void
  onPasswordChange: (event: ChangeEvent<HTMLInputElement>) => void
  onRepeatPasswordChange: (event: ChangeEvent<HTMLInputElement>) => void
  onBusinessNameChange: (event: ChangeEvent<HTMLInputElement>) => void
  onBusinessDescriptionChange: (event: ChangeEvent<HTMLTextAreaElement>) => void
  onSubmit: (event: React.FormEvent) => void
}

export function SignUpForm({
  className,
  email,
  password,
  repeatPassword,
  businessName,
  businessDescription,
  error,
  warning,
  success,
  isLoading,
  onEmailChange,
  onPasswordChange,
  onRepeatPasswordChange,
  onBusinessNameChange,
  onBusinessDescriptionChange,
  onSubmit,
  ...props
}: SignUpFormProps) {
  const { t } = useTranslation()

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      {success ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{t('signupSuccessTitle')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {t('signupSuccessDesc')}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{t('signupTitle')}</CardTitle>
            <CardDescription>{t('signupDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit}>
              <div className="flex flex-col gap-4">
                <div className="grid gap-1">
                  <Label htmlFor="email">{t('emailLabel')}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    value={email}
                    onChange={onEmailChange}
                  />
                </div>
                
                <div className="grid gap-1">
                  <Label htmlFor="password">{t('passwordLabel')}</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={onPasswordChange}
                  />
                </div>

                <div className="grid gap-1">
                  <Label htmlFor="repeat-password">{t('repeatPasswordLabel')}</Label>
                  <Input
                    id="repeat-password"
                    type="password"
                    required
                    value={repeatPassword}
                    onChange={onRepeatPasswordChange}
                  />
                </div>

                <div className="border-t border-gray-100 my-2 pt-2">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">{t('businessSettingsTitle')}</h3>
                  <div className="flex flex-col gap-4">
                    <div className="grid gap-1">
                      <Label htmlFor="business-name">{t('businessNameLabel')}</Label>
                      <Input
                        id="business-name"
                        type="text"
                        placeholder="e.g. Refero Clinic"
                        required
                        value={businessName}
                        onChange={onBusinessNameChange}
                      />
                    </div>

                    <div className="grid gap-1">
                      <Label htmlFor="business-description">{t('businessDescriptionLabel')}</Label>
                      <Textarea
                        id="business-description"
                        placeholder="e.g. A premier medical clinic offering top-notch healthcare services."
                        value={businessDescription}
                        onChange={onBusinessDescriptionChange}
                      />
                    </div>


                  </div>
                </div>

                {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
                {warning && <p className="text-sm text-yellow-600 mt-2">{warning}</p>}
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20 mt-2" disabled={isLoading}>
                  {isLoading ? t('creatingAccount') : t('signupButton')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
