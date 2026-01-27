'use client'

import { useState, useRef, useEffect } from 'react'
import { Input } from '@/registry/new-york/ui/input'
import { Button } from '@/registry/new-york/ui/button'
import { Command, CommandList, CommandGroup, CommandItem } from '@/registry/new-york/ui/command'
import { Search, X, ChevronDown } from 'lucide-react'
import type { NavigationData, NavigationItem, NavigationSubItem } from '@/types/navigation'
import type { SiteConfig } from '@/types/site'

// 1. 核心改动：搜索引擎数组最后加【本地】选项
const SEARCH_ENGINES = [
  { id: 'baidu', name: '百度', url: 'https://www.baidu.com/s?wd=' },
  { id: 'google', name: '谷歌', url: 'https://www.google.com/search?q=' },
  { id: 'bing', name: '必应', url: 'https://cn.bing.com/search?q=' },
  { id: 'yandex', name: 'Yandex', url: 'https://yandex.com/search/?text=' },
  { id: 'local', name: '本地', url: '' } // 新增本地选项，url留空
]

interface SearchBarProps {
  // 恢复原有必填参数，用于站内搜索
  navigationData: NavigationData
  onSearch: (query: string) => void
  searchResults: Array<{
    category: NavigationItem
    items: (NavigationItem | NavigationSubItem)[]
    subCategories: Array<{
      title: string
      items: (NavigationItem | NavigationSubItem)[]
    }>
  }>
  searchQuery: string
  siteConfig?: SiteConfig
}

export function SearchBar({ navigationData, onSearch, searchResults, searchQuery, siteConfig }: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false)
  // 默认选中百度，也可以改成默认本地：SEARCH_ENGINES[4]
  const [selectedEngine, setSelectedEngine] = useState(SEARCH_ENGINES[0])
  const [showEngineList, setShowEngineList] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // 点击外部关闭下拉/搜索结果
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsFocused(false)
        setShowEngineList(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // 快捷键逻辑：esc关闭、ctrl+k聚焦
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsFocused(false)
        setShowEngineList(false)
        inputRef.current?.blur()
      }
      
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault()
        inputRef.current?.focus()
        setIsFocused(true)
      }

      // 回车触发搜索
      if (event.key === 'Enter' && searchQuery.trim()) {
        handleSearch()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [searchQuery, selectedEngine])

  // 恢复站内搜索高亮逻辑
  const highlightText = (text: string) => {
    if (!searchQuery) return text
    const parts = text.split(new RegExp(`(${searchQuery})`, 'gi'))
    return parts.map((part, i) => 
      part.toLowerCase() === searchQuery.toLowerCase() ? 
        <span key={i} className="bg-yellow-200 dark:bg-yellow-800">{part}</span> : part
    )
  }

  // 恢复站内搜索结果点击逻辑
  const handleItemSelect = (item: NavigationItem | NavigationSubItem) => {
    const itemWithHref = item as NavigationSubItem
    if (itemWithHref.href) {
      const linkTarget = siteConfig?.navigation?.linkTarget || '_blank'
      linkTarget === '_self' ? window.location.href = itemWithHref.href : window.open(itemWithHref.href, linkTarget)
    }
    onSearch('')
    setIsFocused(false)
  }

  // 清空搜索
  const clearSearch = () => {
    onSearch('')
    setIsFocused(false)
    inputRef.current?.focus()
  }

  // 2. 核心改动：搜索逻辑分支判断
  const handleSearch = () => {
    if (!searchQuery.trim()) return
    // 选中【本地】→ 显示站内搜索结果
    if (selectedEngine.id === 'local') {
      setIsFocused(true)
    } 
    // 选中其他引擎 → 跳转到全网搜索
    else {
      const searchUrl = selectedEngine.url + encodeURIComponent(searchQuery)
      window.open(searchUrl, siteConfig?.navigation?.linkTarget || '_blank')
    }
  }

  // 显示站内搜索结果的条件
  const showResults = isFocused && searchQuery.trim().length > 0

  return (
    <div ref={searchRef} className="relative w-full max-w-lg mx-auto">
      <div className="relative flex items-center">
        {/* 搜索引擎下拉按钮 */}
        <button
          onClick={() => setShowEngineList(!showEngineList)}
          className="absolute left-3 top-1/2 transform -translate-y-1/2 h-6 w-20 flex items-center justify-between text-sm text-muted-foreground bg-transparent border-0 cursor-pointer"
        >
          {selectedEngine.name}
          <ChevronDown className="h-3 w-3" />
        </button>

        {/* 搜索引擎下拉列表（自动包含【本地】选项） */}
        {showEngineList && (
          <div className="absolute left-3 top-full mt-1 bg-background border rounded-lg shadow-xl z-50 w-28 py-1">
            {SEARCH_ENGINES.map(engine => (
              <div
                key={engine.id}
                onClick={() => {
                  setSelectedEngine(engine)
                  setShowEngineList(false)
                }}
                className="px-3 py-1 text-sm hover:bg-accent cursor-pointer"
              >
                {engine.name}
              </div>
            ))}
          </div>
        )}

        {/* 搜索输入框 */}
        <Input
          ref={inputRef}
          placeholder="输入关键词搜索..."
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          onFocus={() => setIsFocused(true)}
          className="pl-24 pr-20 h-10 rounded-lg border shadow-sm"
        />

        {/* 清空按钮 */}
        {searchQuery && (
          <button
            onClick={clearSearch}
            className="absolute right-10 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted rounded-full flex items-center justify-center"
          >
            <X className="h-3 w-3" />
          </button>
        )}

        {/* 搜索按钮 */}
        <Button
          onClick={handleSearch}
          disabled={!searchQuery.trim()}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-accent rounded-full flex items-center justify-center"
        >
          <Search className="h-3 w-3" />
        </Button>
      </div>

        {/* 通知栏：宽度和搜索框一致，不影响同行的模式/菜单 */}
     <p className="mt-2 w-full text-sm text-center py-1 px-2 bg-gray-100/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 rounded-lg truncate"
        title="【通知】网站目前还在更新完善中，更多资源将陆续上架，敬请期待">
       【通知】网站目前还在更新完善中，更多资源将陆续上架，敬请期待
     </p>
      
      {/* 3. 核心改动：恢复站内搜索结果渲染 */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-xl z-50 max-h-[70vh] overflow-hidden">
          <Command className="border-0 shadow-none">
            <CommandList className="max-h-[70vh] overflow-y-auto">
              {searchResults.length === 0 ? (
                <div className="py-8 text-center">
                  <div className="text-muted-foreground text-sm">
                    未找到与 &ldquo;<span className="font-medium">{searchQuery}</span>&rdquo; 相关的导航
                  </div>
                  <div className="text-xs text-muted-foreground/70 mt-1">
                    尝试切换搜索引擎全网搜索
                  </div>
                </div>
              ) : (
                searchResults.map((result) => (
                  <CommandGroup key={result.category.id} heading={result.category.title}>
                    {result.items.map((item) => (
                      <CommandItem
                        key={item.id}
                        value={item.title}
                        onSelect={() => handleItemSelect(item)}
                        className="flex items-center gap-3 py-3 px-3 cursor-pointer hover:bg-accent/50"
                      >
                        <div className="flex-shrink-0 w-8 h-8">
                          {item.icon && (
                            <img
                              src={item.icon}
                              alt={`${item.title} icon`}
                              className="w-full h-full object-contain rounded"
                              onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
                            />
                          )}
                        </div>
                        <div className="flex flex-col flex-1 gap-1">
                          <span className="text-sm font-medium">{highlightText(item.title)}</span>
                          {item.description && (
                            <span className="text-xs text-muted-foreground line-clamp-1">{highlightText(item.description)}</span>
                          )}
                        </div>
                      </CommandItem>
                    ))}
                    {result.subCategories.map((sub) => (
                      <div key={sub.title}>
                        <div className="px-3 py-2 text-xs font-medium text-muted-foreground bg-muted/30 border-b">
                          {result.category.title} / {sub.title}
                        </div>
                        {sub.items.map((item) => (
                          <CommandItem
                            key={item.id}
                            value={item.title}
                            onSelect={() => handleItemSelect(item)}
                            className="flex items-center gap-3 py-3 px-3 cursor-pointer hover:bg-accent/50"
                          >
                            <div className="flex-shrink-0 w-8 h-8">
                              {item.icon && (
                                <img
                                  src={item.icon}
                                  alt={`${item.title} icon`}
                                  className="w-full h-full object-contain rounded"
                                  onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
                                />
                              )}
                            </div>
                            <div className="flex flex-col flex-1 gap-1">
                              <span className="text-sm font-medium">{highlightText(item.title)}</span>
                              {item.description && (
                                <span className="text-xs text-muted-foreground line-clamp-1">{highlightText(item.description)}</span>
                              )}
                            </div>
                          </CommandItem>
                        ))}
                      </div>
                    ))}
                  </CommandGroup>
                ))
              )}
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  )
}
