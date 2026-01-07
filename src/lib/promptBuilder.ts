/**
 * AI 영상 프롬프트 모듈화 가이드 V8.1 (Final Semantic)
 *
 * Midjourney V7에 최적화된 프롬프트 생성 로직
 */

import type { Library, PromptBlock, SemanticBlocks } from '../types/schema'

/**
 * Base와 Override를 병합하여 최종 프롬프트 생성
 */
export function generateBlockPrompt(library: Library, promptBlock: PromptBlock): string {
  // 1. 데이터 로드 (Base Block & Override)
  const charBase = library.characters[promptBlock.base_character_id]?.blocks || {}
  const locBase = library.locations[promptBlock.base_location_id]?.blocks || {}
  const override = promptBlock.override || {}

  // Helper: 오버라이드 우선 적용 함수
  const getVal = (key: keyof SemanticBlocks, baseBlock: SemanticBlocks): string => {
    return override[key] || baseBlock[key] || ''
  }

  // --------------------------------------------------------
  // [Chunk A: Style] - 영상의 전체적인 화풍 및 장르
  // --------------------------------------------------------
  const styleChunk = [
    getVal('style_main', charBase),
    getVal('style_ref', charBase),
    getVal('media_type', charBase),
    getVal('genre', charBase)
  ].filter(Boolean).join(', ')

  // --------------------------------------------------------
  // [Chunk B: Camera] - 샷의 구도 및 시선 처리
  // --------------------------------------------------------
  const cameraChunk = [
    getVal('camera_shot', locBase),
    getVal('camera_gaze', charBase)
  ].filter(Boolean).join(', ')

  // --------------------------------------------------------
  // [Chunk C: Subject] - 주체(캐릭터/소품), 행동, 외형 디테일
  // --------------------------------------------------------
  const subjectChunk = [
    // 1. 누구인가?
    getVal('char_desc', charBase),

    // 2. 무엇을 하는가? (Override 핵심)
    getVal('action_pose', charBase),
    getVal('char_expression', charBase),

    // 3. 어떻게 생겼는가?
    getVal('char_body', charBase),
    getVal('char_skin', charBase),
    getVal('char_hair', charBase),
    getVal('char_face_shape', charBase),
    getVal('char_features', charBase),
    getVal('char_outfit', charBase),
    getVal('char_acc', charBase),
    getVal('char_held_prop', charBase),
    getVal('char_lighting_side', charBase)
  ].filter(Boolean).join(', ')

  // --------------------------------------------------------
  // [Chunk D: Background] - 배경 장소, 분위기, 조명
  // --------------------------------------------------------
  const bgChunk = [
    // 1. 어디인가?
    getVal('loc_main', locBase),

    // 2. 장소 디테일
    getVal('loc_structure', locBase),
    getVal('loc_material', locBase),
    getVal('loc_objects', locBase),
    getVal('loc_weather', locBase),

    // 3. 분위기 및 조명
    getVal('atmosphere', locBase),
    getVal('loc_light_mood', locBase),
    getVal('loc_light_natural', locBase),
    getVal('loc_light_art', locBase),

    // 4. 공간 배치
    getVal('loc_fg', locBase),
    getVal('loc_bg', locBase)
  ].filter(Boolean).join(', ')

  // --------------------------------------------------------
  // [Chunk E: Parameters] - AI 모델 파라미터 및 품질 태그
  // --------------------------------------------------------
  const paramChunk = [
    getVal('quality_tags', charBase),
    getVal('model_params', charBase)
  ].filter(Boolean).join(' ')

  // ========================================================
  // [Final Assembly] - 최종 조립
  // ========================================================
  // 빈 chunk를 제외하고 조합
  const chunks = [styleChunk, cameraChunk, subjectChunk, bgChunk]
    .filter(Boolean)
    .join('. ')

  const finalPrompt = paramChunk
    ? `${chunks}. ${paramChunk}`
    : chunks

  // 불필요한 공백 및 중복 콤마 제거
  return finalPrompt
    .replace(/ ,/g, ',')
    .replace(/  +/g, ' ')
    .replace(/\. \./g, '.')
    .trim()
}

/**
 * 프롬프트 블록의 시맨틱 키를 읽기 쉬운 형태로 변환
 */
export function formatSemanticKey(key: string): string {
  const keyMap: Record<string, string> = {
    // Style
    'style_main': '메인 스타일',
    'style_ref': '참조 스타일',
    'media_type': '미디어 타입',
    'genre': '장르',

    // Character
    'char_desc': '캐릭터 설명',
    'char_body': '체형',
    'char_hair': '헤어',
    'char_face_shape': '얼굴형',
    'char_features': '특징',
    'char_skin': '피부',
    'char_expression': '표정',
    'char_outfit': '의상',
    'char_acc': '장신구',
    'char_held_prop': '소지품',
    'action_pose': '동작/포즈',
    'camera_gaze': '시선',
    'char_lighting_side': '캐릭터 조명',

    // Location
    'loc_main': '장소',
    'loc_scale': '규모',
    'loc_structure': '구조',
    'loc_material': '재질',
    'loc_objects': '오브젝트',
    'loc_weather': '날씨',
    'loc_light_natural': '자연광',
    'loc_light_art': '인공광',
    'loc_light_mood': '조명 분위기',
    'loc_fg': '전경',
    'loc_mg': '중경',
    'loc_bg': '배경',
    'loc_left': '좌측',
    'loc_right': '우측',
    'loc_ceiling': '천장',
    'loc_floor': '바닥',

    // Props
    'prop_name': '소품명',
    'prop_condition': '상태',
    'prop_detail': '디테일',
    'prop_function': '기능',
    'prop_special': '특수효과',
    'prop_glow': '발광',
    'prop_bg': '소품 배경',

    // Camera & Quality
    'camera_shot': '카메라 샷',
    'atmosphere': '분위기',
    'bg_simple': '간단 배경',
    'quality_tags': '품질 태그',
    'model_params': '모델 파라미터'
  }

  return keyMap[key] || key
}
