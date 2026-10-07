type Argon2 = {
  hash: (plain: string) => Promise<string>
  verify: (hash: string, plain: string) => Promise<boolean>
}

let loading: Promise<Argon2> | null = null

/**
 * `argon2` is a native module. Imported at module scope it lands in every
 * serverless bundle that reaches `lib/auth.ts`, i.e. every API route, and on
 * Vercel the whole API answers 500 with "No native build was found for
 * platform=linux arch=x64 runtime=node abi=137". Loading it lazily keeps it in
 * the two routes that actually check a password.
 */
async function argon2(): Promise<Argon2> {
  loading ??= import('argon2').then(module => module.default as unknown as Argon2)
  return loading
}

export async function hashPassword(plain: string): Promise<string> {
  return (await argon2()).hash(plain)
}

export async function verifyPassword(hash: string, plain: string): Promise<boolean> {
  try {
    return await (await argon2()).verify(hash, plain)
  } catch (error) {
    console.error('[PASSWORDS] verify failed', error)
    return false
  }
}
