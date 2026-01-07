export function PromptGenerator() {
  return (
    <div className="w-full h-full p-4 bg-neo-cream">
      <div className="neo-section w-full h-full overflow-hidden">
        <iframe
          src="https://tbprompt.aitoolb.com/"
          className="w-full h-full border-0"
          title="Prompt Generator"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      </div>
    </div>
  )
}
