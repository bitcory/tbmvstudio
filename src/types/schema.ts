// AI Movie Schema V8.1 타입 정의

export interface SemanticBlocks {
  // Style
  style_main?: string
  style_ref?: string
  media_type?: string
  genre?: string

  // Character
  char_desc?: string
  char_body?: string
  char_hair?: string
  char_face_shape?: string
  char_features?: string
  char_skin?: string
  char_expression?: string
  char_outfit?: string
  char_acc?: string
  char_held_prop?: string
  action_pose?: string
  camera_gaze?: string
  char_lighting_side?: string

  // Location
  loc_main?: string
  loc_scale?: string
  loc_structure?: string
  loc_material?: string
  loc_objects?: string
  loc_weather?: string
  loc_light_natural?: string
  loc_light_art?: string
  loc_light_mood?: string
  loc_fg?: string
  loc_mg?: string
  loc_bg?: string
  loc_left?: string
  loc_right?: string
  loc_ceiling?: string
  loc_floor?: string

  // Props
  prop_name?: string
  prop_condition?: string
  prop_detail?: string
  prop_function?: string
  prop_special?: string
  prop_glow?: string
  prop_bg?: string

  // Camera & Quality
  camera_shot?: string
  atmosphere?: string
  bg_simple?: string
  quality_tags?: string
  model_params?: string
}

export interface BlockSet {
  name: string
  blocks: SemanticBlocks
}

export interface Library {
  characters: Record<string, BlockSet>
  locations: Record<string, BlockSet>
  props: Record<string, BlockSet>
}

export interface Definitions {
  library: Library
}

export interface Motion {
  ko: string  // 한국어 서술
  en: string  // 영어 기술 용어 (Zoom In, Dolly Out, etc.)
  speed?: string  // 레거시 지원
}

export interface PromptBlock {
  base_character_id: string
  base_location_id: string
  override: SemanticBlocks
}

export interface ShotFrame {
  shotType: 'block_based'
  duration: number
  description: string
  promptBlock: PromptBlock
  motion: Motion
}

export interface Shots {
  start: ShotFrame
  middle: ShotFrame
  end: ShotFrame
}

export interface Setting {
  base_location_id: string
  timeOfDay?: string
  atmosphere?: string
}

export interface Scene {
  scene: number
  description: string
  setting: Setting
  shots: Shots
}

export interface Scenario {
  title: string
  summary: string
  script: string
}

export interface Project {
  title: string
  style: string
  totalDuration: number
}

export interface ProjectData {
  project: Project
  scenario: Scenario
  definitions: Definitions
  scenes: Scene[]
}

// Legacy 타입 (하위 호환성)
export interface LegacyFrame {
  shotType?: string
  duration?: number
  description?: string
  promptStructure?: any
  prompt?: string
  parameters?: string
  imageUrl?: string
  videoUrl?: string
  motion?: Motion
}

export interface LegacyScene {
  scene?: number
  sceneNumber?: number
  sceneId?: string
  id?: string
  title?: string
  description?: string
  duration?: number
  setting?: any
  charactersInScene?: string[]
  frames?: {
    start: LegacyFrame
    middle: LegacyFrame
    end: LegacyFrame
  }
  shots?: {
    start: LegacyFrame
    middle: LegacyFrame
    end: LegacyFrame
  }
  transition?: {
    type?: string
    duration: number
  }
}
