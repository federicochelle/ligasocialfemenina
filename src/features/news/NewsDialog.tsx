import { TeamDialog } from '../teams/TeamDialog.tsx'

type NewsDialogProps = Parameters<typeof TeamDialog>[0]

export function NewsDialog(props: NewsDialogProps) {
  return <TeamDialog {...props} panelClassName="dialog-panel--news" />
}
