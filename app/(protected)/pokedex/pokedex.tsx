'use client';

import { useEffect, useState } from 'react';

import { Catch } from '@parthenonlab/types';
import { Loading } from '@/components';
import { POKEMON_TYPE_MAP, POKEMON_URLS } from '@/constants/pokemon';
import { useFetch } from '@/hooks';

import styles from './page.module.scss';
import { formatDate, formatPokemonName } from '@/lib/utils';

interface Pokemon {
  id: number;
  name: string;
  sprite: string;
  types: string[];
}

interface CaughtEntry {
  caughtAt: Date;
  count: number;
}

const fetchAllPokemon = async (): Promise<Pokemon[]> => {
  const listRes = await fetch(`${POKEMON_URLS.POKEAPI}?limit=151`);
  const list = await listRes.json();

  return list.results.map((entry: { name: string; url: string }, i: number) => ({
    id: i + 1,
    name: entry.name,
    sprite: `${POKEMON_URLS.POKEMONDB}/${entry.name}.png`,
    types: POKEMON_TYPE_MAP[entry.name] ?? [],
  }));
};

export const Pokedex = () => {
  const { fetchGetArray } = useFetch();
  const [pokemon, setPokemon] = useState<Pokemon[]>([]);
  const [caughtMap, setCaughtMap] = useState<Map<number, CaughtEntry>>(
    new Map(),
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchAllPokemon(), fetchGetArray<Catch>('/api/catches')]).then(
      ([allPokemon, catches]) => {
        setPokemon(allPokemon);
        const map = new Map<number, CaughtEntry>();
        for (const c of catches) {
          const existing = map.get(c.pokemon_id);
          if (existing) {
            existing.count += 1;
            const date = new Date(c.caught_at);
            if (date > existing.caughtAt) existing.caughtAt = date;
          } else {
            map.set(c.pokemon_id, {
              caughtAt: new Date(c.caught_at),
              count: 1,
            });
          }
        }
        setCaughtMap(map);
        setLoading(false);
      },
    );
  }, [fetchGetArray]);

  if (loading) return <Loading />;

  return (
    <div className={styles.pokedex}>
      <h1>POKÉDEX</h1>
      <div className={styles.grid}>
        {pokemon.map(p => {
          const entry = caughtMap.get(p.id);
          return (
            <div
              key={p.id}
              className={`${styles.card} ${!entry ? styles.uncaught : ''}`}>
              <span className={styles.id}>
                #{String(p.id).padStart(4, '0')}
              </span>
              {entry && entry.count > 1 && (
                <span className={styles.count}>x{entry.count}</span>
              )}
              <img src={p.sprite} alt={p.name} className={styles.sprite} />
              {entry && (
                <span className={styles.name}>{formatPokemonName(p.name)}</span>
              )}
              <div className={styles.types}>
                {p.types.map(type => (
                  <span key={type} className={`${styles.type} ${styles[type]}`}>
                    {type}
                  </span>
                ))}
              </div>
              {entry && (
                <div className={styles.caught}>
                  <img
                    src={POKEMON_URLS.POKEBALL_IMAGE}
                    alt="Pokéball"
                    className={styles.pokeball}
                  />
                  <span>{formatDate(entry.caughtAt)}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
