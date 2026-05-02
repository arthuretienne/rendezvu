import type { SupabaseClient } from '@supabase/supabase-js'
import type { Item } from './types'

const TMDB_BASE = 'https://api.themoviedb.org/3'
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500'

export interface TmdbMovie {
  id: number
  title: string
  overview: string | null
  poster_path: string | null
  release_date: string
  vote_average?: number
  runtime?: number | null
  genres?: { id: number; name: string }[]
  genre_ids?: number[]
}

export function getPosterUrl(path: string | null): string | null {
  if (!path) return null
  return `${TMDB_IMAGE_BASE}${path}`
}

export async function searchMovies(query: string, year?: string): Promise<TmdbMovie[]> {
  if (query.trim().length < 2) return []
  const params = new URLSearchParams({
    api_key: (process.env.NEXT_PUBLIC_TMDB_API_KEY ?? '').trim(),
    query,
    include_adult: 'false',
  })
  if (year) params.set('year', year)
  const res = await fetch(`${TMDB_BASE}/search/movie?${params}`)
  if (!res.ok) return []
  const data = await res.json()
  return (data.results ?? []).slice(0, 10) as TmdbMovie[]
}

export async function getMovieDetails(tmdbId: number): Promise<TmdbMovie | null> {
  const params = new URLSearchParams({
    api_key: (process.env.NEXT_PUBLIC_TMDB_API_KEY ?? '').trim(),
  })
  const res = await fetch(`${TMDB_BASE}/movie/${tmdbId}?${params}`)
  if (!res.ok) return null
  return res.json() as Promise<TmdbMovie>
}

/**
 * Upsert a TMDB movie into the items table (deduped by kind+tmdb_id) and return
 * its row. Safe to call from the client — items has an authenticated INSERT
 * policy with no row-level constraint.
 */
export async function upsertMovieItem(
  supabase: SupabaseClient,
  movie: TmdbMovie,
): Promise<Item | null> {
  const year = movie.release_date ? Number(movie.release_date.slice(0, 4)) : null
  const genreNames = movie.genres?.map(g => g.name)
  const payload = {
    kind: 'movie' as const,
    tmdb_id: movie.id,
    title: movie.title,
    year: Number.isFinite(year) ? year : null,
    poster_path: movie.poster_path,
    overview: movie.overview,
    runtime: movie.runtime ?? null,
    genres: genreNames && genreNames.length > 0 ? genreNames : null,
  }
  const { data, error } = await supabase
    .from('items')
    .upsert(payload, { onConflict: 'kind,tmdb_id' })
    .select('*')
    .single()
  if (error || !data) return null
  return data as Item
}
