import { ClientOnly, Link, useRouter } from '@tanstack/react-router';
import { Component, Suspense, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from './ui/button';

class LearningError extends Component<{ children: ReactNode; retry: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <div role="alert" className="p-6"><p>Neizdevās ielādēt mācību datus.</p><Button onClick={() => { this.props.retry(); this.setState({ failed: false }); }}>Mēģināt vēlreiz</Button></div> : this.props.children; }
}
export function LearningBoundary({ children }: { children: ReactNode }) {
  const client = useQueryClient(); const router = useRouter();
  const loading = <p className="p-6 text-muted-foreground">Ielādē…</p>;
  return <ClientOnly fallback={loading}><LearningError retry={() => { client.resetQueries({ queryKey: ['learning'] }); router.invalidate(); }}><Suspense fallback={loading}>{children}</Suspense></LearningError></ClientOnly>;
}
export const SignInToStudy = () => <div className="p-6"><p>Atrisini pirmos uzdevumus</p><Button asChild className="mt-4"><Link to="/pieslegties">Pieslēgties</Link></Button></div>;