import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useLanguage } from '@/contexts/LanguageContext'

interface PasswordModalProps {
  onSuccess: () => void
  correctPassword?: string
}

export function PasswordModal({ onSuccess, correctPassword = '1004' }: PasswordModalProps) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { t } = useLanguage()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    setTimeout(() => {
      if (password === correctPassword) {
        localStorage.setItem('passwordAuthenticated', 'true')
        onSuccess()
      } else {
        setError(t.wrongPassword)
        setPassword('')
      }
      setIsLoading(false)
    }, 300)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSubmit(e as any)
    }
  }

  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
      <Card className="w-96">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{t.appTitle}</CardTitle>
          <CardDescription>{t.enterPassword}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="password"
                placeholder={t.passwordPlaceholder}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                autoFocus
                className="text-center text-lg tracking-widest"
              />
            </div>

            {error && (
              <div className="bg-destructive/10 text-destructive text-sm text-center p-2 rounded-md border border-destructive/20">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading || !password}
              className="w-full"
            >
              {isLoading ? t.checking : t.enter}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t">
            <p className="text-muted-foreground text-xs text-center">
              {t.copyright}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
