import { ProbeBenchSubnav } from '@/components/probebench/subnav'

export default function ProbeBenchLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ProbeBenchSubnav />
      {children}
    </>
  )
}
