import defaultMdxComponents from 'fumadocs-ui/mdx'
import type { MDXComponents } from 'mdx/types'
import type { ComponentProps } from 'react'
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
import { StudyArc } from '@/components/visuals/study-arc'
import { ArchiveBoard } from '@/components/archive/archive-board'

// 마크다운 체크리스트(`- [ ]`)는 remark-gfm이 `<input type="checkbox" disabled>`로
// 렌더링하는데, 접근 가능한 이름이 없어 axe-core의 "label" 규칙(모든 <input>은
// 접근 가능한 이름이 있어야 한다)을 위반한다(weeks/04-prd 등 체크리스트가 있는 9개
// 문서에서 실측). 체크 여부 자체가 의미 정보이므로 aria-hidden으로 숨기는 대신,
// 상태를 나타내는 aria-label을 붙여 스크린 리더에서도 완료/미완료가 구분되게 한다.
function TaskListCheckbox(props: ComponentProps<'input'>) {
  if (props.type === 'checkbox') {
    return <input {...props} aria-label={props.checked ? '완료된 항목' : '미완료 항목'} />
  }
  return <input {...props} />
}

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    input: TaskListCheckbox,
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
    StudyArc,
    ArchiveBoard,
    ...components,
  } satisfies MDXComponents
}
