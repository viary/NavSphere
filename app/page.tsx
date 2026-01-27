import { NavigationContent } from '@/components/navigation-content'
import { Metadata } from 'next/types'
import { ScrollToTop } from '@/components/ScrollToTop'
import { Container } from '@/components/ui/container'
import type { SiteConfig } from '@/types/site'
import navigationData from '@/navsphere/content/navigation.json'
import siteDataRaw from '@/navsphere/content/site.json'

function getData() {
  // 确保 theme 类型正确
  const siteData: SiteConfig = {
    ...siteDataRaw,
    appearance: {
      ...siteDataRaw.appearance,
      theme: (siteDataRaw.appearance.theme === 'light' ||
        siteDataRaw.appearance.theme === 'dark' ||
        siteDataRaw.appearance.theme === 'system')
        ? siteDataRaw.appearance.theme
        : 'system'
    },
    navigation: {
      linkTarget: (siteDataRaw.navigation?.linkTarget === '_blank' ||
        siteDataRaw.navigation?.linkTarget === '_self')
        ? siteDataRaw.navigation.linkTarget
        : '_blank'
    }
  }

  // 过滤只显示启用的分类和网站
  const filteredNavigationData = {
    navigationItems: navigationData.navigationItems
      .filter(category => (category as any).enabled !== false) // 过滤启用的分类
      .map(category => {
        const filteredSubCategories = category.subCategories
          ? (category.subCategories as any[])
              .filter(sub => sub.enabled !== false) // 过滤启用的子分类
              .map(sub => ({
                ...sub,
                items: sub.items?.filter((item: any) => item.enabled !== false) // 过滤启用的网站
              }))
          : undefined
        
        return {
          ...category,
          items: category.items?.filter(item => item.enabled !== false), // 过滤启用的网站
          subCategories: filteredSubCategories
        }
      })
  }

  return {
    navigationData: filteredNavigationData || { navigationItems: [] },
    siteData: siteData || {
      basic: {
        title: 'NavSphere',
        description: '',
        keywords: ''
      },
      appearance: {
        logo: '',
        favicon: '',
        theme: 'system' as const
      },
      navigation: {
        linkTarget: '_blank' as const
      }
    }
  }
}

export function generateMetadata(): Metadata {
  const { siteData } = getData()

  return {
    title: siteData.basic.title,
    description: siteData.basic.description,
    keywords: siteData.basic.keywords,
    icons: {
      icon: siteData.appearance.favicon,
    },
  }
}

export default function HomePage() {
  const { navigationData, siteData } = getData()

  return (
    <Container>
      <NavigationContent navigationData={navigationData} siteData={siteData} />

      {/* ↓↓↓ 新增这5行独立通知栏，完全脱离SearchBar ↓↓↓ */}
      <div className="w-full max-w-lg mx-auto my-2">
        <p className="px-2 py-1 text-sm text-center text-gray-700 dark:text-gray-300 bg-gray-100/80 dark:bg-gray-800/80 rounded-lg truncate"
           title="【通知】网站目前还在更新完善中，更多资源将陆续上架，敬请期待！">
          【通知】网站目前还在更新完善中，更多资源将陆续上架，敬请期待！
        </p>
      </div>
      {/* ↑↑↑ 新增结束 ↑↑↑ */}
      
      <ScrollToTop />
    </Container>
  )
}
