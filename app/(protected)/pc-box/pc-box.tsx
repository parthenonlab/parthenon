'use client';

import { useEffect, useState } from 'react';

import { Catch } from '@parthenonlab/types';
import { Loading } from '@/components';
import { POKEMON_TYPE_MAP, POKEMON_URLS } from '@/constants/pokemon';
import { useFetch, useParthenon } from '@/hooks';
import { formatDate, formatPokemonName } from '@/lib/utils';

import styles from './page.module.scss';

interface Pokemon {
  id: number;
  name: string;
  sprite: string;
  types: string[];
}

const fetchAllPokemon = async (): Promise<Map<number, Pokemon>> => {
  const listRes = await fetch(`${POKEMON_URLS.POKEAPI}?limit=151`);
  const list = await listRes.json();

  const map = new Map<number, Pokemon>();
  list.results.forEach((entry: { name: string; url: string }, i: number) => {
    map.set(i + 1, {
      id: i + 1,
      name: entry.name,
      sprite: `${POKEMON_URLS.POKEMONDB}/${entry.name}.png`,
      types: POKEMON_TYPE_MAP[entry.name] ?? [],
    });
  });
  return map;
};

const getBoxCapacity = (subscriber: boolean, linked: boolean) => {
  let capacity = subscriber ? 300 : 30;
  if (linked) capacity += 50;
  return capacity;
};

export const PcBox = () => {
  const { fetchGetArray } = useFetch();
  const { user } = useParthenon();
  const [pokemonMap, setPokemonMap] = useState<Map<number, Pokemon>>(new Map());
  const [catches, setCatches] = useState<Catch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchAllPokemon(), fetchGetArray<Catch>('/api/catches')]).then(
      ([allPokemon, allCatches]) => {
        setPokemonMap(allPokemon);
        setCatches(allCatches.sort((a, b) => new Date(b.caught_at).getTime() - new Date(a.caught_at).getTime()));
        setLoading(false);
      },
    );
  }, [fetchGetArray]);

  if (loading) return <Loading />;

  const linked = !!(user?.discord_id && user?.twitch_id);
  const capacity = getBoxCapacity(user?.subscriber ?? false, linked);
  const unique = new Set(catches.map(c => c.pokemon_id)).size;

  return (
    <div className={styles.pcBox}>
      <h1>PC BOX</h1>
      <p className={styles.subtitle}>
        Caught: {catches.length} | Unique: {unique} | Available Space: {capacity - catches.length}
      </p>
      <div className={styles.grid}>
        {catches.map(c => {
          const pokemon = pokemonMap.get(c.pokemon_id);
          if (!pokemon) return null;
          return (
            <div key={c.catch_id} className={`${styles.card} ${c.shiny ? styles.shiny : ''}`}>
              {c.favorite && <span className={styles.favorite}>★</span>}
              <img src={pokemon.sprite} alt={pokemon.name} className={styles.sprite} />
              <span className={styles.name}>{formatPokemonName(pokemon.name)}</span>
              <div className={styles.types}>
                {pokemon.types.map(type => (
                  <span key={type} className={`${styles.type} ${styles[type]}`}>
                    {type}
                  </span>
                ))}
              </div>
              <div className={styles.meta}>
                {c.gender && <span className={styles.gender}>{c.gender === 'female' ? '♀' : '♂'}</span>}
                {c.shiny && <span className={styles.shinyBadge}>✦</span>}
              </div>
              <div className={styles.caught}>
                <img
                  src={POKEMON_URLS.POKEBALL_IMAGE}
                  alt="Pokéball"
                  className={styles.pokeball}
                />
                <span>{formatDate(new Date(c.caught_at))}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
