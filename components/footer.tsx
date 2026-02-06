import Link from 'next/link'
import { Icons } from '@/components/icons'
import type { SiteConfig } from '@/types/site'

interface FooterProps {
  siteInfo: SiteConfig
}

export function Footer({ siteInfo }: FooterProps) {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t py-6 md:py-0">
      <div className="container flex flex-col items-center gap-4 md:h-16 md:flex-row md:justify-center">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          {/* 新增：免责声明（小灰字、更小字体，居中对齐） */}
          <p className="text-center text-xs text-gray-500 leading-relaxed mb-2 md:mb-0">
            免责声明：{siteInfo.basic.title}（resgo.cc）为纯资源导航站点，未存储任何影视、音乐、小说等资源，所有链接均来源于网络。<br className="md:hidden" />
            本站仅提供导航指向服务，若链接侵犯您的权益，请联系邮箱：<span className="text-gray-600">xxx@xxx.com</span> 进行删除，本站将配合处理，不承担任何法律责任。
          </p>
          {/* 原有版权文字：微调字体大小为xs，颜色改为gray-500（小灰字） */}
          <p className="text-center text-xs leading-loose text-gray-500">
            {currentYear} {siteInfo.basic.title}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
