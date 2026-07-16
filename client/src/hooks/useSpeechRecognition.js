import { useCallback, useEffect, useRef, useState } from 'react'

function describeSpeechError(code) {
  switch (code) {
    case 'not-allowed':
    case 'permission-denied':
      return 'Microphone access was denied. Please allow microphone access and try again.'
    case 'audio-capture':
      return 'No microphone was found. Please check your device.'
    case 'network':
      return 'A network error occurred during voice recognition. Please try again.'
    default:
      return 'Voice input failed. Please try again.'
  }
}

// getBaseText: () => string — reads whatever text is already in the input when
// listening starts, so voice input appends to it instead of overwriting it.
// onTranscript: (text) => void — called with the live (interim + final) transcript.
export function useSpeechRecognition({ getBaseText, onTranscript } = {}) {
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState('')
  const recognitionRef = useRef(null)
  const finalTranscriptRef = useRef('')

  const SpeechRecognitionCtor =
    typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null
  const isSupported = Boolean(SpeechRecognitionCtor)

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop()
    }
  }, [])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
  }, [])

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError('Voice input is not supported in this browser.')
      return
    }
    if (recognitionRef.current) return

    setError('')
    finalTranscriptRef.current = ''
    const baseText = (getBaseText ? getBaseText() : '').trim()

    const recognition = new SpeechRecognitionCtor()
    recognition.lang = 'en-US'
    recognition.continuous = true
    recognition.interimResults = true

    recognition.onstart = () => setIsListening(true)

    recognition.onresult = (event) => {
      let interim = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscriptRef.current += transcript
        } else {
          interim += transcript
        }
      }
      const spoken = `${finalTranscriptRef.current}${interim}`.trim()
      onTranscript?.(baseText && spoken ? `${baseText} ${spoken}` : baseText || spoken)
    }

    // "no-speech" and "aborted" aren't real failures — they fire on a silent
    // mic or a deliberate stop() call, and onend already resets isListening.
    recognition.onerror = (event) => {
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        setError(describeSpeechError(event.error))
      }
    }

    recognition.onend = () => {
      setIsListening(false)
      recognitionRef.current = null
    }

    recognitionRef.current = recognition
    try {
      recognition.start()
    } catch {
      setError('Could not start voice input. Please try again.')
      recognitionRef.current = null
    }
  }, [SpeechRecognitionCtor, getBaseText, isSupported, onTranscript])

  const toggleListening = useCallback(() => {
    if (recognitionRef.current) {
      stopListening()
    } else {
      startListening()
    }
  }, [startListening, stopListening])

  return { isSupported, isListening, error, toggleListening }
}
