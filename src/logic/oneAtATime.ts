/**
 * Runs one job at a time: a second tap while a file is being made (the share sheet is still opening) does nothing.
 * `onFail` gets the error of a job that failed; the next job can start once the running one ends either way.
 */
export function createOneAtATime(onFail: (error: unknown) => void) {
  let busy = false;
  return {
    get busy() {
      return busy;
    },
    /** Returns false when another job is still running (this one was skipped). */
    run(job: () => Promise<unknown>): boolean {
      if (busy) return false;
      busy = true;
      Promise.resolve()
        .then(job)
        .catch(onFail)
        .finally(() => {
          busy = false;
        });
      return true;
    },
  };
}
