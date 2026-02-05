'use client'

import { useState, useRef, useEffect } from 'react'
import { Input } from '@/registry/new-york/ui/input'
import { Button } from '@/registry/new-york/ui/button'
import { Command, CommandList, CommandGroup, CommandItem } from '@/registry/new-york/ui/command'
import { Search, X, ChevronDown } from 'lucide-react'
import type { NavigationData, NavigationItem, NavigationSubItem } from '@/types/navigation'
import type { SiteConfig } from '@/types/site'

const SEARCH_ENGINES = [
  { id: 'baidu', name: '百度', url: 'https://www.baidu.com/s?wd=' },
  { id: 'google', name: '谷歌', url: 'https://www.google.com/search?q=' },
  { id: 'bing', name: '必应', url: 'https://cn.bing.com/search?q=' },
  { id: 'yandex', name: 'Yandex', url: 'https://yandex.com/search/?text=' },
  { id: 'local', name: '站内', url: '' }
]

interface SearchBarProps {
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

      if (event.key === 'Enter' && searchQuery.trim()) {
        handleSearch()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [searchQuery, selectedEngine])

  const highlightText = (text: string) => {
    if (!searchQuery) return text
    const parts = text.split(new RegExp(`(${searchQuery})`, 'gi'))
    return parts.map((part, i) => 
      part.toLowerCase() === searchQuery.toLowerCase() ? 
        <span key={i} className="bg-yellow-200 dark:bg-yellow-800">{part}</span> : part
    )
  }

  const handleItemSelect = (item: NavigationItem | NavigationSubItem) => {
    const itemWithHref = item as NavigationSubItem
    if (itemWithHref.href) {
      const linkTarget = siteConfig?.navigation?.linkTarget || '_blank'
      linkTarget === '_self' ? window.location.href = itemWithHref.href : window.open(itemWithHref.href, linkTarget)
    }
    onSearch('')
    setIsFocused(false)
  }

  const clearSearch = () => {
    onSearch('')
    setIsFocused(false)
    inputRef.current?.focus()
  }

  const handleSearch = () => {
    if (!searchQuery.trim()) return
    if (selectedEngine.id === 'local') {
      setIsFocused(true)
    } else {
      const searchUrl = selectedEngine.url + encodeURIComponent(searchQuery)
      window.open(searchUrl, siteConfig?.navigation?.linkTarget || '_blank')
    }
  }

  const showResults = isFocused && searchQuery.trim().length > 0

  return (
    <div ref={searchRef} className="relative w-full max-w-lg mx-auto">
      {/* 核心修复：外层容器增加 box-sizing，统一盒模型 */}
      <div className="relative flex items-center w-full h-10 box-border">
        {/* 搜索引擎下拉按钮 - 完整兼容修复 */}
        <button
          onClick={() => setShowEngineList(!showEngineList)}
          className="absolute left-3 z-10 w-20 h-full m-0 p-0 bg-transparent border-0 cursor-pointer
                    flex items-center justify-between text-base font-normal text-muted-foreground
                    box-sizing border-box"
          style={{
            // 显式固化字号和行高，避免浏览器解析差异
            fontSize: '14px',
            lineHeight: '1.2',
            // 补充浏览器前缀，兼容老旧内核
            WebkitAlignItems: 'center',
            MozAlignItems: 'center'
          }}
        >
          {selectedEngine.name}
          <ChevronDown 
            className="h-4 w-4 flex-shrink-0" 
            style={{
              WebkitFlexShrink: 0,
              MozFlexShrink: 0
            }}
          />
        </button>

        {/* 搜索引擎下拉列表 */}
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

        {/* 搜索输入框 - 调整内边距，适配按钮尺寸 */}
        <Input
          ref={inputRef}
          placeholder="输入关键词搜索..."
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          onFocus={() => setIsFocused(true)}
          className="w-full h-full pl-24 pr-20 m-0 rounded-lg border shadow-sm box-border"
          style={{
            // 显式设置输入框字号，与搜索引擎名称保持一致
            fontSize: '14px',
            lineHeight: '1.2'
          }}
        />

        {/* 清空按钮 - 兼容修复 */}
        {searchQuery && (
          <button
            onClick={clearSearch}
            className="absolute right-10 z-10 w-8 h-8 m-0 p-0 bg-transparent border-0 cursor-pointer
                      flex items-center justify-center hover:bg-muted rounded-full
                      box-sizing border-box"
            style={{
              WebkitAlignItems: 'center',
              MozAlignItems: 'center'
            }}
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {/* 搜索按钮（放大镜）- 核心修复：移除transform，改用flex天然居中 */}
        <Button
          onClick={handleSearch}
          disabled={!searchQuery.trim()}
          className="absolute right-2 z-10 w-8 h-8 m-0 p-0 bg-transparent border-0 cursor-pointer
                    flex items-center justify-center hover:bg-accent rounded-full
                    box-sizing border-box"
          style={{
            // 彻底移除transform，避免偏移；补充前缀兼容flex
            WebkitAlignItems: 'center',
            MozAlignItems: 'center',
            WebkitJustifyContent: 'center',
            MozJustifyContent: 'center'
          }}
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {/* 原有站内搜索结果渲染，无修改 */}
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
