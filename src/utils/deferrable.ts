type VoidFunction = () => void
type VoidAsyncFunction = () => Promise<void> | void

type DeferFunction = (f: VoidFunction) => void
type DeferFunctionAsync = (f: VoidAsyncFunction) => void

export function deferrable<R>(f: (defer: DeferFunction) => R): R {
  const callbacks: Array<VoidFunction> = []
  const defer: DeferFunction = (f) => {
    callbacks.unshift(f)
  }

  try {
    return f(defer)
  } finally {
    for (const c of callbacks) {
      c()
    }
  }
}

export async function deferrableAsync<R>(
  f: (defer: DeferFunctionAsync) => Promise<R> | R
): Promise<R> {
  const callbacks: Array<VoidAsyncFunction> = []
  const defer: DeferFunctionAsync = (f) => {
    callbacks.unshift(f)
  }

  try {
    return await f(defer)
  } finally {
    for (const c of callbacks) {
      await c()
    }
  }
}
