import { SettingRow, SettingsGroup } from 'app-account-kit';
import { useRef, useState } from 'react';
import { createOneAtATime } from '../logic/oneAtATime';
import { DEFAULT_SETTINGS_STRINGS } from '../strings';
import type { DataExportPageProps, ExportRowProps } from '../types';

/** The standard row: app-account-kit's SettingRow, with the lock's words and badge while locked. */
function DefaultRow({ format, last, onPress }: ExportRowProps) {
  const locked = !!format.locked;
  return (
    <SettingRow
      icon={format.icon}
      tint={format.tint}
      label={format.label}
      detail={locked ? (format.lockedDetail ?? format.detail) : format.detail}
      value={locked ? format.lockedValue : undefined}
      badge={locked ? format.lockedBadge : undefined}
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
