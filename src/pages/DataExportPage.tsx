import { SettingRow, SettingsGroup } from 'app-account-kit';
import { useRef, useState } from 'react';
import { createOneAtATime } from '../logic/oneAtATime';
import { DEFAULT_SETTINGS_STRINGS } from '../strings';
import type { DataExportConfig, DataExportPageProps, ExportRowProps } from '../types';
import type { ExtraPage } from 'app-account-kit';

/**
 * The standard row (HringNring's approved look): while locked, a padlock on a soft circle in place of the arrow, and a tap opens the plans;
 * once open, a download icon, and a tap makes the file. An app that passes `lockedBadge` or `lockedValue` gets those on the right instead of the padlock.
 */
function DefaultRow({ format, last, onPress }: ExportRowProps) {
  const locked = !!format.locked;
  const ownLock = locked && (format.lockedBadge !== undefined || format.lockedValue !== undefined);
  return (
    <SettingRow
      icon={format.icon}
      tint={format.tint}
      label={format.label}
      detail={locked ? (format.lockedDetail ?? format.detail) : format.detail}
      value={ownLock ? format.lockedValue : undefined}
      badge={ownLock ? format.lockedBadge : undefined}
      locked={locked && !ownLock}
      trailing="download"
      onPress={onPress}
      last={last}
    />
  );
}

type Props = DataExportPageProps & {
  /** The sentence shown when a file could not be made. */
  problemText?: string;
};

/**
 * The Data Export page: one row per file format (CSV, PDF...). Each format has its own lock, so one app can keep CSV free and lock PDF while another locks both.
 * One file at a time; a failure is reported to `onError` and shown in plain words.
 */
export function DataExportPage({ formats, onLocked, onError, onProblem, renderProblem, Row = DefaultRow, problemText = DEFAULT_SETTINGS_STRINGS.exportFailed }: Props) {
  const [problem, setProblem] = useState<string | null>(null);
  // The latest callbacks, read when a job fails (the runner itself lives as long as the page, so its busy flag survives re-renders).
  const report = useRef({ onError, onProblem, problemText });
  report.current = { onError, onProblem, problemText };
  const runner = useRef<ReturnType<typeof createOneAtATime> | null>(null);
  runner.current ??= createOneAtATime((error) => {
    const { onError: log, onProblem: tell, problemText: text } = report.current;
    log?.('data-export', error);
    if (tell) tell(text);
    else setProblem(text);
  });
  const press = (i: number) => () => {
    const format = formats[i];
    if (format.locked) {
      onLocked?.();
      return;
    }
    if (runner.current?.busy) return;
    setProblem(null);
    runner.current?.run(format.onExport);
  };
  return (
    <>
      <SettingsGroup>
        {formats.map((format, i) => (
          <Row key={format.id} format={format} last={i === formats.length - 1} onPress={press(i)} />
        ))}
      </SettingsGroup>
      {problem && renderProblem ? renderProblem(problem) : null}
    </>
  );
}

/**
 * Data Export as a pull-down menu on its row (3.3.0): one line per format with its icon (a padlock while locked). A tap on an
 * open format runs `onExport` through `run` (one file at a time); on a locked one it calls `onLocked`.
 */
export function exportMenu(config: DataExportConfig, run: (job: () => Promise<unknown>) => void): NonNullable<ExtraPage['menu']> {
  const { formats } = config;
  const only = formats.length === 1 ? formats[0] : undefined;
  const head = typeof config.menu === 'object' && config.menu.head !== undefined ? config.menu.head : only?.detail;
  return {
    // 3.4.0: several formats show all their short words in the pill ("CSV / PDF"), so the row always shows it opens a menu.
    pill: formats.map((f) => f.pill ?? f.label.split(' ')[0]).join(' / ') || undefined,
    head,
    items: formats.map((f) => ({ id: f.id, label: f.label, icon: f.locked ? 'lock' : 'share' })),
    onPick: (id) => {
      const format = formats.find((f) => f.id === id);
      if (!format) return;
      if (format.locked) config.onLocked?.();
      else run(format.onExport);
    },
  };
}
