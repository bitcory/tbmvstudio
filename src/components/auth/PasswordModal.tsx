import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface PasswordModalProps {
  onSuccess: () => void
  correctPassword?: string
}

export function PasswordModal({ onSuccess, correctPassword = '1004' }: PasswordModalProps) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // 비밀번호 검증 (약간의 딜레이 추가로 사용자 경험 개선)
    setTimeout(() => {
      if (password === correctPassword) {
        // localStorage에 인증 상태 저장
        localStorage.setItem('passwordAuthenticated', 'true')
        onSuccess()
      } else {
        setError('비밀번호가 틀렸습니다.')
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
    <div className="fixed inset-0 bg-background flex items-center justify-center z-50 overflow-hidden">
      {/* Neobrutalism decorative shapes */}
      <div className="absolute top-20 left-20 w-24 h-24 bg-neo-purple rotate-45 border-3 border-foreground shadow-[4px_4px_0_hsl(var(--foreground))]"></div>
      <div className="absolute top-40 right-32 w-16 h-16 bg-neo-cyan border-3 border-foreground shadow-[4px_4px_0_hsl(var(--foreground))]"></div>
      <div className="absolute bottom-32 left-1/4 w-20 h-20 bg-neo-yellow border-3 border-foreground shadow-[4px_4px_0_hsl(var(--foreground))]"></div>
      <div className="absolute bottom-20 right-20 w-32 h-16 bg-neo-pink border-3 border-foreground shadow-[4px_4px_0_hsl(var(--foreground))] -rotate-12"></div>
      <div className="absolute top-1/3 left-10 w-20 h-20 bg-neo-orange border-3 border-foreground shadow-[4px_4px_0_hsl(var(--foreground))] rotate-12"></div>

      <div className="relative bg-white p-8 w-96 border-3 border-foreground shadow-[8px_8px_0_hsl(var(--foreground))]">
        <h1 className="text-3xl font-black text-foreground mb-2 text-center">
          <span className="bg-neo-yellow px-3 py-1 border-2 border-foreground inline-block rotate-[-2deg] shadow-[3px_3px_0_hsl(var(--foreground))]">AI</span>
          <span className="bg-neo-purple text-white px-3 py-1 border-2 border-foreground inline-block rotate-[2deg] ml-1 shadow-[3px_3px_0_hsl(var(--foreground))]">툴비</span>
        </h1>
        <p className="text-foreground/70 text-center mb-8 font-bold">비밀번호를 입력해주세요</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="password"
              placeholder="비밀번호 입력"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              autoFocus
              className="bg-neo-yellow/20 border-3 border-foreground text-foreground placeholder-foreground/50 text-center text-lg tracking-widest font-bold shadow-[4px_4px_0_hsl(var(--foreground))] focus:shadow-[5px_5px_0_hsl(var(--foreground))]"
            />
          </div>

          {error && (
            <div className="bg-neo-red text-white text-sm text-center font-bold p-2 border-2 border-foreground shadow-[3px_3px_0_hsl(var(--foreground))]">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading || !password}
            className="w-full"
          >
            {isLoading ? '확인 중...' : '입장'}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t-4 border-foreground">
          <p className="text-foreground/50 text-xs text-center font-bold">
            © 2026 TB영상제작소. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}
