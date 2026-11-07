import { useApp } from './state';
import { TopBar } from './components/TopBar';
import { WorldMap } from './screens/WorldMap';
import { TerritoryScreen } from './screens/TerritoryScreen';
import { EditorScreen } from './screens/EditorScreen';
import { ModeScreen } from './screens/ModeScreen';
import { GameScreen } from './screens/GameScreen';
import { ResultsScreen } from './screens/ResultsScreen';

export default function App() {
  const { view, session, summary } = useApp();
  const immersive = view.name === 'game' || view.name === 'results';

  return (
    <div className="flex min-h-screen flex-col">
      {!immersive ? <TopBar /> : null}

      <div className="flex-1">
        {view.name === 'map' ? <WorldMap /> : null}
        {view.name === 'territory' ? <TerritoryScreen id={view.id} /> : null}
        {view.name === 'editor' ? <EditorScreen id={view.id} /> : null}
        {view.name === 'modes' ? <ModeScreen id={view.id} /> : null}
        {view.name === 'game' ? (
          session ? <GameScreen key={session.key} /> : <WorldMap />
        ) : null}
        {view.name === 'results' ? summary ? <ResultsScreen /> : <WorldMap /> : null}
      </div>

      {!immersive ? (
        <footer className="mx-auto w-full max-w-[1520px] px-4 pb-8 text-center text-[10px] uppercase tracking-[0.22em] text-muted/40 sm:px-6 lg:px-10">
          WORDVERSE · vocabolario curato a mano · nessun account richiesto
        </footer>
      ) : null}
    </div>
  );
}
