import { useCallback, useEffect, useState } from 'react'
import * as conversationService from '../services/conversationService.js'
import { getErrorMessage } from '../utils/errorMessage.js'
import { downloadFile } from '../utils/downloadFile.js'

const PAGE_SIZE = 20

export function useConversationHistory({ onConversationsRemoved } = {}) {
  const [conversations, setConversations] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState('')

  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('updated')
  const [includeArchived, setIncludeArchived] = useState(false)

  const [isSelectMode, setIsSelectMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState([])

  const [renamingId, setRenamingId] = useState(null)
  const [confirmState, setConfirmState] = useState(null)

  const load = useCallback(
    (targetPage, { append = false } = {}) => {
      const setLoadingFlag = append ? setIsLoadingMore : setIsLoading
      setLoadingFlag(true)
      setError('')
      return conversationService
        .getConversations({ page: targetPage, limit: PAGE_SIZE, search, sort, includeArchived })
        .then(({ conversations: data, pagination }) => {
          setConversations((prev) => (append ? [...prev, ...data] : data))
          setPage(pagination.page)
          setTotalPages(pagination.totalPages)
        })
        .catch((err) => setError(getErrorMessage(err)))
        .finally(() => setLoadingFlag(false))
    },
    [search, sort, includeArchived],
  )

  useEffect(() => {
    load(1)
  }, [load])

  function loadMore() {
    if (isLoadingMore || page >= totalPages) return
    load(page + 1, { append: true })
  }

  function refreshFirstPage() {
    return load(1)
  }

  function toggleSelectMode() {
    setIsSelectMode((prev) => !prev)
    setSelectedIds([])
  }

  function toggleSelected(id) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((existing) => existing !== id) : [...prev, id]))
  }

  async function rename(id, title) {
    setError('')
    try {
      const updated = await conversationService.renameConversation(id, title)
      setConversations((prev) => prev.map((c) => (c.id === id ? updated : c)))
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setRenamingId(null)
    }
  }

  async function toggleArchived(conversation) {
    setError('')
    try {
      const updated = await conversationService.setConversationArchived(conversation.id, !conversation.archivedAt)
      if (!includeArchived && updated.archivedAt) {
        setConversations((prev) => prev.filter((c) => c.id !== conversation.id))
      } else {
        setConversations((prev) => prev.map((c) => (c.id === conversation.id ? updated : c)))
      }
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  async function duplicate(id) {
    setError('')
    try {
      await conversationService.duplicateConversation(id)
      await refreshFirstPage()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  async function exportOne(id, format) {
    setError('')
    try {
      const { blob, filename } = await conversationService.exportConversation(id, format)
      downloadFile(blob, filename)
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  function requestDeleteOne(id) {
    setConfirmState({ type: 'one', id })
  }

  function requestDeleteSelected() {
    if (selectedIds.length === 0) return
    setConfirmState({ type: 'many' })
  }

  function requestDeleteAll() {
    setConfirmState({ type: 'all' })
  }

  function cancelConfirm() {
    setConfirmState(null)
  }

  async function confirmDelete() {
    if (!confirmState) return
    setError('')
    try {
      let removedIds = []
      if (confirmState.type === 'one') {
        await conversationService.deleteConversation(confirmState.id)
        removedIds = [confirmState.id]
      } else if (confirmState.type === 'many') {
        removedIds = await conversationService.bulkDeleteConversations({ ids: selectedIds })
      } else if (confirmState.type === 'all') {
        removedIds = await conversationService.bulkDeleteConversations({ all: true })
      }
      setConversations((prev) => prev.filter((c) => !removedIds.includes(c.id)))
      setSelectedIds((prev) => prev.filter((id) => !removedIds.includes(id)))
      setIsSelectMode(false)
      onConversationsRemoved?.(removedIds)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setConfirmState(null)
    }
  }

  return {
    conversations,
    isLoading,
    isLoadingMore,
    hasMore: page < totalPages,
    loadMore,
    error,
    search,
    setSearch,
    sort,
    setSort,
    includeArchived,
    setIncludeArchived,
    isSelectMode,
    toggleSelectMode,
    selectedIds,
    toggleSelected,
    renamingId,
    setRenamingId,
    rename,
    toggleArchived,
    duplicate,
    exportOne,
    requestDeleteOne,
    requestDeleteSelected,
    requestDeleteAll,
    confirmState,
    cancelConfirm,
    confirmDelete,
    refreshFirstPage,
  }
}
