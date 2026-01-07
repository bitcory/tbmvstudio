import { Film, Upload } from 'lucide-react'

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl flex items-center justify-center mb-6">
        <Film className="h-12 w-12 text-purple-400" />
      </div>

      <h2 className="text-3xl font-bold mb-3">프로젝트를 시작하세요</h2>
      <p className="text-muted-foreground text-lg mb-8 max-w-md">
        JSON 파일을 업로드하여 미드저니 프롬프트와 이미지를 관리하세요
      </p>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Upload className="h-4 w-4" />
        <span>상단의 JSON 업로드 버튼을 클릭하세요</span>
      </div>
    </div>
  )
}
