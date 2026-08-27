import defaultMdxComponents from 'fumadocs-ui/mdx'
import type { MDXComponents } from 'mdx/types'
import { Glossary } from '@/components/ui/glossary'
import { Term } from '@/components/ui/term'
import { WeekHeader } from '@/components/ui/week-header'
import { Homework } from '@/components/ui/homework'
import { Callout } from '@/components/ui/callout'
import { ThreeStages } from '@/components/visuals/three-stages'
import { TwoHourBlock } from '@/components/visuals/two-hour-block'
import { JourneyMap } from '@/components/visuals/journey-map'
import { CurrentWeekBanner } from '@/components/ui/current-week-banner'
import { WhyStudy } from '@/components/visuals/why-study'
import { Roadmap } from '@/components/visuals/roadmap'

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    Glossary,
    Term,
    WeekHeader,
    Homework,
    Callout,
    ThreeStages,
    TwoHourBlock,
    JourneyMap,
    CurrentWeekBanner,
    WhyStudy,
    Roadmap,
    ...components,
  } satisfies MDXComponents
}
