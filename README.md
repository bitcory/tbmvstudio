# 🎬 미드저니 v7 영상 프로젝트 매니저

현대적인 다크 테마와 Apple 스타일의 투명 아이콘을 사용한 미드저니 영상 프로젝트 관리 도구입니다.

## ✨ 주요 기능

- 📁 **JSON 프로젝트 관리**: JSON 파일을 업로드하여 프로젝트 관리
- 🎨 **다크 테마**: Apple 스타일의 우아한 다크 모드
- 📱 **반응형 디자인**: 모바일, 태블릿, 데스크톱 지원
- 🎯 **씬 관리**: 스타트/엔드 프레임으로 씬 구성
- 📋 **프롬프트 복사**: 원클릭으로 프롬프트 복사
- 🖼️ **이미지 관리**: URL을 통한 이미지 추가 및 미리보기
- 💾 **로컬 저장소**: 브라우저 로컬 스토리지에 자동 저장
- 📥 **프로젝트 다운로드**: JSON 형식으로 프로젝트 내보내기

## 🛠️ 기술 스택

- **프레임워크**: React 18 + TypeScript
- **빌드 도구**: Vite 5
- **스타일링**: Tailwind CSS 3
- **UI 컴포넌트**: shadcn/ui
- **아이콘**: Lucide React
- **상태 관리**: React Hooks

## 🚀 시작하기

### 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:5173](http://localhost:5173)을 열어 확인하세요.

### 빌드

```bash
npm run build
```

### 미리보기

```bash
npm run preview
```

## 📦 프로젝트 구조

```
vdai/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx         # 상단 헤더
│   │   │   └── Sidebar.tsx        # 사이드바
│   │   ├── project/
│   │   │   ├── ProjectManager.tsx # 프로젝트 관리자
│   │   │   ├── SceneCard.tsx      # 씬 카드
│   │   │   ├── FrameBox.tsx       # 프레임 박스
│   │   │   └── EmptyState.tsx     # 빈 상태 화면
│   │   └── ui/                    # shadcn/ui 컴포넌트
│   ├── lib/
│   │   └── utils.ts               # 유틸리티 함수
│   ├── App.tsx                    # 메인 앱
│   ├── main.tsx                   # 엔트리 포인트
│   └── index.css                  # 글로벌 스타일
├── public/                        # 정적 파일
└── package.json
```

## 📋 JSON 데이터 형식

```json
{
  "project": {
    "title": "프로젝트 제목",
    "style": "cinematic",
    "aspectRatio": "16:9",
    "totalDuration": "30",
    "description": "프로젝트 설명"
  },
  "scenes": [
    {
      "sceneNumber": 1,
      "sceneId": "scene_001",
      "title": "씬 제목",
      "description": "씬 설명",
      "frames": {
        "start": {
          "prompt": "미드저니 프롬프트",
          "description": "프레임 설명",
          "imageUrl": "https://example.com/image.jpg"
        },
        "end": {
          "prompt": "미드저니 프롬프트",
          "description": "프레임 설명",
          "imageUrl": "https://example.com/image.jpg"
        }
      },
      "transition": {
        "type": "fade",
        "duration": 1000
      }
    }
  ]
}
```

## 🎨 디자인 특징

- **Apple 스타일**: 투명도와 블러 효과로 현대적인 느낌
- **다크 테마**: 눈의 피로를 줄이는 부드러운 다크 모드
- **Lucide 아이콘**: 깔끔하고 일관된 아이콘 세트
- **그라디언트**: 보라색-핑크 그라디언트로 시각적 매력

## 🔧 개발

### 코드 스타일

- TypeScript 엄격 모드 사용
- React 함수형 컴포넌트
- Tailwind CSS 유틸리티 클래스
- shadcn/ui 컴포넌트 패턴

### 경로 별칭

```typescript
// '@/' 별칭으로 src 디렉토리 참조
import { Button } from '@/components/ui/button'
```

## 📄 라이선스

MIT

## 🤝 기여

이슈와 PR은 언제나 환영합니다!
