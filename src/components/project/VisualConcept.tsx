import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2, User, Copy, Check } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useLanguage } from '@/contexts/LanguageContext'

interface Character {
  id: string
  name: string
  role?: string
  description: string
  visualDescription: string
  consistency?: string | {
    age: string
    gender: string
    build?: string
    hair: string
    eyes: string
    outfit: string
    equipment?: string
    features: string
  }
  consistency_tr?: string | {
    age: string
    gender: string
    build?: string
    hair: string
    eyes: string
    outfit: string
    equipment?: string
    features: string
  }
}

interface VisualConceptProps {
  characters: Character[]
  onUpdate: (characters: Character[]) => void
}

export function VisualConcept({ characters, onUpdate }: VisualConceptProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null)
  const [characterImages, setCharacterImages] = useState<Record<string, string>>({})
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const { t } = useLanguage()

  // 첫 캐릭터 자동 선택
  useEffect(() => {
    console.log('VisualConcept - characters:', characters)
    if (characters.length > 0) {
      // selectedCharacterId가 현재 캐릭터 목록에 없으면 첫 번째 캐릭터 선택
      const exists = characters.find(c => c.id === selectedCharacterId)
      if (!exists) {
        console.log('첫 번째 캐릭터 선택:', characters[0].id)
        setSelectedCharacterId(characters[0].id)
      }
    }
  }, [characters, selectedCharacterId])

  // localStorage에서 이미지 로드
  useEffect(() => {
    const images: Record<string, string> = {}

    characters.forEach(char => {
      const saved = localStorage.getItem(`character_image_${char.id}`)
      if (saved) images[char.id] = saved
    })
    setCharacterImages(images)
  }, [characters])

  const selectedCharacter = characters.find(c => c.id === selectedCharacterId)

  const addCharacter = () => {
    const newCharacter: Character = {
      id: `char_${Date.now()}`,
      name: '',
      role: '',
      description: '',
      visualDescription: '',
      consistency: {
        age: '',
        gender: '',
        build: '',
        hair: '',
        eyes: '',
        outfit: '',
        equipment: '',
        features: ''
      }
    }
    onUpdate([...characters, newCharacter])
    setEditingId(newCharacter.id)
  }

  const deleteCharacter = (id: string) => {
    if (confirm('이 캐릭터를 삭제하시겠습니까?')) {
      onUpdate(characters.filter(c => c.id !== id))
      localStorage.removeItem(`character_image_${id}`)
      if (selectedCharacterId === id) {
        setSelectedCharacterId(characters[0]?.id || null)
      }
    }
  }

  const updateCharacter = (id: string, field: string, value: string) => {
    onUpdate(characters.map(char =>
      char.id === id ? { ...char, [field]: value } : char
    ))
  }

  // updateConsistency 함수 제거 (사용하지 않음)

  const handleImageUrlChange = (id: string, url: string) => {
    setCharacterImages(prev => ({ ...prev, [id]: url }))
    localStorage.setItem(`character_image_${id}`, url)
  }

  const handleCopyVisualDescription = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // handleToggleLanguage 함수 제거 (사용하지 않음)

  if (characters.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <User className="h-16 w-16 text-muted-foreground" />
        <p className="text-muted-foreground">{t.noCharacters}</p>
        <Button onClick={addCharacter}>
          <Plus className="h-4 w-4 mr-2" />
          {t.addCharacter}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">{t.visualConceptTitle}</h2>
        <Button onClick={addCharacter} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          {t.addCharacter}
        </Button>
      </div>

      {/* Character Tabs */}
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 border-b pb-2 min-w-fit">
          {characters.map((character) => (
            <Button
              key={character.id}
              variant={selectedCharacterId === character.id ? "default" : "outline"}
              onClick={() => setSelectedCharacterId(character.id)}
              className="whitespace-nowrap flex-shrink-0"
            >
              <User className="h-4 w-4 mr-2" />
              {character.name || t.characterName}
            </Button>
          ))}
        </div>
      </div>

      {/* Character Content */}
      {selectedCharacter && (() => {
        // consistency 변수 제거 (사용하지 않음)

        return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left: Character Info */}
          <Card>
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="p-2 rounded-md bg-muted">
                  <User className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                </div>
                {editingId === selectedCharacter.id ? (
                  <Input
                    value={selectedCharacter.name}
                    onChange={(e) => updateCharacter(selectedCharacter.id, 'name', e.target.value)}
                    placeholder={t.characterName}
                    className="h-8 max-w-[120px] sm:max-w-[160px]"
                  />
                ) : (
                  <CardTitle className="cursor-pointer truncate" onClick={() => setEditingId(selectedCharacter.id)}>
                    {selectedCharacter.name || t.characterName}
                  </CardTitle>
                )}
                <Badge variant="outline" className="flex-shrink-0 text-xs">{selectedCharacter.role || t.role}</Badge>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteCharacter(selectedCharacter.id)}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Basic Info */}
              <div className="space-y-2">
                <label className="text-sm font-medium">{t.role}</label>
                <Input
                  value={selectedCharacter.role}
                  onChange={(e) => updateCharacter(selectedCharacter.id, 'role', e.target.value)}
                  placeholder={`${t.protagonist}, ${t.supporting}`}
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium">{t.description}</label>
                <textarea
                  value={selectedCharacter.description}
                  onChange={(e) => updateCharacter(selectedCharacter.id, 'description', e.target.value)}
                  placeholder={t.characterDescription}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                  rows={3}
                />
              </div>

              {/* Visual Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium">{t.visualDescription}</label>
                <div className="relative">
                  <textarea
                    value={selectedCharacter.visualDescription}
                    onChange={(e) => updateCharacter(selectedCharacter.id, 'visualDescription', e.target.value)}
                    placeholder="a 12-year-old girl with long brown hair..."
                    className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                    rows={6}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCopyVisualDescription(selectedCharacter.visualDescription, `char_${selectedCharacter.id}`)}
                    className="absolute top-2 right-2 h-8 w-8"
                  >
                    {copiedId === `char_${selectedCharacter.id}` ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right: Image Preview */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="text-lg">{t.characterImage}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t.imageUrl}</label>
                <Input
                  value={characterImages[selectedCharacter.id] || ''}
                  onChange={(e) => handleImageUrlChange(selectedCharacter.id, e.target.value)}
                  placeholder="https://..."
                  className="font-mono"
                />
              </div>
              {characterImages[selectedCharacter.id] && (
                <div className="h-[300px] border rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                  <img
                    src={characterImages[selectedCharacter.id]}
                    alt={selectedCharacter.name}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        )
      })()}
    </div>
  )
}
