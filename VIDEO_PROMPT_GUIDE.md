# 영상 프롬프트 작성 가이드

## 📋 목차
1. [개요](#개요)
2. [6가지 핵심 모듈](#6가지-핵심-모듈)
3. [AI 최적화 조립 순서](#ai-최적화-조립-순서)
4. [JSON 파일 구조](#json-파일-구조)
5. [실전 예시](#실전-예시)

---

## 개요

AI 영상 생성 시 가장 중요한 것은 **프롬프트의 구조**입니다.
이 가이드는 6가지 핵심 모듈을 조합하여 AI가 가장 잘 이해하는 형식으로 영상 프롬프트를 작성하는 방법을 제시합니다.

### 핵심 원칙
- **사고 흐름**: 사용자는 "무엇을" → "어떻게" 순서로 생각합니다
- **AI 이해**: AI는 "어떻게" → "무엇을" 순서로 더 잘 이해합니다
- **최종 조립**: AI 최적화 순서로 재배열하여 최종 프롬프트 생성

---

## 6가지 핵심 모듈

### 1. STYLE (스타일)
**목적**: 영상의 전체적인 톤앤매너, 화풍, 장르 정의

**예시**:
- `Cinematic, 4K, Photorealistic`
- `Anime style, Studio Ghibli aesthetic`
- `Documentary style, handheld camera`
- `Vintage film, 16mm grain`

---

### 2. SETTING (배경 장소)
**목적**: 장면이 일어나는 시공간적 배경 설정

**예시**:
- `a futuristic city street at night`
- `an ancient temple in the jungle`
- `a cozy coffee shop interior`
- `a dystopian underground bunker`

---

### 3. ATMOSPHERE (분위기)
**목적**: 날씨, 조명, 감정적 분위기

**예시**:
- `heavy rain, illuminated by bright neon signs`
- `golden hour sunlight, warm and peaceful`
- `thick fog, eerie blue moonlight`
- `harsh studio lighting, dramatic shadows`

---

### 4. SUBJECT (주체)
**목적**: 장면에 등장할 주요 대상

**예시**:
- `a man in a black trench coat`
- `a giant mechanical robot`
- `a young woman with flowing red hair`
- `an old wooden ship`

---

### 5. ACTION (행동)
**목적**: 주체의 구체적인 움직임 (영상의 핵심!)

**예시**:
- `walking slowly towards the camera`
- `jumping from building to building`
- `turning around with surprised expression`
- `floating in zero gravity`

---

### 6. CAMERA (카메라 연출)
**목적**: 촬영 방식 (샷 크기, 앵글, 움직임)

**예시**:
- `Low-angle medium shot, tracking backward`
- `Drone shot, slowly rising and rotating`
- `Close-up, handheld with slight shake`
- `Wide-angle establishing shot, static`

**샷 크기**:
- `Extreme wide shot` (EWS)
- `Wide shot` (WS)
- `Medium shot` (MS)
- `Close-up` (CU)
- `Extreme close-up` (ECU)

**카메라 앵글**:
- `Eye level`
- `High angle`
- `Low angle`
- `Bird's eye view`
- `Dutch angle` (기울어진)

**카메라 움직임**:
- `Static` (고정)
- `Pan` (좌우 회전)
- `Tilt` (상하 회전)
- `Tracking` / `Dolly` (전후 이동)
- `Crane` (상하 이동)
- `Zoom in/out`
- `Handheld` (핸드헬드)

---

## AI 최적화 조립 순서

AI는 문장 앞에 오는 지시어를 가장 중요하게 인식합니다.
따라서 다음 순서로 프롬프트를 조립해야 합니다:

```
[STYLE] → [CAMERA] → [SUBJECT] → [ACTION] → [SETTING] → [ATMOSPHERE]
```

### 조립 템플릿

```
{STYLE}. {CAMERA} of {SUBJECT} {ACTION} in {SETTING}, {ATMOSPHERE}.
```

### 실제 예시

**모듈별 입력**:
- STYLE: `Cinematic, 4K, Photorealistic`
- CAMERA: `Low-angle medium shot, tracking backward`
- SUBJECT: `a man in a black trench coat`
- ACTION: `walking slowly towards the camera`
- SETTING: `a futuristic city street at night`
- ATMOSPHERE: `heavy rain, illuminated by bright neon signs`

**최종 조립된 프롬프트**:
```
Cinematic, 4K, Photorealistic. Low-angle medium shot, tracking backward of a man in a black trench coat walking slowly towards the camera in a futuristic city street at night, heavy rain, illuminated by bright neon signs.
```

---

## JSON 파일 구조

프로젝트에 영상 프롬프트를 추가할 때는 `motion` 필드를 사용합니다.

### 기본 구조

```json
{
  "scenes": [
    {
      "sceneId": "scene_001",
      "frames": {
        "start": {
          "prompt": "이미지 생성용 프롬프트",
          "motion": {
            "ko": "한국어 모션 설명",
            "en": "조립된 영상 프롬프트 (STYLE + CAMERA + SUBJECT + ACTION + SETTING + ATMOSPHERE)",
            "speed": "slow | medium | fast | very slow"
          }
        }
      }
    }
  ]
}
```

### 필드 설명

| 필드 | 설명 | 필수 |
|------|------|------|
| `motion.ko` | 한국어로 작성된 모션 설명 (사용자 이해용) | 선택 |
| `motion.en` | **영문으로 조립된 최종 영상 프롬프트** (AI 입력용) | **필수** |
| `motion.speed` | 영상 속도 힌트 | 선택 |

---

## 실전 예시

### 예시 1: 드론 샷

**입력**:
```javascript
STYLE: "Cinematic, 4K, Aerial photography"
CAMERA: "Drone shot, slowly rising and rotating"
SUBJECT: "an ancient castle on a cliff"
ACTION: "surrounded by morning mist"
SETTING: "Scottish highlands"
ATMOSPHERE: "golden hour sunlight, ethereal atmosphere"
```

**최종 프롬프트**:
```json
{
  "motion": {
    "ko": "드론이 천천히 상승하며 회전하는 샷",
    "en": "Cinematic, 4K, Aerial photography. Drone shot, slowly rising and rotating of an ancient castle on a cliff surrounded by morning mist in Scottish highlands, golden hour sunlight, ethereal atmosphere.",
    "speed": "slow"
  }
}
```

---

### 예시 2: 액션 시퀀스

**입력**:
```javascript
STYLE: "High-octane action, 120fps slow motion"
CAMERA: "Tracking shot, following subject at high speed"
SUBJECT: "a motorcycle rider in leather jacket"
ACTION: "weaving through traffic, doing stunts"
SETTING: "a busy downtown highway"
ATMOSPHERE: "bright daylight, adrenaline-pumping energy"
```

**최종 프롬프트**:
```json
{
  "motion": {
    "ko": "고속으로 피사체를 따라가는 트래킹 샷",
    "en": "High-octane action, 120fps slow motion. Tracking shot, following subject at high speed of a motorcycle rider in leather jacket weaving through traffic, doing stunts in a busy downtown highway, bright daylight, adrenaline-pumping energy.",
    "speed": "fast"
  }
}
```

---

### 예시 3: 감성적인 클로즈업

**입력**:
```javascript
STYLE: "Intimate drama, Shallow depth of field"
CAMERA: "Slow push-in extreme close-up"
SUBJECT: "a woman's tearful eyes"
ACTION: "blinking slowly, single tear rolling down"
SETTING: "dimly lit bedroom"
ATMOSPHERE: "soft window light, melancholic mood"
```

**최종 프롬프트**:
```json
{
  "motion": {
    "ko": "눈물 흘리는 여성의 눈에 천천히 줌 인",
    "en": "Intimate drama, Shallow depth of field. Slow push-in extreme close-up of a woman's tearful eyes blinking slowly, single tear rolling down in a dimly lit bedroom, soft window light, melancholic mood.",
    "speed": "very slow"
  }
}
```

---

## 체크리스트

프롬프트 작성 시 다음을 확인하세요:

- [ ] 6가지 모듈이 모두 포함되었는가?
- [ ] AI 최적화 순서로 조립되었는가? (STYLE → CAMERA → SUBJECT → ACTION → SETTING → ATMOSPHERE)
- [ ] 카메라 움직임이 구체적으로 명시되었는가?
- [ ] 영문으로 작성되었는가?
- [ ] 문장이 자연스럽게 연결되는가?
- [ ] 불필요한 반복이 없는가?

---

## 추가 팁

### 1. 구체성이 핵심
❌ 나쁜 예: `a person walking`
✅ 좋은 예: `a young woman in a red dress walking slowly with confident stride`

### 2. 카메라 움직임 명확히
❌ 나쁜 예: `camera moves`
✅ 좋은 예: `tracking backward at medium speed, maintaining eye level`

### 3. 분위기 형용사 활용
- Cinematic, dramatic, ethereal, moody, vibrant, gritty, dreamlike, dystopian

### 4. 속도 키워드
- very slow, slow, medium, fast, rapid, ultra slow-motion

### 5. 조명 키워드
- golden hour, blue hour, harsh sunlight, soft diffused light, neon lighting, moonlight

---

## 참고 자료

- [예시 프로젝트 JSON](/public/example-project.json)
- Midjourney Video 공식 문서
- 영화 촬영 용어 사전

---

**작성일**: 2025-10-22
**버전**: 1.0
