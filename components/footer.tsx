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
      <div className="container flex flex-col items-center gap-4 md:h-auto md:flex-col md:justify-center">
        {/* 核心改动：外层div强制所有设备用flex-col（纵向排列），取消md:flex-row */}
        <div className="flex flex-col items-center gap-2 px-8 md:px-0">
          {/* 免责声明：保留原有样式，仅微调间距 */}
          <p className="text-center text-xs text-gray-500 leading-relaxed">
            免责声明：{siteInfo.basic.title}（resgo.cc）为纯资源导航站点，未存储任何资源，所有链接均来源于网络。<br className="md:hidden" />
            本站仅提供导航指向服务，若侵犯您的权益，请联系邮箱：<span className="text-gray-600">userac@163.com</span> 配合删除，不承担任何法律责任。
          </p>
          {/* 版权文字：固定在免责声明下方，保留样式 */}
          <p className="text-center text-xs leading-loose text-gray-500 mt-1">
            {currentYear} {siteInfo.basic.title}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
