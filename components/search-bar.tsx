'use client'

import { useState, useRef, useEffect } from 'react'
import { Input } from '@/registry/new-york/ui/input'
import { Button } from '@/registry/new-york/ui/button'
import { Search, X, ChevronDown } from 'lucide-react'
import type { NavigationData } from '@/types/navigation'
import type { SiteConfig } from '@/types/site'

// 新增 Yandex 搜索引擎配置
const SEARCH_ENGINES = [
  {
    id: 'baidu',
    name: '百度',
    url: 'https://www.baidu.com/s?wd='
  },
  {
    id: 'google',
    name: '谷歌',
    url: 'https://www.google.com/search?q='
  },
  {
    id: 'bing',
    name: '必应',
    url: 'https://cn.bing.com/search?q='
  },
  {
    id: 'yandex', // 新增 Yandex 标识
    name: 'Yandex', // 显示名称
    url: 'https://yandex.com/search/?text=' // Yandex 搜索地址
  }
]

interface SearchBarProps {
  navigationData?: NavigationData // 保留原属性避免报错，不再使用
  onSearch?: (query: string) => void // 保留原属性避免报错，不再使用
  searchResults?: any[] // 保留原属性避免报错，不再使用
  searchQuery?: string // 保留原属性避免报错，不再使用
  siteConfig?: SiteConfig
}

export function SearchBar({ siteConfig }: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [searchText, setSearchText] = useState('') // 独立管理搜索框内容
  const [selectedEngine, setSelectedEngine] = useState(SEARCH_ENGINES[0]) // 默认选中百度
  const [showEngineList, setShowEngineList] = useState(false) // 控制搜索引擎下拉显示
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // 点击外部关闭弹窗/下拉
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

  // 快捷键逻辑（保留原有的esc/ctrl+k，仅修改搜索行为）
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
      if (event.key === 'Enter' && searchText.trim()) {
        handleSearch()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [searchText, selectedEngine])

  // 清空搜索框
  const clearSearch = () => {
    setSearchText('')
    setIsFocused(false)
    inputRef.current?.focus()
  }

  // 执行互联网搜索
  const handleSearch = () => {
    if (!searchText.trim()) return
    // 拼接搜索引擎URL并打开
    const searchUrl = selectedEngine.url + encodeURIComponent(searchText)
    const linkTarget = siteConfig?.navigation?.linkTarget || '_blank'
    window.open(searchUrl, linkTarget)
  }

  return (
    <div ref={searchRef} className="relative w-full max-w-lg mx-auto">
      <div className="relative flex items-center">
        {/* 搜索引擎切换按钮 */}
        <button
          onClick={() => setShowEngineList(!showEngineList)}
          className="absolute left-3 top-1/2 transform -translate-y-1/2 h-6 w-20 flex items-center justify-between text-sm text-muted-foreground bg-transparent border-0 cursor-pointer"
        >
          {selectedEngine.name}
          <ChevronDown className="h-3 w-3" />
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

        {/* 搜索输入框（调整内边距，避开左侧切换按钮） */}
        <Input
          ref={inputRef}
          placeholder="搜索互联网内容..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onFocus={() => setIsFocused(true)}
          className="pl-24 pr-20 h-10 rounded-lg border shadow-sm" // 左侧内边距加大，避开切换按钮
        />

        {/* 清空按钮 */}
        {searchText && (
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
          disabled={!searchText.trim()}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-accent rounded-full flex items-center justify-center"
        >
          <Search className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}
